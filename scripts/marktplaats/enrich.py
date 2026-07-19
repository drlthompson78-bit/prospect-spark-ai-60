#!/usr/bin/env python3
"""Stage 3: normalize the raw fetched records, classify price segments, and
write the CSV + scatter data + text summary. Pure logic, no network calls.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import statistics as stats
from collections import Counter
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
RAW_DIR = DATA_DIR / "raw"
OUTPUT_DIR = Path(__file__).parent / "output"

CSV_FIELDS = [
    "url", "title", "seller_name", "location", "type",
    "price_label", "price_value", "price_segment",
    "favorites", "views", "favorite_view_ratio",
    "account_age_raw", "posted_date_raw", "data_source", "extraction_warning",
    "seller_ad_count",
]

FREE_WORDS = ("gratis", "free")
BID_WORDS = ("bieden", "n.o.t.k", "notk", "offer")
DESC_WORDS = ("zie omschrijving", "zie beschrijving", "see description")
MONTHLY_WORDS = ("p/m", "per maand", "/maand", "pm", "per month")

TYPE_KEYWORDS = {
    "Webhosting": ["hosting", "webhost"],
    "Domeinregistratie": ["domein", "domain"],
    "SEO": ["seo", "zoekmachine"],
    "Website Bouw": ["website bouwen", "website laten maken", "webbouw", "bouw"],
    "Webdesign": ["webdesign", "website ontwerp", "vormgeving"],
}


PRICE_DICT_CENT_KEYS = ("pricecents", "cents", "amountcents")
PRICE_DICT_EURO_KEYS = ("amount", "value", "price", "priceamount")


def normalize_price(price_raw, listing_price_hint) -> tuple[str, float | None]:
    """Returns (label, numeric_value_in_euros_or_None)."""
    raw = price_raw if price_raw not in (None, "") else listing_price_hint
    if raw is None:
        return "onbekend", None

    if isinstance(raw, (int, float)):
        return "vast", float(raw)

    if isinstance(raw, dict):
        lower = {k.lower(): v for k, v in raw.items()}
        for k in PRICE_DICT_CENT_KEYS:
            if isinstance(lower.get(k), (int, float)):
                return "vast", round(lower[k] / 100, 2)
        for k in PRICE_DICT_EURO_KEYS:
            if isinstance(lower.get(k), (int, float)):
                return "vast", float(lower[k])
        # unrecognized dict shape — don't guess a number from it
        type_hint = str(lower.get("type") or lower.get("pricetype") or "").lower()
        if any(w in type_hint for w in BID_WORDS):
            return "bieden", None
        return "onbekend", None

    text = str(raw).strip().lower()
    if not text:
        return "onbekend", None
    if any(w in text for w in FREE_WORDS):
        return "gratis", 0.0
    if any(w in text for w in BID_WORDS):
        return "bieden", None
    if any(w in text for w in DESC_WORDS):
        return "zie_omschrijving", None

    numbers = re.findall(r"[\d.,]+", text)
    numeric_value = None
    if numbers:
        cleaned = numbers[0].replace(".", "").replace(",", ".")
        try:
            numeric_value = float(cleaned)
        except ValueError:
            numeric_value = None

    if any(w in text for w in MONTHLY_WORDS):
        return "abonnement", numeric_value
    if numeric_value is not None:
        return "vast", numeric_value
    return "onbekend", None


def price_segment(label: str, value: float | None) -> str:
    if label == "abonnement":
        return "Abonnement"
    if label in ("bieden", "zie_omschrijving", "onbekend") or value is None:
        return "Onbekend"
    if value <= 150:
        return "Instap/impuls"
    if value <= 350:
        return "Basis"
    if value <= 750:
        return "Middensegment"
    return "Hoog"


def classify_type(title: str | None, category_raw: str | None) -> str:
    for text in (title or "").lower(), (category_raw or "").lower():
        for label, keywords in TYPE_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                return label
    return "Onbekend"


def to_int(value):
    if value is None:
        return None
    try:
        return int(re.sub(r"[^\d]", "", str(value)) or 0)
    except ValueError:
        return None


def load_records() -> list[dict]:
    records = []
    if not RAW_DIR.exists():
        raise SystemExit(f"{RAW_DIR} not found — run discover.py and fetch_details.py first")
    for path in sorted(RAW_DIR.glob("*.json")):
        raw = json.loads(path.read_text())
        if "error" in raw:
            continue
        records.append(raw)
    return records


def seller_key(seller_name) -> str:
    """Normalize a seller name for grouping/dedup ('' for unknown sellers,
    which are never merged with each other)."""
    return (seller_name or "").strip().lower()


def dedupe_by_seller(rows: list[dict]) -> list[dict]:
    """Collapse to one row per seller — the seller's ad with the most
    favorites — so a seller running many near-identical listings doesn't
    dominate segment/aggregate stats. Ads with no known seller_name are kept
    as-is (nothing to merge them by)."""
    best_per_seller: dict[str, dict] = {}
    unknown_seller_rows = []
    for r in rows:
        key = seller_key(r["seller_name"])
        if not key:
            unknown_seller_rows.append(r)
            continue
        current = best_per_seller.get(key)
        if current is None or (r["favorites"] or -1) > (current["favorites"] or -1):
            best_per_seller[key] = r
    return list(best_per_seller.values()) + unknown_seller_rows


def enrich(records: list[dict]) -> list[dict]:
    seller_counts = Counter(seller_key(r.get("seller_name")) for r in records)
    rows = []
    for r in records:
        label, value = normalize_price(r.get("price_raw"), r.get("listing_price_hint"))
        favorites = to_int(r.get("favorites"))
        views = to_int(r.get("views"))
        ratio = round(favorites / views, 4) if favorites is not None and views else None
        key = seller_key(r.get("seller_name"))
        rows.append({
            "url": r.get("url"),
            "title": r.get("title"),
            "seller_name": r.get("seller_name"),
            "location": r.get("location"),
            "type": classify_type(r.get("title"), r.get("category_raw")),
            "price_label": label,
            "price_value": value,
            "price_segment": price_segment(label, value),
            "favorites": favorites,
            "views": views,
            "favorite_view_ratio": ratio,
            "account_age_raw": r.get("account_age_raw"),
            "posted_date_raw": r.get("posted_date_raw"),
            "data_source": r.get("source"),
            "extraction_warning": r.get("extraction_warning"),
            "seller_ad_count": seller_counts[key] if key else 1,
        })
    return rows


def write_csv(rows: list[dict]):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / "marktplaats_webdesign.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[enrich] wrote {len(rows)} rows to {path}")


def write_scatter_data(rows: list[dict]):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / "scatter_data.json"
    points = [
        {"price": r["price_value"], "favorites": r["favorites"], "type": r["type"], "title": r["title"]}
        for r in rows
        if r["price_value"] is not None and r["favorites"] is not None
    ]
    path.write_text(json.dumps(points, ensure_ascii=False, indent=2))
    print(f"[enrich] wrote {len(points)} scatter points to {path}")


def write_summary(rows: list[dict]):
    deduped = dedupe_by_seller(rows)
    n_multi_sellers = sum(1 for r in rows if r["seller_ad_count"] > 1)

    lines = []
    lines.append("Marktplaats webdesign-categorie — positioneringsanalyse")
    lines.append(f"Aantal geanalyseerde advertenties: {len(rows)}")
    lines.append(
        f"Aantal unieke aanbieders (na ontdubbelen): {len(deduped)} "
        f"({n_multi_sellers} advertenties komen van een aanbieder met >1 advertentie in de dataset)"
    )
    lines.append("")

    lines.append("== Favorieten per prijssegment (ontdubbeld per aanbieder — 1 advertentie/aanbieder, de beste) ==")
    segments = ["Instap/impuls", "Basis", "Middensegment", "Hoog", "Abonnement", "Onbekend"]
    for seg in segments:
        favs = [r["favorites"] for r in deduped if r["price_segment"] == seg and r["favorites"] is not None]
        if not favs:
            lines.append(f"  {seg}: geen data")
            continue
        lines.append(
            f"  {seg} (n={len(favs)}): gemiddeld={stats.mean(favs):.1f}, mediaan={stats.median(favs):.1f}"
        )
    lines.append("")

    def seller_flag(r):
        return f"  [{r['seller_ad_count']}x deze aanbieder]" if r["seller_ad_count"] > 1 else ""

    with_favs = [r for r in rows if r["favorites"] is not None]
    top_absolute = sorted(with_favs, key=lambda r: r["favorites"], reverse=True)[:10]
    lines.append("== Top 10 op absolute favorieten (alle advertenties, niet ontdubbeld) ==")
    for r in top_absolute:
        lines.append(f"  {r['favorites']:>4}  {r['price_segment']:<15}  {r['title']}  ({r['url']}){seller_flag(r)}")
    lines.append("")

    with_ratio = [r for r in rows if r["favorite_view_ratio"] is not None]
    top_ratio = sorted(with_ratio, key=lambda r: r["favorite_view_ratio"], reverse=True)[:10]
    lines.append("== Top 10 op favoriet/view-ratio (alle advertenties, niet ontdubbeld) ==")
    for r in top_ratio:
        lines.append(
            f"  {r['favorite_view_ratio']:.3f}  ({r['favorites']}/{r['views']})  {r['price_segment']:<15}  {r['title']}  ({r['url']}){seller_flag(r)}"
        )
    lines.append("")

    missing_favs = sum(1 for r in rows if r["favorites"] is None)
    missing_views = sum(1 for r in rows if r["views"] is None)
    missing_price = sum(1 for r in rows if r["price_value"] is None and r["price_label"] not in ("bieden", "gratis"))
    warned = [r for r in rows if r["extraction_warning"]]
    lines.append("== Data-dekking ==")
    lines.append(f"  ontbrekende favorieten: {missing_favs}/{len(rows)}")
    lines.append(f"  ontbrekende views: {missing_views}/{len(rows)}")
    lines.append(f"  ontbrekende/onbekende prijs: {missing_price}/{len(rows)}")
    lines.append(f"  advertenties met ontbrekende verkoper/plaats/accountleeftijd/datum: {len(warned)}/{len(rows)}")
    for r in warned[:20]:
        lines.append(f"    - {r['url']}: {r['extraction_warning']}")
    if len(warned) > 20:
        lines.append(f"    ... en nog {len(warned) - 20} meer (zie extraction_warning-kolom in de CSV)")
    lines.append("")

    lines.append("== Waarschuwingen bij interpretatie ==")
    lines.append("  - Accountleeftijd zegt weinig over webdesign-competentie (algemene accounts); licht wegen.")
    lines.append("  - Favorieten meten interesse, niet conversie.")
    lines.append("  - Ratio is sterker signaal dan absoluut aantal favorieten.")
    lines.append("  - Vakgenoten bewaren ook advertenties van concurrenten; bij lage aantallen kan dit meetellen.")

    text = "\n".join(lines)
    path = OUTPUT_DIR / "summary.txt"
    path.write_text(text)
    print(text)
    print(f"\n[enrich] wrote summary to {path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    records = load_records()
    rows = enrich(records)
    write_csv(rows)
    write_scatter_data(rows)
    write_summary(rows)


if __name__ == "__main__":
    main()
