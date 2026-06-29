#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKER_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(cd "$WORKER_DIR/../../.." && pwd)"

echo "=== Deploy PersianToolbox Telegram Bot Worker ==="

set -a
source "$PROJECT_ROOT/.env"
set +a

: "${CLOUDFLARE_ACCOUNT_ID:?Missing CLOUDFLARE_ACCOUNT_ID}"
: "${CLOUDFLARE_API_TOKEN:?Missing CLOUDFLARE_API_TOKEN}"
: "${TELEGRAM_BOT_TOKEN:?Missing TELEGRAM_BOT_TOKEN}"
: "${TELEGRAM_SECRET_TOKEN:?Missing TELEGRAM_SECRET_TOKEN}"

cd "$WORKER_DIR"

if [ ! -f node_modules/.bin/wrangler ]; then
  echo "Installing wrangler..."
  npm install
fi

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

echo "Deploying worker..."
DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$DEPLOY_OUTPUT"

WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[a-zA-Z0-9.-]+\.workers\.dev' | head -1 || true)
if [ -z "$WORKER_URL" ]; then
  WORKER_URL="https://persiantoolbox-telegram-bot.asdevelooper.workers.dev"
  echo "Using assumed worker URL: $WORKER_URL"
else
  echo "Worker URL: $WORKER_URL"
fi

echo "Setting secrets..."
printf '%s' "$TELEGRAM_BOT_TOKEN" | npx wrangler secret put TELEGRAM_BOT_TOKEN 2>&1 | grep -v "wrangler.toml"
printf '%s' "$TELEGRAM_SECRET_TOKEN" | npx wrangler secret put TELEGRAM_SECRET_TOKEN 2>&1 | grep -v "wrangler.toml"

echo "Setting up webhook..."
WEBHOOK_URL="${WORKER_URL}/webhook"
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"${WEBHOOK_URL}\",\"secret_token\":\"${TELEGRAM_SECRET_TOKEN}\"}"
echo ""

echo "✅ Deployment complete!"
echo "   Worker URL: $WORKER_URL"
echo "   Webhook URL: $WEBHOOK_URL"
