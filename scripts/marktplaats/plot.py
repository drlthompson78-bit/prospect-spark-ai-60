#!/usr/bin/env python3
"""Optional stage 4: render the price x favorites scatter from
output/scatter_data.json to a PNG. Colour-coded by type.

Run locally after enrich.py:
    pip install matplotlib
    python3 plot.py

Pure local rendering, no network. Writes output/scatter.png.
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # headless: write a file, don't open a window
import matplotlib.pyplot as plt

OUTPUT_DIR = Path(__file__).parent / "output"
SCATTER_JSON = OUTPUT_DIR / "scatter_data.json"

TYPE_COLORS = {
    "Website Bouw": "#2563eb",
    "Webdesign": "#16a34a",
    "Webhosting": "#ea580c",
    "Domeinregistratie": "#9333ea",
    "SEO": "#dc2626",
    "Onbekend": "#9ca3af",
}

# Price-segment boundaries (see enrich.py) drawn as reference lines.
SEGMENT_BOUNDS = [150, 350, 750]


def main():
    if not SCATTER_JSON.exists():
        raise SystemExit(f"{SCATTER_JSON} niet gevonden — draai eerst enrich.py")

    points = json.loads(SCATTER_JSON.read_text())
    if not points:
        raise SystemExit("scatter_data.json is leeg")

    fig, ax = plt.subplots(figsize=(11, 7))

    # group by type so the legend is clean
    by_type: dict[str, list] = {}
    for p in points:
        by_type.setdefault(p["type"], []).append(p)

    for type_name, group in sorted(by_type.items()):
        xs = [g["price"] for g in group]
        ys = [g["favorites"] for g in group]
        ax.scatter(
            xs, ys,
            s=36, alpha=0.6,
            color=TYPE_COLORS.get(type_name, "#9ca3af"),
            edgecolors="white", linewidths=0.4,
            label=f"{type_name} (n={len(group)})",
        )

    for bound in SEGMENT_BOUNDS:
        ax.axvline(bound, color="#d1d5db", linestyle="--", linewidth=0.8, zorder=0)

    # The distribution is extreme on both axes (a few viral ads, a few
    # high-priced ones); a symlog y keeps the mass readable without hiding
    # the outliers. Comment this out for a plain linear view.
    ax.set_yscale("symlog", linthresh=10)

    ax.set_xlabel("Prijs (€)")
    ax.set_ylabel("Favorieten (symlog)")
    ax.set_title("Marktplaats webdesign — prijs vs. favorieten, per type")
    ax.legend(loc="upper right", fontsize=8, framealpha=0.9)
    ax.grid(True, alpha=0.2)

    out = OUTPUT_DIR / "scatter.png"
    fig.tight_layout()
    fig.savefig(out, dpi=150)
    print(f"[plot] wrote {out}  ({len(points)} punten)")


if __name__ == "__main__":
    main()
