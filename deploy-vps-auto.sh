#!/bin/bash
# deploy-vps-auto.sh — Run from LOCAL machine
# Does: rsync → build on VPS → copy static assets → restart PM2
# Usage: bash deploy-vps-auto.sh
set -e

source .env 2>/dev/null || true
VPS="${IP:-193.93.169.32}"
USER="${USER:-ubuntu}"

echo "=== Step 1: Rsync files ==="
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  -e "ssh -o StrictHostKeyChecking=no" \
  . "$USER@$VPS:/home/ubuntu/persiantoolbox/"

echo "=== Step 2: Build + Deploy on VPS ==="
ssh "$USER@$VPS" bash -s <<'REMOTE'
set -e
cd /home/ubuntu/persiantoolbox

# Fix shared package path
sed -i 's|/home/dev13/my-project/shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

# Install dependencies
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build
NODE_ENV=production npx next build

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

# Restart PM2
cd .next/standalone
pm2 restart persiantoolbox --update-env
echo "=== Deploy complete ==="
pm2 show persiantoolbox 2>/dev/null | grep -E "name|version|status|pid"
REMOTE

echo "=== Step 3: Verify ==="
sleep 3
STATUS=$(curl -s --connect-timeout 10 --max-time 15 https://persiantoolbox.ir/api/health 2>/dev/null)
echo "Health: $STATUS"

CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "https://persiantoolbox.ir/_next/static/chunks/" 2>/dev/null)
echo "Static assets HTTP: $CSS_STATUS"

echo "=== All done ==="
