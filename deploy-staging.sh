#!/bin/bash
# deploy-staging.sh — Deploy to staging.persiantoolbox.ir
# Usage: bash deploy-staging.sh
set -e

source .env 2>/dev/null || true
VPS="${IP:-193.93.169.32}"
USER="ubuntu"
SSH="ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no"
STAGING_DIR="/home/ubuntu/persiantoolbox-staging"
STAGING_PORT=3001

echo "=== Step 1: Rsync to staging ==="
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  -e "ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no" \
  . "$USER@$VPS:$STAGING_DIR/"

echo "=== Step 2: Build + Deploy on VPS ==="
$SSH "$USER@$VPS" bash -s <<REMOTE
set -e
cd $STAGING_DIR

# Fix shared package path
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

# Install dependencies
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Verify PDF worker exists
if [ ! -f "public/pdf.worker.min.mjs" ]; then
  echo "⚠️  PDF worker missing — copying from node_modules..."
  cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null || true
fi

# Build
NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build

# Verify standalone
if [ ! -d ".next/standalone" ]; then
  echo "ERROR: .next/standalone not found"
  exit 1
fi

# Copy static assets
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

# Verify critical assets
CSS_COUNT=\$(find .next/standalone/.next/static -name '*.css' | wc -l)
WORKER_EXISTS="no"
[ -f ".next/standalone/public/pdf.worker.min.mjs" ] && WORKER_EXISTS="yes"
echo "Assets: \$CSS_COUNT CSS, worker=\$WORKER_EXISTS"

if [ "\$CSS_COUNT" -eq 0 ]; then
  echo "ERROR: No CSS files! Aborting."
  exit 1
fi

if [ "\$WORKER_EXISTS" = "no" ]; then
  echo "ERROR: PDF worker not in standalone/public! Aborting."
  exit 1
fi

# Create staging .env
cat > .env.staging << 'ENVEOF'
PORT=$STAGING_PORT
NODE_ENV=production
ENVEOF

# Restart staging PM2
pm2 delete persiantoolbox-staging 2>/dev/null || true
PORT=$STAGING_PORT pm2 start ecosystem.config.js --name persiantoolbox-staging --cwd $STAGING_DIR

echo "=== Staging deploy complete ==="
pm2 show persiantoolbox-staging 2>/dev/null | grep -E "name|version|status|pid"
REMOTE

echo "=== Step 3: Verify ==="
sleep 5
STATUS=$(curl -s --connect-timeout 10 --max-time 15 https://staging.persiantoolbox.ir/api/health 2>/dev/null)
echo "Health: $STATUS"

# Verify CSS
CSS_FILE=$(curl -s https://staging.persiantoolbox.ir/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://staging.persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
  [ "$CSS_HTTP" = "200" ] && echo "✅ CSS: HTTP 200" || echo "❌ CSS: HTTP $CSS_HTTP"
fi

# Verify PDF worker
WORKER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://staging.persiantoolbox.ir/pdf.worker.min.mjs" 2>/dev/null)
[ "$WORKER_HTTP" = "200" ] && echo "✅ PDF worker: HTTP 200" || echo "❌ PDF worker: HTTP $WORKER_HTTP"

echo "=== All done ==="
