#!/usr/bin/env bash
# Her-encodeert de ruwe hero-film naar all-keyframe H.264, zodat scroll-scrubbing
# soepel loopt (elk frame direct seekbaar). Draai dit lokaal op je Mac.
#
# Gebruik:
#   1) Download de ruwe film naar motion/assets/loua-hero-scroll-raw.mp4
#      (URL krijg je van Claude na het genereren)
#   2) scripts/encode-hero-video.sh
set -euo pipefail

INPUT="${1:-motion/assets/loua-hero-scroll-raw.mp4}"
OUTPUT="public/hero/loua-scroll.mp4"
mkdir -p "$(dirname "$OUTPUT")"

ffmpeg -y -i "$INPUT" -an -c:v libx264 -preset slow -crf 18 \
  -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT"

echo "All-keyframe hero-film weggeschreven naar $OUTPUT"
