#!/usr/bin/env bash
# Generate demo grocery voice notes for testing POST /transcribe.
# macOS only (uses the built-in `say` + `afconvert` — no installs needed).
# Output: demo_audio/*.m4a  (m4a is accepted by Groq Whisper and the upload filter)
set -euo pipefail

OUT_DIR="${1:-demo_audio}"
mkdir -p "$OUT_DIR"

# Phrases chosen to exercise: quantities + units, unspecified quantity (null),
# categories, notes (preferences/conditions/substitutions), and STT errors.
phrases=(
  "two litres of milk and a dozen cage free eggs, not the caged kind"
  "I want sweet yogurt one litre, not sour, and if there is no sweet one no need to bring it"
  "get me some bananas, a loaf of bread, and a protein sake"
  "three cans of coke, a bag of frozen peas, and dish soap"
  "chicken breast about one kilo and two hundred grams of salmon, wild caught if possible"
)

i=1
for text in "${phrases[@]}"; do
  aiff="$(mktemp -t demo).aiff"
  out="$OUT_DIR/demo$i.m4a"
  say -o "$aiff" "$text"
  # AIFF -> AAC/m4a
  afconvert "$aiff" "$out" -f m4af -d aac >/dev/null
  rm -f "$aiff"
  echo "wrote $out  ←  \"$text\""
  i=$((i + 1))
done

echo "Done. ${#phrases[@]} clips in $OUT_DIR/"
