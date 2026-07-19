#!/usr/bin/env python3
"""Stage 2: visit every discovered ad URL and save its raw extracted data.

Resumable: each ad is cached as data/raw/<slug>.json; already-fetched ads are
skipped, so an interrupted run can just be re-launched.

Prefers JSON embedded in the page (see common.extract_json_blobs) over HTML
selectors, per the brief. Falls back to best-effort HTML/meta-tag scraping
when no usable JSON is found — those fields will be left as None rather than
guessed, and printed in the run summary so gaps are visible.

NOT verified live (sandbox network access to marktplaats.nl is blocked) —
run --debug-dump-first and inspect data/debug/ before trusting output on a
real run. See README.md.
"""
from __future__ import annotations

import argparse
import html as html_module
import json
import random
import re
from pathlib import Path

from bs4 import BeautifulSoup

from common import deep_find_dicts_with_keys, deep_find_first, extract_json_blobs, fetch_html, polite_sleep, slugify

DATA_DIR = Path(__file__).parent / "data"
URLS_FILE = DATA_DIR / "ad_urls.jsonl"
RAW_DIR = DATA_DIR / "raw"
DEBUG_DIR = DATA_DIR / "debug"

# key aliases we look for when walking the embedded JSON of an ad detail page
TITLE_KEYS = {"title"}
SELLER_NAME_KEYS = {"sellername", "name", "displayname"}
LOCATION_KEYS = {"city", "location", "cityname"}
PRICE_KEYS = {"priceinfo", "price"}
FAVORITE_KEYS = {"favoritecount", "favouritecount", "bookmarkcount", "savedcount", "hearts"}
VIEW_KEYS = {"viewcount", "views", "viewscount"}
CATEGORY_KEYS = {"categoryname", "category", "l1categoryname", "l2categoryname"}
ACCOUNT_AGE_KEYS = {"sinceyear", "memberssince", "registrationdate", "accountage"}
DATE_KEYS = {"date", "createddate", "publisheddate", "adstart"}
ITEM_DICT_MARKERS = {"title", "priceinfo", "sellerinformation", "description"}

# Confirmed live 2026-07: views + favorites aren't in embedded JSON on the
# detail page — they're plain text inside a "Report-stats" block's
# aria-label, e.g.: aria-label="1583 keer gezien 11 keer bewaard sinds30 jan
# '26, 21:40". This is more reliable than the JSON approach for these two
# fields, so it's applied regardless of whether JSON parsing also succeeded.
STATS_RE = re.compile(
    r"aria-label=\"(?P<views>\d+)\s*keer gezien\s*(?P<favorites>\d+)\s*keer bewaard\s*sinds(?P<posted>[^\"]*)\""
)


def extract_stats_from_html(html: str) -> dict | None:
    match = STATS_RE.search(html)
    if not match:
        return None
    posted = html_module.unescape(match.group("posted")).strip()
    return {
        "views": int(match.group("views")),
        "favorites": int(match.group("favorites")),
        "posted_date_raw": posted or None,
    }


class FieldExtractionError(Exception):
    """A field expected on every detail page wasn't found. Caught per-ad by
    fetch_all so one oddly-formatted ad can't kill a multi-hour batch run —
    but the gap is recorded loudly (extraction_warning) rather than silently
    left as null."""


# Confirmed live 2026-07 against ad m2361340022 (seller="Tom",
# location="Doetinchem", account_age=13, posted="30 jan '26"):
#   - seller name: an <a href="#verkoper" role="link">NAME</a> link
#   - location: a "cityName":"CITY" fragment (not inside a clean <script>
#     JSON blob — embedded directly in an HTML attribute — so this is
#     matched directly against the raw HTML rather than via
#     common.extract_json_blobs)
#   - account age: "N jaar op Marktplaats" plain text
#   - posted date: <div class="Report-label">Sinds <b>DATE</b></div>
#     (distinct from — and more precise than — the "sinds..." fragment in
#     the Report-stats aria-label, which is the same moment but bundled
#     with a timestamp)
SELLER_NAME_RE = re.compile(r'href="#verkoper"[^>]*>([^<]+)</a>')
CITY_NAME_RE = re.compile(r'"cityName":"([^"]+)"')
# Fallback for sellers with no fixed city (e.g. "Bezorgt in heel Nederland" /
# nationwide-service sellers) — same visible div, but no cityName JSON
# fragment exists for them since it genuinely doesn't apply.
LOCATION_TEXT_RE = re.compile(r'SellerLocationSection-locationName[^"]*">([^<]+)<')
# Account age uses whatever time unit fits: seen live as "13 jaar",
# "2 weken", "3 dagen", "N maanden op Marktplaats". Match the number + any
# unit word generically (rather than an enumerated list) so no seller is
# silently dropped from this field, and store the full phrase incl. unit —
# storing only the number would put "2" (weken) and "13" (jaar) in one
# column and misleadingly rank a 2-week account as "younger" than nothing.
ACCOUNT_AGE_RE = re.compile(r"(\d+)\s*(\w+)\s*op Marktplaats")
POSTED_DATE_RE = re.compile(r'Report-label">Sinds\s*<b>([^<]+)</b>')


