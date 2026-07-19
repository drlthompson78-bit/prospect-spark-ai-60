#!/usr/bin/env python3
"""Stage 1: crawl the Marktplaats category overview pages and collect ad URLs.

Resumable: URLs already in data/ad_urls.jsonl are kept; run again to top up
after an interruption. Use --max-pages to cap how far it goes.

NOT verified live (sandbox has no network access to marktplaats.nl) — inspect
one page with --debug-dump-first before trusting the output. See README.md.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from common import deep_find_dicts_with_keys, extract_json_blobs, fetch_html, polite_sleep

CATEGORY_URL = "https://www.marktplaats.nl/l/diensten-en-vakmensen/webdesigners-en-hosting/"
DATA_DIR = Path(__file__).parent / "data"
URLS_FILE = DATA_DIR / "ad_urls.jsonl"
DEBUG_DIR = DATA_DIR / "debug"

# Marktplaats ad detail URLs conventionally look like /v/<category>/<id>-<slug>/
AD_LINK_RE = re.compile(r"^/v/[^/]+(/[^/]+)*/\d+-[^/]+/?$")

LISTING_JSON_KEYS = {"title", "priceinfo", "price", "itemid", "vipurl"}


def load_existing() -> dict:
    if not URLS_FILE.exists():
        return {}
    existing = {}
    for line in URLS_FILE.read_text().splitlines():
        if not line.strip():
            continue
        rec = json.loads(line)
        existing[rec["url"]] = rec
    return existing


def save_all(records: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with URLS_FILE.open("w") as f:
        for rec in records.values():
            f.write(json.dumps(rec) + "\n")


def extract_ads_from_json(blobs, base_url) -> list[dict]:
    found = []
    for blob in blobs:
        for item in deep_find_dicts_with_keys(blob, LISTING_JSON_KEYS):
            url = item.get("vipUrl") or item.get("url") or item.get("link")
            title = item.get("title")
            if not url or not title:
                continue
            found.append({
                "url": urljoin(base_url, url),
                "title": title,
                "listing_price_hint": item.get("priceInfo") or item.get("price"),
            })
    return found


def extract_ads_from_html(html: str, base_url: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if AD_LINK_RE.match(href.split("?")[0]):
            title = a.get_text(strip=True) or None
            found.append({"url": urljoin(base_url, href), "title": title, "listing_price_hint": None})
    return found


def discover(max_pages: int, debug_dump_first: bool) -> dict:
    existing = load_existing()
    seen_urls = set(existing.keys())
    page = 1
    consecutive_no_new = 0

    # Marktplaats paginates via a path segment (/p/2/), NOT a ?p= query
    # param (confirmed live 2026-07: ?p=N silently returns page 1 every
    # time, so the old query form collected only the first page's ads).
    while page <= max_pages and consecutive_no_new < 2:
        page_url = CATEGORY_URL if page == 1 else f"{CATEGORY_URL}p/{page}/"
        print(f"[discover] fetching page {page}: {page_url}")
        html, status = fetch_html(page_url)

        if debug_dump_first and page == 1 and html:
            DEBUG_DIR.mkdir(parents=True, exist_ok=True)
            (DEBUG_DIR / "overview_page1.html").write_text(html)
            print(f"[discover] wrote debug HTML to {DEBUG_DIR / 'overview_page1.html'}")

        if not html:
            print(f"[discover] page {page} failed to fetch (status={status}), stopping")
            break

        blobs = extract_json_blobs(html)
        ads = extract_ads_from_json(blobs, page_url)
        if not ads:
            ads = extract_ads_from_html(html, page_url)

        new_count = 0
        for ad in ads:
            if ad["url"] not in seen_urls:
                seen_urls.add(ad["url"])
                existing[ad["url"]] = ad
                new_count += 1

        print(f"[discover] page {page}: {len(ads)} ads found, {new_count} new")
        # Stop on consecutive pages that add nothing new — covers both a
        # genuinely exhausted category and a pagination format that silently
        # repeats page 1 (0 new, not 0 found).
        consecutive_no_new = consecutive_no_new + 1 if new_count == 0 else 0
        save_all(existing)
        page += 1
        if page <= max_pages:
            polite_sleep()

    save_all(existing)
    return existing


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max-pages", type=int, default=15, help="safety cap on overview pages")
    parser.add_argument(
        "--debug-dump-first",
        action="store_true",
        help="save the raw HTML of overview page 1 to data/debug/ for manual inspection",
    )
    args = parser.parse_args()

    records = discover(args.max_pages, args.debug_dump_first)
    print(f"[discover] done: {len(records)} ad URLs total in {URLS_FILE}")


if __name__ == "__main__":
    main()
