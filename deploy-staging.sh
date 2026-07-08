#!/bin/bash
# deploy-staging.sh — Deploy to staging.persiantoolbox.ir
set -Eeuo pipefail

source .env 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
USER="ubuntu"
SSH_KEY="/home/dev13/.ssh/id_ed25519"
SSH_PORT="${SSH_PORT:-${VPS_PORT:-${PORT:-22}}}"
SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SSH_PORT"
  -o StrictHostKeyChecking=no
  -o ServerAliveInterval=30
  -o ServerAliveCountMax=10
)
SSH=(ssh "${SSH_OPTS[@]}")
RSYNC_SSH="ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10"
STAGING_DIR="/home/ubuntu/persiantoolbox-staging"
STAGING_PORT=3001
STAGING_URL="https://staging.persiantoolbox.ir"
RELEASE_GIT_SHA=$(git rev-parse --verify HEAD)
RELEASE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl_public() {
  env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy curl "$@"
}
check_ssh_reachability() {
  if command -v nc >/dev/null 2>&1; then
    nc -z -w 5 "$VPS" "$SSH_PORT" >/dev/null 2>&1
    return $?
  fi
  timeout 5 bash -c ":</dev/tcp/$VPS/$SSH_PORT" >/dev/null 2>&1
}

echo "Staging release: ${RELEASE_GIT_BRANCH}@${RELEASE_GIT_SHA:0:12} (${RELEASE_BUILT_AT})"
echo "SSH: ${USER}@${VPS}:${SSH_PORT}"

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree is dirty. Commit or stash before staging deploy."
  git status --short
  exit 1
fi

if ! check_ssh_reachability; then
  echo "❌ SSH preflight failed: ${VPS}:${SSH_PORT} is not reachable from this environment"
  exit 1
fi

echo "=== Step 0: QA Gate ==="
pnpm pwa:shell:check 2>&1 | tail -1
pnpm pwa:sw:validate 2>&1 | tail -1
pnpm typecheck 2>&1 | tail -1
LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c " error " || true)
echo "$LINT_OUTPUT" | tail -3
[ "$LINT_ERRORS" -gt 0 ] && echo "❌ $LINT_ERRORS lint errors" && exit 1
pnpm vitest --run 2>&1 | tail -3
[ ! -f "public/pdf.worker.min.mjs" ] && cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null || true
echo "✅ QA passed"

echo "=== Step 1: Rsync to staging ==="
rsync -az --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='coverage' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  --exclude='tsconfig.tsbuildinfo' \
  -e "$RSYNC_SSH" \
  . "$USER@$VPS:$STAGING_DIR/"

echo "=== Step 2: Build + restart staging ==="
"${SSH[@]}" "$USER@$VPS" \
  "RELEASE_GIT_SHA='$RELEASE_GIT_SHA' RELEASE_GIT_BRANCH='$RELEASE_GIT_BRANCH' RELEASE_BUILT_AT='$RELEASE_BUILT_AT' STAGING_DIR='$STAGING_DIR' STAGING_PORT='$STAGING_PORT' STAGING_URL='$STAGING_URL' bash -s" <<'REMOTE'
set -Eeuo pipefail
cd "$STAGING_DIR"

cat > .env.release <<EOF
NEXT_PUBLIC_GIT_SHA=$RELEASE_GIT_SHA
NEXT_PUBLIC_GIT_BRANCH=$RELEASE_GIT_BRANCH
NEXT_PUBLIC_BUILD_DATE=$RELEASE_BUILT_AT
RELEASE_GIT_SHA=$RELEASE_GIT_SHA
RELEASE_GIT_BRANCH=$RELEASE_GIT_BRANCH
RELEASE_BUILT_AT=$RELEASE_BUILT_AT
APP_VERSION=$(node -p "require('./package.json').version")
EOF

sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

if [ ! -f "public/pdf.worker.min.mjs" ]; then
  cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null || true
fi

rm -rf .next

NODE_OPTIONS='--max-old-space-size=4096' \
NEXT_PUBLIC_SITE_URL="$STAGING_URL" \
NEXT_PUBLIC_GIT_SHA="$RELEASE_GIT_SHA" \
NEXT_PUBLIC_GIT_BRANCH="$RELEASE_GIT_BRANCH" \
NEXT_PUBLIC_BUILD_DATE="$RELEASE_BUILT_AT" \
NODE_ENV=production \
npx next build