def extract_seller_fields(html: str) -> dict:
    seller_match = SELLER_NAME_RE.search(html)
    location_match = CITY_NAME_RE.search(html) or LOCATION_TEXT_RE.search(html)
    age_match = ACCOUNT_AGE_RE.search(html)
    date_match = POSTED_DATE_RE.search(html)

    missing = [
        name
        for name, m in (
            ("seller_name", seller_match),
            ("location", location_match),
            ("account_age", age_match),
            ("posted_date", date_match),
        )
        if not m
    ]
    if missing:
        raise FieldExtractionError(f"veld(en) niet gevonden op pagina: {', '.join(missing)}")

    return {
        "seller_name": html_module.unescape(seller_match.group(1)).strip(),
        "location": html_module.unescape(location_match.group(1)).strip(),
        "account_age_raw": f"{age_match.group(1)} {age_match.group(2)}",
        "posted_date_raw": html_module.unescape(date_match.group(1)).strip(),
    }


def load_urls() -> list[dict]:
    if not URLS_FILE.exists():
        raise SystemExit(f"{URLS_FILE} not found — run discover.py first")
    return [json.loads(line) for line in URLS_FILE.read_text().splitlines() if line.strip()]


def already_fetched(slug: str) -> bool:
    return (RAW_DIR / f"{slug}.json").exists()


def parse_detail_json(blobs) -> dict | None:
    item_dicts = []
    for blob in blobs:
        item_dicts.extend(deep_find_dicts_with_keys(blob, ITEM_DICT_MARKERS))
    if not item_dicts:
        return None
    # combine all matched sub-dicts so we can pull whichever fields exist
    merged_search_space = item_dicts

    def find(keys):
        for d in merged_search_space:
            val = deep_find_first(d, keys)
            if val is not None:
                return val
        return None

    return {
        "title": find(TITLE_KEYS),
        "seller_name": find(SELLER_NAME_KEYS),
        "location": find(LOCATION_KEYS),
        "price_raw": find(PRICE_KEYS),
        "favorites": find(FAVORITE_KEYS),
        "views": find(VIEW_KEYS),
        "category_raw": find(CATEGORY_KEYS),
        "account_age_raw": find(ACCOUNT_AGE_KEYS),
        "posted_date_raw": find(DATE_KEYS),
        "source": "json",
    }


def parse_detail_html_fallback(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    def meta(prop):
        tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name": prop})
        return tag.get("content") if tag else None

    return {
        "title": meta("og:title") or (soup.title.string.strip() if soup.title else None),
        "seller_name": None,
        "location": None,
        "price_raw": meta("product:price:amount") or meta("og:price:amount"),
        "favorites": None,
        "views": None,
        "category_raw": None,
        "account_age_raw": None,
        "posted_date_raw": None,
        "source": "html_fallback",
    }


def fetch_all(limit: int | None, sample: int | None, debug_dump_first: bool):
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    ads = load_urls()

    if sample and sample < len(ads):
        random.seed(42)
        ads = random.sample(ads, sample)
        print(f"[fetch] sampling {sample} of the discovered ads (seed=42, reproducible)")

    if limit:
        ads = ads[:limit]

    fetched, skipped, failed = 0, 0, 0
    first_dump_done = False

    for i, ad in enumerate(ads, 1):
        url = ad["url"]
        slug = slugify(url)
        if already_fetched(slug):
            skipped += 1
            continue

        print(f"[fetch] ({i}/{len(ads)}) {url}")
        html, status = fetch_html(url)

        if debug_dump_first and not first_dump_done and html:
            DEBUG_DIR.mkdir(parents=True, exist_ok=True)
            (DEBUG_DIR / "detail_page1.html").write_text(html)
            print(f"[fetch] wrote debug HTML to {DEBUG_DIR / 'detail_page1.html'}")
            first_dump_done = True

        if not html:
            print(f"[fetch]   FAILED (status={status})")
            failed += 1
            (RAW_DIR / f"{slug}.json").write_text(json.dumps({"url": url, "error": f"fetch failed, status={status}"}))
            polite_sleep()
            continue

        blobs = extract_json_blobs(html)
        record = parse_detail_json(blobs)
        if record is None:
            record = parse_detail_html_fallback(html)

        stats = extract_stats_from_html(html)
        if stats:
            record["views"] = record.get("views") or stats["views"]
            record["favorites"] = record.get("favorites") or stats["favorites"]
            record["posted_date_raw"] = record.get("posted_date_raw") or stats["posted_date_raw"]

        try:
            seller_fields = extract_seller_fields(html)
            record["seller_name"] = seller_fields["seller_name"]
            record["location"] = seller_fields["location"]
            record["account_age_raw"] = seller_fields["account_age_raw"]
            record["posted_date_raw"] = seller_fields["posted_date_raw"]  # more precise than the stats-block fallback
        except FieldExtractionError as e:
            print(f"[fetch]   WAARSCHUWING: {e} ({url})")
            record["extraction_warning"] = str(e)

        record["url"] = url
        record["listing_price_hint"] = ad.get("listing_price_hint")
        (RAW_DIR / f"{slug}.json").write_text(json.dumps(record, ensure_ascii=False, indent=2))
        fetched += 1
        polite_sleep()

    print(f"[fetch] done: {fetched} fetched, {skipped} already cached, {failed} failed")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=None, help="only process the first N ads (testing)")
    parser.add_argument(
        "--sample",
        type=int,
        default=None,
        help="randomly sample N ads instead of the full set (use if the full ~370 draws too much bot-detection heat)",
    )
    parser.add_argument("--debug-dump-first", action="store_true", help="save the first fetched detail page's HTML for inspection")
    args = parser.parse_args()
    fetch_all(args.limit, args.sample, args.debug_dump_first)


if __name__ == "__main__":
    main()
