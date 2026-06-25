#!/bin/bash
# quick-deploy.sh — Safe manual deploy with CSS verification
# Usage: bash quick-deploy.sh
set -e

VPS="193.93.169.32"
USER="ubuntu"
SSH="ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no"

echo "=== Step 1: Rsync ==="
rsync -avz --delete \
  --exclude='node_modules' --exclude='.next' --exclude='.git' \
  --exclude='*.log' --exclude='.env' --exclude='.env.*' \
  -e "ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no" \
  . "$USER@$VPS:/home/ubuntu/persiantoolbox/"

echo "=== Step 2: Build + Static Copy on VPS ==="
$SSH "$USER@$VPS" bash -s <<'REMOTE'
set -e
cd /home/ubuntu/persiantoolbox
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json
pnpm install --no-frozen-lockfile 2>/dev/null
NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build

# CRITICAL: Copy static assets to standalone
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
echo "Static assets: $CSS_COUNT CSS files"
[ "$CSS_COUNT" -eq 0 ] && echo "ERROR: No CSS!" && exit 1

pm2 restart persiantoolbox 2>/dev/null || pm2 start ecosystem.config.js
REMOTE

echo "=== Step 3: Verify CSS ==="
sleep 3
CSS_FILE=$(curl -s https://persiantoolbox.ir/ | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "https://persiantoolbox.ir${CSS_FILE}")
  if [ "$CSS_HTTP" = "200" ]; then
    echo "✅ CSS served correctly"
  else
    echo "❌ CSS returns HTTP $CSS_HTTP — site without styles!"
    exit 1
  fi
else
  echo "❌ No CSS found in HTML!"
  exit 1
fi

HEALTH=$(curl -s https://persiantoolbox.ir/api/health | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null)
echo "Health: $HEALTH"
echo "=== Deploy complete ==="
