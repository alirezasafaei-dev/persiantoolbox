#!/bin/bash
# deploy-vps-auto.sh — Run from LOCAL machine
# Does: QA gate → rsync → build on VPS → copy static assets → restart PM2
# Usage: bash deploy-vps-auto.sh
set -e

source .env 2>/dev/null || true
VPS="${IP:-193.93.169.32}"
USER="ubuntu"
SSH="ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no"

# ============================================
# QA GATEKEEPER — Run before deploy
# ============================================
echo "=== Step 0: QA Gatekeeper ==="
echo "Running typecheck + lint + tests before deploy..."

pnpm typecheck 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: typecheck failed — deployment ABORTED"
  exit 1
fi

pnpm lint 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: lint failed — deployment ABORTED"
  exit 1
fi

pnpm vitest --run 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: tests failed — deployment ABORTED"
  exit 1
fi

# CSS verification on current production (before deploy)
CSS_FILE=$(curl -s https://persiantoolbox.ir/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
  if [ "$CSS_HTTP" != "200" ]; then
    echo "⚠️  WARNING: Current production CSS returns HTTP $CSS_HTTP"
  fi
fi

echo "✅ QA gate passed"

echo "=== Step 1: Rsync files ==="
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  -e "ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no" \
  . "$USER@$VPS:/home/ubuntu/persiantoolbox/"

echo "=== Step 2: Build + Deploy on VPS ==="
$SSH "$USER@$VPS" bash -s <<'REMOTE'
set -e
cd /home/ubuntu/persiantoolbox

# Fix shared package path
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

# Install dependencies
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build — NEXT_PUBLIC_SITE_URL is a build-time variable that must be set
# so sitemap, canonical, OG, and JSON-LD URLs use the production domain.
NODE_OPTIONS='--max-old-space-size=4096' NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir NODE_ENV=production npx next build

# Verify standalone directory exists
if [ ! -d ".next/standalone" ]; then
  echo "ERROR: .next/standalone directory not found after build! Aborting."
  exit 1
fi

# CRITICAL: Copy static assets to standalone (Next.js standalone does NOT include these)
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static

# Copy public assets
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true

# CRITICAL: Fix permissions so nginx (www-data) can read the files
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

# Verify static assets exist
CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
JS_COUNT=$(find .next/standalone/.next/static -name '*.js' | wc -l)
FONT_COUNT=$(find .next/standalone/public/fonts -type f | wc -l)
echo "Static assets: $CSS_COUNT CSS, $JS_COUNT JS, $FONT_COUNT fonts"

if [ "$CSS_COUNT" -eq 0 ]; then
  echo "ERROR: No CSS files copied! Aborting restart."
  exit 1
fi

# Restart PM2 — use restart (not delete+start) to minimize downtime
# PM2 restart starts new process first, then kills old one (~1s gap vs ~5s)
cd /home/ubuntu/persiantoolbox
pm2 restart ecosystem.config.js --update-env 2>/dev/null || pm2 start ecosystem.config.js

# Wait for new process to be ready (check health endpoint)
echo "Waiting for new process to start..."
for i in $(seq 1 15); do
  if curl -s --connect-timeout 2 --max-time 3 http://localhost:3000/api/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ New process ready (attempt $i)"
    break
  fi
  sleep 1
done

# CRITICAL: Purge nginx cache to serve fresh HTML with correct CSS hashes
# NOTE: sudo is required — cache dirs are owned by www-data
# Using find -delete to ensure all hash-subdirectory files are removed
sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

echo "=== Deploy complete ==="
pm2 show persiantoolbox 2>/dev/null | grep -E "name|version|status|pid"
REMOTE

echo "=== Step 3: Verify ==="
sleep 3
STATUS=$(curl -s --connect-timeout 10 --max-time 15 https://persiantoolbox.ir/api/health 2>/dev/null)
echo "Health: $STATUS"

# CRITICAL: Verify CSS is actually served (not 404)
CSS_FILE=$(curl -s https://persiantoolbox.ir/ | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
  if [ "$CSS_HTTP" = "200" ]; then
    echo "✅ CSS served correctly (HTTP $CSS_HTTP)"
  else
    echo "❌ CRITICAL: CSS returns HTTP $CSS_HTTP — site will load WITHOUT STYLES!"
    echo "   Fix: ssh into VPS and run:"
    echo "   cd /home/ubuntu/persiantoolbox && cp -r .next/static .next/standalone/.next/static && pm2 restart persiantoolbox"
    exit 1
  fi
else
  echo "❌ CRITICAL: No CSS file found in HTML!"
  exit 1
fi

# Verify font files
FONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "https://persiantoolbox.ir/fonts/Vazirmatn-Bold.woff2" 2>/dev/null)
echo "Font files: HTTP $FONT_HTTP"

echo "=== All done ==="
