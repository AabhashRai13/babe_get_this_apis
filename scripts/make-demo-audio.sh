#!/usr/bin/env bash
# Generate demo grocery voice notes for testing POST /transcribe.
# macOS only (uses the built-in `say` + `afconvert` — no installs needed).
# Output: demo_audio/*.m4a  (m4a is accepted by Groq Whisper and the upload filter)
set -euo pipefail

OUT_DIR="${1:-demo_audio}"
mkdir -p "$OUT_DIR"

# Phrases chosen to stress the extractor with ambiguity:
#  - store nicknames (wollies/woolies, dan's, bunnos, big w, bws)
#  - location-vs-note traps (aisle 4, top shelf, the freezer, asian aisle, near
#    the back all belong in `note`, NOT `location`)
#  - mid-sentence location overrides ("...from pet stock, no the fish is deli")
#  - speech-to-text homophones (thyme/time, flour/flower, leek/leak, VB)
#  - vague quantities (a couple, half a kilo, a dozen, a slab, a carton)
# Each line becomes demo<N>.m4a, in order — keep it lined up with eval/cases.json.
phrases=(
  "6 packs of beer very chilled get them from dan murphy, 2 bottles of soju nice ones also from dan murphy"
  "pork and chicken they are in wollies, a dozen eggs cage free and 2 litres of milk also from woolies"
  "chicken feet they are in aisle 4, and grab cheap dog food from petbarn"
  "protein shake from chemist warehouse, a loaf of bread skip if unavailable, and bananas"
  "a couple of avocados from harris farm, they must be ripe"
  "nappies and baby wipes from big w, the cheap home brand ones"
  "half a kilo of prawns from the fishmonger, and some lemons"
  "2 sourdough loaves from the bakery, they are on the top shelf"
  "a bottle of shiraz from dan's, and a bag of ice from the servo"
  "toilet paper and dish soap from coles, 24 rolls"
  "fresh thyme and basil from the produce aisle at woolies"
  "a dozen hot cross buns from the bakery, and unsalted butter"
  "2 kilos of flour the plain kind from aldi"
  "cat litter from pet stock, and fish but the fish is from the deli"
  "coconut milk from the asian aisle, and rice"
  "a leek and 2 onions, the leek is near the back"
  "panadol and band aids from the chemist, chemist warehouse i mean"
  "frozen peas and a tub of ice cream from the freezer at coles"
  "a slab of VB and a carton of cider both from BWS"
  "screws and a hammer from bunnos, the long screws are in aisle 9"
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
