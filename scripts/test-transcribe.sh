#!/usr/bin/env bash
# Send every demo clip to /transcribe and pretty-print the JSON response.
# /transcribe requires auth, so pass a Supabase access token via TOKEN, or every
# request comes back 401. Grab one from the browser test page while logged in:
#   (await supabase.auth.getSession()).data.session.access_token
# Usage:
#   TOKEN=eyJ... ./scripts/test-transcribe.sh                  # localhost:4827, demo_audio/
#   TOKEN=eyJ... BASE_URL=https://<app>.up.railway.app ./scripts/test-transcribe.sh
#   TOKEN=eyJ... ./scripts/test-transcribe.sh path/to/clips
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4827}"
DIR="${1:-demo_audio}"
TOKEN="${TOKEN:-}"

for f in "$DIR"/*.m4a; do
  echo "=== $f ==="
  curl -sS ${TOKEN:+-H "Authorization: Bearer $TOKEN"} -F "audio=@$f" "$BASE_URL/transcribe" | (jq . 2>/dev/null || cat)
  echo
done
