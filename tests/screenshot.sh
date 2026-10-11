#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${SKILL_FORGE_PORT:-4296}"
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
mkdir -p screenshots dist
if [[ ! -f dist/skill-forge.html ]]; then python3 build.py; fi
if ! ss -ltn | grep -q "127.0.0.1:$PORT "; then
  nohup python3 server.py > /tmp/skill-forge-$PORT.log 2>&1 &
  sleep 1
fi
shot() {
  local url="$1" out="$2" size="$3"; shift 3 || true
  local prof; prof="$(mktemp -d /tmp/sfshot.XXXX)"
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --run-all-compositor-stages-before-draw --virtual-time-budget=28000 \
    --window-size="$size" --user-data-dir="$prof" --screenshot="$out" "$@" "$url" >/dev/null 2>&1
  rm -rf "$prof"; echo "  $out ($(wc -c < "$out") bytes)"
}
U="http://127.0.0.1:$PORT"
shot "file://$PWD/dist/skill-forge.html#home" screenshots/00-best-home.png 1440,1100
shot "$U/#home" screenshots/00-desktop-home.png 1440,1000
shot "$U/#editor" screenshots/01-editor.png 1440,1100
shot "$U/#gallery" screenshots/02-gallery.png 1440,1100
shot "$U/#preview" screenshots/03-preview.png 1440,1000
shot "$U/#wire" screenshots/04-wire.png 1440,1000
shot "$U/#home" screenshots/05-phone.png 390,844 --user-agent="Mozilla/5.0 (iPhone)"
echo "screenshots done"
