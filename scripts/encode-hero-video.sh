#!/usr/bin/env bash
# Her-encodeert de ruwe hero-film naar all-keyframe H.264 én tilt de bijna-witte
# studio-achtergrond naar zuiver wit, zodat mix-blend-mode: multiply hem in het
# lichte thema volledig met de paginakleur laat versmelten. Draai dit lokaal.
#
# Gebruik:  scripts/encode-hero-video.sh [pad-naar-ruwe-mp4]
set -euo pipefail

INPUT="${1:-motion/assets/loua-hero-scroll-raw.mp4}"
OUTPUT="public/hero/loua-scroll.mp4"
mkdir -p "$(dirname "$OUTPUT")"

# curves: alleen de highlights (achtergrond ~232-240) naar 255; taart-middentonen blijven
ffmpeg -y -i "$INPUT" -an \
  -vf "curves=r='0/0 0.5/0.5 0.91/1':g='0/0 0.5/0.5 0.894/1':b='0/0 0.5/0.5 0.871/1'" \
  -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT"

echo "All-keyframe hero-film met witte achtergrond weggeschreven naar $OUTPUT"
