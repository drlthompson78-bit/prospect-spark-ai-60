#!/usr/bin/env bash
# Her-encodeert de ruwe hero-film naar all-keyframe H.264 en zet de
# studio-achtergrond om naar EXACT de paginakleur van het lichte thema
# (hsl(340 30% 98%) = rgb(251,248,249)). Daardoor is er geen blend nodig
# en toont geen enkele browser (ook Safari) een kleurverschil.
#
# Gebruik:  scripts/encode-hero-video.sh [pad-naar-ruwe-mp4]
set -euo pipefail

INPUT="${1:-motion/assets/loua-hero-scroll-raw.mp4}"
OUTPUT="public/hero/loua-scroll.mp4"
mkdir -p "$(dirname "$OUTPUT")"

# stap 1: highlights (achtergrond ~232-240) naar zuiver wit
# stap 2: wit schalen naar de paginakleur rgb(251,248,249)
ffmpeg -y -i "$INPUT" -an \
  -vf "curves=r='0/0 0.5/0.5 0.91/1':g='0/0 0.5/0.5 0.894/1':b='0/0 0.5/0.5 0.871/1',colorchannelmixer=rr=0.98431:gg=0.97255:bb=0.97647" \
  -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart "$OUTPUT"

echo "All-keyframe hero-film in paginakleur weggeschreven naar $OUTPUT"
