#!/bin/zsh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${PROJECT_DIR}"

START_PORT="${AIMURA_PORT:-3000}"
PORT="${START_PORT}"

while lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:${PORT}"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required to run the Aimura AI interface."
  echo "Install Node.js from https://nodejs.org, then run this file again."
  read -r "?Press Return to close this window. "
  exit 1
fi

if [ ! -d "node_modules/next" ]; then
  echo "Installing Aimura AI web dependencies (first run only)..."
  npm install
fi

if [ "${PORT}" != "${START_PORT}" ]; then
  echo "Port ${START_PORT} is busy, so Aimura AI will use port ${PORT}."
fi

# Detect this Mac's Wi-Fi/LAN IP so a phone on the same network can connect.
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

echo ""
echo "============================================================"
echo "  Aimura AI is starting"
echo "  On this computer : ${URL}"
if [ -n "${LAN_IP}" ]; then
  echo "  On your phone    : http://${LAN_IP}:${PORT}"
  echo "  (Keep the phone on the same Wi-Fi network as this Mac.)"
fi
echo "============================================================"
echo ""

(
  for attempt in {1..90}; do
    if /usr/bin/python3 - "${URL}" >/dev/null 2>&1 <<'PY'
import sys
from urllib.request import Request, urlopen

request = Request(sys.argv[1], headers={"User-Agent": "AimuraAILauncher"})
with urlopen(request, timeout=1) as response:
    body = response.read(4096).decode("utf-8", "ignore")
    if response.status >= 400 or ("Aimura AI" not in body and "__next" not in body):
        raise SystemExit(1)
PY
    then
      open "${URL}"
      exit 0
    fi
    sleep 1
  done
  echo "Aimura AI did not become ready after 90 seconds. Try ${URL} manually."
) &

# Bind to 0.0.0.0 so both this computer and phones on the same Wi-Fi can open it.
exec npm run dev -- --hostname 0.0.0.0 --port "${PORT}"