[ ! -d ".next/standalone" ] || [ ! -f ".next/standalone/server.js" ] && echo "ERROR: incomplete standalone build" && exit 1

rm -rf .next/standalone/.next/static
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true
[ -f .env ] && cp .env .next/standalone/.env || true
[ -f .env.release ] && cp .env.release .next/standalone/.env.release || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
WORKER_EXISTS="no"
[ -f ".next/standalone/public/pdf.worker.min.mjs" ] && WORKER_EXISTS="yes"
[ "$CSS_COUNT" -eq 0 ] && echo "ERROR: No CSS files copied" && exit 1
[ "$WORKER_EXISTS" = "no" ] && echo "ERROR: PDF worker not in standalone/public" && exit 1

if pm2 describe persiantoolbox-staging >/dev/null 2>&1; then
  PORT="$STAGING_PORT" PM2_PROCESS_NAME="persiantoolbox-staging" PERSIANTOOLBOX_APP_DIR="$STAGING_DIR" \
    pm2 restart ecosystem.config.js --only persiantoolbox-staging --update-env
else
  PORT="$STAGING_PORT" PM2_PROCESS_NAME="persiantoolbox-staging" PERSIANTOOLBOX_APP_DIR="$STAGING_DIR" \
    pm2 start ecosystem.config.js --only persiantoolbox-staging --update-env
fi

for i in $(seq 1 45); do
  HEALTH=$(curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:$STAGING_PORT/api/health" 2>/dev/null || true)
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    break
  fi
  [ "$i" -eq 45 ] && echo "ERROR: staging health check failed" && exit 1
  sleep 1
done

RUNNING_COMMIT=$(curl -s --max-time 5 "http://127.0.0.1:$STAGING_PORT/api/version" 2>/dev/null | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || true)
echo "$RUNNING_COMMIT" | grep -q "${RELEASE_GIT_SHA:0:12}" || {
  echo "ERROR: staging commit mismatch ($RUNNING_COMMIT)"
  exit 1
}

pm2 show persiantoolbox-staging 2>/dev/null | grep -E "name|status|pid" || true
REMOTE

echo "=== Step 3: Verify staging ==="
sleep 3
STATUS=$(curl_public -s --connect-timeout 10 --max-time 20 "$STAGING_URL/api/health" 2>/dev/null)
echo "Health: $STATUS"
echo "$STATUS" | grep -q '"status":"ok"' || { echo "❌ staging health failed"; exit 1; }
echo "$STATUS" | grep -q "\"commit\":\"${RELEASE_GIT_SHA:0:12}\"" || { echo "❌ staging health commit mismatch"; exit 1; }

VERSION=$(curl_public -s --connect-timeout 10 --max-time 20 "$STAGING_URL/api/version" 2>/dev/null)
echo "Version: $VERSION"
echo "$VERSION" | grep -q "\"commit\":\"${RELEASE_GIT_SHA:0:12}\"" || { echo "❌ staging version commit mismatch"; exit 1; }

for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl_public -s -o /dev/null -w "%{http_code}" --max-time 30 "${STAGING_URL}${page}")
  echo "${page}: HTTP ${CODE}"
  [ "$CODE" = "200" ] || { echo "❌ FAILED: ${page}"; exit 1; }
done

CSS_FILE=$(curl_public -s "$STAGING_URL/" | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
CSS_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" "${STAGING_URL}${CSS_FILE}")
[ "$CSS_HTTP" = "200" ] || { echo "❌ staging CSS 404"; exit 1; }

FONT_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" "${STAGING_URL}/fonts/Vazirmatn-Bold.woff2")
[ "$FONT_HTTP" = "200" ] || { echo "❌ staging font 404"; exit 1; }

WORKER_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" "${STAGING_URL}/pdf.worker.min.mjs")
[ "$WORKER_HTTP" = "200" ] || { echo "❌ staging worker 404"; exit 1; }

echo "✅ Staging deploy verified"
