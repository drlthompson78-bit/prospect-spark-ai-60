"""Shared helpers for the Marktplaats webdesign one-off market scan.

NOT verified against the live site: this pipeline was written in a sandbox
with no outbound network access to marktplaats.nl. Selectors and JSON key
aliases are best-effort guesses based on how Marktplaats and similar
classifieds sites typically ship data. Run `discover.py --debug-dump-first`
before a real run and inspect the saved HTML/JSON to confirm (see README).
"""
from __future__ import annotations

import json
import random
import re
import time
import unicodedata

import requests

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
}
DELAY_RANGE = (2.0, 3.0)

_playwright_browser = None


def polite_sleep():
    time.sleep(random.uniform(*DELAY_RANGE))


def slugify(url: str) -> str:
    tail = url.rstrip("/").rsplit("/", 1)[-1]
    tail = unicodedata.normalize("NFKD", tail).encode("ascii", "ignore").decode()
    tail = re.sub(r"[^a-zA-Z0-9_-]+", "-", tail).strip("-")
    return tail[:120] or "item"


def fetch_html(url: str, timeout: int = 20) -> tuple[str | None, int | None]:
    """Fetch a URL's HTML. Tries plain requests first, falls back to a real
    browser (Playwright) if the response looks blocked or JS-gated.

    Returns (html, status_code). html is None if both approaches failed.
    """
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        status = resp.status_code
        if status == 200 and _looks_usable(resp.text):
            return resp.text, status
    except requests.RequestException:
        status = None

    html = _fetch_via_playwright(url, timeout)
    return html, (200 if html else status)


def _looks_usable(html: str) -> bool:
    if len(html) < 2000:
        return False
    lowered = html.lower()
    blocked_markers = ("access denied", "are you a robot", "captcha", "reference #")
    return not any(marker in lowered for marker in blocked_markers)


def _fetch_via_playwright(url: str, timeout: int) -> str | None:
    global _playwright_browser
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    try:
        if _playwright_browser is None:
            _pw = sync_playwright().start()
            _playwright_browser = _pw.chromium.launch(headless=True)
        page = _playwright_browser.new_page(user_agent=USER_AGENT, locale="nl-NL")
        page.goto(url, timeout=timeout * 1000, wait_until="networkidle")
        html = page.content()
        page.close()
        return html
    except Exception:
        return None


# --- Generic JSON-blob extraction -------------------------------------------------
#
# Marktplaats (like most modern SPAs) ships page data as JSON embedded in a
# <script> tag (e.g. __NEXT_DATA__ or a window.__STATE__ assignment) rather
# than as plain HTML. We don't know the exact shape, so instead of hardcoding
# a schema we scan every script tag for parseable JSON and then walk it
# looking for keys that plausibly match the field we want.

_SCRIPT_JSON_RE = re.compile(r"<script[^>]*>(.*?)</script>", re.DOTALL | re.IGNORECASE)
_ASSIGNMENT_RE = re.compile(r"=\s*(\{.*\}|\[.*\])\s*;?\s*$", re.DOTALL)


def extract_json_blobs(html: str) -> list:
    """Return every JSON-parseable object/array found in <script> tags."""
    blobs = []
    for match in _SCRIPT_JSON_RE.finditer(html):
        content = match.group(1).strip()
        if not content:
            continue
        candidates = [content]
        assign_match = _ASSIGNMENT_RE.search(content)
        if assign_match:
            candidates.append(assign_match.group(1))
        for candidate in candidates:
            try:
                blobs.append(json.loads(candidate))
                break
            except (json.JSONDecodeError, ValueError):
                continue
    return blobs


def deep_find_all(obj, key_aliases: set[str], _out=None):
    """Walk a nested dict/list and collect every value whose key matches one
    of the given aliases (case-insensitive)."""
    if _out is None:
        _out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(k, str) and k.lower() in key_aliases:
                _out.append(v)
            deep_find_all(v, key_aliases, _out)
    elif isinstance(obj, list):
        for item in obj:
            deep_find_all(item, key_aliases, _out)
    return _out


def deep_find_first(obj, key_aliases: set[str]):
    found = deep_find_all(obj, key_aliases)
    return found[0] if found else None


def deep_find_dicts_with_keys(obj, required_keys: set[str], _out=None):
    """Find every nested dict that plausibly represents 'one listing' by
    containing at least most of the given required keys (case-insensitive)."""
    if _out is None:
        _out = []
    if isinstance(obj, dict):
        lower_keys = {k.lower() for k in obj.keys() if isinstance(k, str)}
        if len(lower_keys & required_keys) >= max(2, len(required_keys) - 1):
            _out.append(obj)
        for v in obj.values():
            deep_find_dicts_with_keys(v, required_keys, _out)
    elif isinstance(obj, list):
        for item in obj:
            deep_find_dicts_with_keys(item, required_keys, _out)
    return _out
