#!/usr/bin/env bash
# Send every demo clip to /transcribe and pretty-print the JSON response.
# Usage:
#   ./scripts/test-transcribe.sh                       # localhost:4827, demo_audio/
#   BASE_URL=https://<app>.up.railway.app ./scripts/test-transcribe.sh
#   ./scripts/test-transcribe.sh path/to/clips
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4827}"
DIR="${1:-demo_audio}"

for f in "$DIR"/*.m4a; do
  echo "=== $f ==="
  curl -sS -F "audio=@$f" "$BASE_URL/transcribe" | (jq . 2>/dev/null || cat)
  echo
done
