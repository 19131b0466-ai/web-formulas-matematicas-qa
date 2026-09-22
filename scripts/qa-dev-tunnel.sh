#!/usr/bin/env bash
# Expose local web-public (port 3000) for external QA (e.g. ChatGPT browsing).
# Prereqs: `pnpm dev` running (API :3001 + web :3000).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${QA_TUNNEL_PORT:-3000}"
CLOUDFLARED="${CLOUDFLARED_BIN:-/tmp/cloudflared}"
NGROK="${NGROK_BIN:-/tmp/ngrok}"

health() {
  curl -fsS "http://localhost:3001/v1/health" >/dev/null
  curl -fsS -o /dev/null "http://localhost:${PORT}/"
}

if ! health 2>/dev/null; then
  echo "ERROR: Start the stack first: cd $ROOT && pnpm dev"
  exit 1
fi

echo "Local stack OK (API :3001, web :${PORT})"

if [[ -n "${NGROK_AUTHTOKEN:-}" ]] && [[ -x "$NGROK" ]]; then
  echo "Starting ngrok on :${PORT} (dashboard http://127.0.0.1:4040)"
  "$NGROK" config add-authtoken "$NGROK_AUTHTOKEN" >/dev/null 2>&1 || true
  exec "$NGROK" http "$PORT"
fi

if [[ ! -x "$CLOUDFLARED" ]]; then
  echo "Downloading cloudflared to $CLOUDFLARED ..."
  curl -fsSL -o "$CLOUDFLARED" \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  chmod +x "$CLOUDFLARED"
fi

echo "Starting Cloudflare quick tunnel (no account). For ngrok, set NGROK_AUTHTOKEN."
echo ""
echo "Sample QA URLs (replace BASE with the tunnel URL shown below):"
echo "  BASE/es/fisica-electronica/formula/DIV-001"
echo "  BASE/en/fisica-electronica/formula/OPA-004"
echo "  BASE/es/fisica-electronica/guia"
echo "  BASE/es/calculo-diferencial/formula/DIF-106"
echo "  BASE/en/calculo-diferencial/formula/DIF-114"
echo "  BASE/en/calculo-diferencial/guia"
echo "  BASE/pt/calculo-diferencial"
echo ""
exec "$CLOUDFLARED" tunnel --url "http://localhost:${PORT}"
