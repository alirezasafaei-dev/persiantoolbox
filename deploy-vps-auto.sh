#!/bin/bash
# deploy-vps-auto.sh — Run from LOCAL machine
# Does: QA gate → rsync → build on VPS → copy static assets → restart PM2 → verify
# Usage: bash deploy-vps-auto.sh
set -e

source .env 2>/dev/null || true
VPS="${IP:-193.93.169.32}"
USER="ubuntu"
SSH="ssh -i /home/dev13/.ssh/id_ed25519 -o StrictHostKeyChecking=no"
RELEASE_GIT_SHA=$(git rev-parse --verify HEAD)
RELEASE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl_public() {
  env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy curl "$@"
}

echo "Release: ${RELEASE_GIT_BRANCH}@${RELEASE_GIT_SHA:0:12} (${RELEASE_BUILT_AT})"

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

# Lint: only fail on ERRORS (exit code 1 with errors), not warnings
LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_EXIT=${PIPESTATUS[0]}
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c " error " || true)
echo "$LINT_OUTPUT" | tail -3

if [ "$LINT_ERRORS" -gt 0 ]; then
  echo "❌ QA GATE: $LINT_ERRORS lint errors found — deployment ABORTED"
  exit 1
fi
echo "✅ Lint: $LINT_ERRORS errors (warnings are acceptable)"

pnpm vitest --run 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: tests failed — deployment ABORTED"
  exit 1
fi

# Verify PDF worker exists before deploy
if [ ! -f "public/pdf.worker.min.mjs" ]; then
  echo "⚠️  PDF worker missing in public/ — copying from node_modules..."
  cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null || true
fi
if [ ! -f "public/pdf.worker.min.mjs" ]; then
  echo "❌ QA GATE: PDF worker file missing — deployment ABORTED"
  exit 1
fi
WORKER_SIZE=$(wc -c < public/pdf.worker.min.mjs)
echo "✅ PDF worker: ${WORKER_SIZE} bytes"

# CSS verification on current production (before deploy)
CSS_FILE=$(curl_public -s https://persiantoolbox.ir/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
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
$SSH "$USER@$VPS" \
  "RELEASE_GIT_SHA='$RELEASE_GIT_SHA' RELEASE_GIT_BRANCH='$RELEASE_GIT_BRANCH' RELEASE_BUILT_AT='$RELEASE_BUILT_AT' bash -s" <<'REMOTE'
set -e
cd /home/ubuntu/persiantoolbox

cat > .env.release <<EOF
NEXT_PUBLIC_GIT_SHA=$RELEASE_GIT_SHA
NEXT_PUBLIC_GIT_BRANCH=$RELEASE_GIT_BRANCH
NEXT_PUBLIC_BUILD_DATE=$RELEASE_BUILT_AT
RELEASE_GIT_SHA=$RELEASE_GIT_SHA
RELEASE_GIT_BRANCH=$RELEASE_GIT_BRANCH
RELEASE_BUILT_AT=$RELEASE_BUILT_AT
EOF

# Fix shared package path
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

# Install dependencies
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build — NEXT_PUBLIC_SITE_URL is a build-time variable that must be set
# so sitemap, canonical, OG, and JSON-LD URLs use the production domain.
NODE_OPTIONS='--max-old-space-size=4096' NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir NEXT_PUBLIC_GIT_SHA="$RELEASE_GIT_SHA" NEXT_PUBLIC_GIT_BRANCH="$RELEASE_GIT_BRANCH" NEXT_PUBLIC_BUILD_DATE="$RELEASE_BUILT_AT" NODE_ENV=production npx next build

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

# Verify critical assets exist
CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
JS_COUNT=$(find .next/standalone/.next/static -name '*.js' | wc -l)
FONT_COUNT=$(find .next/standalone/public/fonts -type f | wc -l)
WORKER_EXISTS="no"
[ -f ".next/standalone/public/pdf.worker.min.mjs" ] && WORKER_EXISTS="yes"
echo "Static assets: $CSS_COUNT CSS, $JS_COUNT JS, $FONT_COUNT fonts, worker=$WORKER_EXISTS"

if [ "$CSS_COUNT" -eq 0 ]; then
  echo "ERROR: No CSS files copied! Aborting restart."
  exit 1
fi

if [ "$WORKER_EXISTS" = "no" ]; then
  echo "ERROR: PDF worker not in standalone/public! Aborting restart."
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

# Warmup: hit key pages to pre-compile routes and cache blog processing
echo "Warming up key pages..."
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/career-tools" "/business-tools" "/writing-tools/persian-writing-studio"; do
  curl -s -o /dev/null -w "%{http_code} " --max-time 60 "http://localhost:3000${page}" 2>/dev/null
  echo "${page}"
done
echo "✅ Warmup complete"

echo "=== Deploy complete ==="
pm2 show persiantoolbox 2>/dev/null | grep -E "name|version|status|pid"
REMOTE

echo "=== Step 3: Verify ==="
sleep 3

# Health endpoint
STATUS=$(curl_public -s --connect-timeout 10 --max-time 15 https://persiantoolbox.ir/api/health 2>/dev/null)
echo "Health: $STATUS"

if ! echo "$STATUS" | grep -q '"status":"ok"'; then
  echo "❌ CRITICAL: Health check failed after deploy!"
  exit 1
fi

# CRITICAL: Verify CSS is actually served (not 404)
CSS_FILE=$(curl_public -s https://persiantoolbox.ir/ | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
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
FONT_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "https://persiantoolbox.ir/fonts/Vazirmatn-Bold.woff2" 2>/dev/null)
echo "Font files: HTTP $FONT_HTTP"

# Verify PDF worker is served from public/
WORKER_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "https://persiantoolbox.ir/pdf.worker.min.mjs" 2>/dev/null)
if [ "$WORKER_HTTP" = "200" ]; then
  echo "✅ PDF worker: HTTP 200"
else
  echo "❌ CRITICAL: PDF worker returns HTTP $WORKER_HTTP"
  exit 1
fi

# Verify security headers
HEADERS=$(curl_public -sI https://persiantoolbox.ir/ 2>/dev/null)
HEADER_OK=true
for h in "x-frame-options" "x-content-type-options" "strict-transport-security" "content-security-policy"; do
  if ! echo "$HEADERS" | grep -qi "^${h}:"; then
    echo "⚠️  WARNING: Missing security header: $h"
    HEADER_OK=false
  fi
done
if [ "$HEADER_OK" = true ]; then
  echo "✅ Security headers present"
fi

# CRITICAL: Test key pages (first request may be slow due to cold start)
echo "Testing key pages (cold start may take 5-30s per page)..."
FAILED=0
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 60 "https://persiantoolbox.ir${page}" 2>/dev/null)
  echo "${page}: HTTP ${CODE}"
  if [ "$CODE" != "200" ]; then
    echo "❌ FAILED: ${page}"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "❌ DEPLOY INCOMPLETE — some pages returned non-200"
  exit 1
fi

echo "=== ✅ All done — deploy verified ==="
