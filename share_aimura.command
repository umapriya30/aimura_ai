#!/bin/bash
# ============================================================
#  Aimura AI - Share with friends
#  Double-click this file. It starts Aimura AI and opens a
#  temporary PUBLIC link your friends can open in any browser,
#  on any device, anywhere - no install or account needed.
#  Keep this window open while they test. Press Ctrl+C to stop.
# ============================================================
cd "$(dirname "$0")" || exit 1

PORT=3000

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js is required. Install the LTS version from https://nodejs.org and try again."
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run: installing dependencies (a few minutes)..."
  npm install || { echo "Install failed - check your internet connection."; read -r -p "Press Enter to close."; exit 1; }
fi

echo "Starting Aimura AI on http://localhost:$PORT ..."
npm run dev -- --hostname 0.0.0.0 --port "$PORT" >/tmp/aimura-dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT

printf "Waiting for the app to be ready"
for _ in $(seq 1 40); do
  if curl -s "http://localhost:$PORT" >/dev/null 2>&1; then break; fi
  printf "."; sleep 1
done
echo

echo
echo "============================================================"
echo "  Creating a public link your friends can open..."
echo "  Share the https://... link that appears below."
echo "  KEEP THIS WINDOW OPEN. Press Ctrl+C when you're done."
echo "============================================================"
echo

if command -v cloudflared >/dev/null 2>&1; then
  cloudflared tunnel --url "http://localhost:$PORT"
else
  echo "(Using a no-install tunnel. For a more reliable link: 'brew install cloudflared')"
  echo
  npx -y localtunnel --port "$PORT"
fi
