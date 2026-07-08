#!/bin/bash
# deploy-vps-auto.sh — production deploy from local machine
# Flow: QA gate -> rsync to isolated release dir -> build on VPS -> switch the
# stable live symlink -> PM2 restart -> nginx purge -> mandatory public verification.
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

SITE_URL="https://persiantoolbox.ir"
REMOTE_LIVE_DIR="/home/ubuntu/persiantoolbox"
REMOTE_RELEASES_DIR="/home/ubuntu/persiantoolbox-releases"
REMOTE_CURRENT_LINK="/home/ubuntu/persiantoolbox-current"
REMOTE_PREVIOUS_FILE="/tmp/persiantoolbox-last-previous-release"
REMOTE_RUNTIME_LINK_FILE="/tmp/persiantoolbox-active-runtime-link"

RELEASE_GIT_SHA=$(git rev-parse --verify HEAD)
RELEASE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RELEASE_ID="${RELEASE_GIT_SHA:0:12}-$(date -u +"%Y%m%dT%H%M%SZ")"

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

remote_rollback() {
  echo "⚠️  Attempting automatic rollback to previous release..."
  "${SSH[@]}" "$USER@$VPS" "REMOTE_LIVE_DIR='$REMOTE_LIVE_DIR' REMOTE_CURRENT_LINK='$REMOTE_CURRENT_LINK' REMOTE_PREVIOUS_FILE='$REMOTE_PREVIOUS_FILE' REMOTE_RUNTIME_LINK_FILE='$REMOTE_RUNTIME_LINK_FILE' bash -s" <<'REMOTE' || true
set -Eeuo pipefail
PREVIOUS_DIR=""
[ -f "$REMOTE_RUNTIME_LINK_FILE" ] && ACTIVE_RUNTIME_LINK="$(cat "$REMOTE_RUNTIME_LINK_FILE" 2>/dev/null || true)" || ACTIVE_RUNTIME_LINK=""
[ -f "$REMOTE_PREVIOUS_FILE" ] && PREVIOUS_DIR="$(cat "$REMOTE_PREVIOUS_FILE" 2>/dev/null || true)"

if [ -z "$PREVIOUS_DIR" ] || [ ! -f "$PREVIOUS_DIR/ecosystem.config.js" ]; then
  echo "Rollback skipped: no previous release with ecosystem.config.js"
  exit 0
fi

if [ -n "$ACTIVE_RUNTIME_LINK" ]; then
  ln -sfn "$PREVIOUS_DIR" "$ACTIVE_RUNTIME_LINK"
fi
ln -sfn "$PREVIOUS_DIR" "$REMOTE_CURRENT_LINK"
ln -sfn "$PREVIOUS_DIR" "$REMOTE_LIVE_DIR"
PM2_APP_DIR="${ACTIVE_RUNTIME_LINK:-$REMOTE_LIVE_DIR}"
PERSIANTOOLBOX_APP_DIR="$PM2_APP_DIR" pm2 restart "$PM2_APP_DIR/ecosystem.config.js" --only persiantoolbox --update-env

for i in $(seq 1 30); do
  HEALTH=$(curl -s --connect-timeout 2 --max-time 3 http://127.0.0.1:3000/api/health 2>/dev/null || true)
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Rollback healthy (attempt $i)"
    break
  fi
  sleep 1
done

sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true
sudo rm -rf /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo mkdir -p /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo chown -R www-data:www-data /var/cache/nginx/persiantoolbox 2>/dev/null || true
sudo nginx -t >/dev/null 2>&1 && sudo systemctl reload nginx || true
REMOTE
}

fail_after_remote_switch() {
  echo "❌ $1"
  remote_rollback
  exit 1
}

echo "Release: ${RELEASE_GIT_BRANCH}@${RELEASE_GIT_SHA:0:12} (${RELEASE_BUILT_AT})"
echo "Release dir: ${REMOTE_RELEASES_DIR}/${RELEASE_ID}"
echo "SSH: ${USER}@${VPS}:${SSH_PORT}"

if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY_DEPLOY:-0}" != "1" ]; then
  echo "❌ Working tree is dirty. Commit/stash first, or set ALLOW_DIRTY_DEPLOY=1 for an emergency deploy."
  git status --short
  exit 1
fi

if ! check_ssh_reachability; then
  echo "❌ SSH preflight failed: ${VPS}:${SSH_PORT} is not reachable from this environment"
  exit 1
fi

echo "=== Step 0: QA Gatekeeper ==="
echo "Running typecheck + lint + tests before deploy..."

pnpm pwa:shell:check 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: PWA shell contract failed — deployment ABORTED"
  exit 1
fi

pnpm pwa:sw:validate 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: service worker validation failed — deployment ABORTED"
  exit 1
fi

pnpm typecheck 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ QA GATE: typecheck failed — deployment ABORTED"
  exit 1
fi

LINT_OUTPUT=$(pnpm lint 2>&1)
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
echo "✅ QA gate passed"

echo "=== Step 1: Prepare isolated release directory ==="
"${SSH[@]}" "$USER@$VPS" "mkdir -p '$REMOTE_RELEASES_DIR/$RELEASE_ID'"

echo "=== Step 2: Rsync files to release directory ==="
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
  . "$USER@$VPS:$REMOTE_RELEASES_DIR/$RELEASE_ID/"

echo "=== Step 3: Build + restart on VPS ==="
"${SSH[@]}" "$USER@$VPS" \
  "RELEASE_GIT_SHA='$RELEASE_GIT_SHA' RELEASE_GIT_BRANCH='$RELEASE_GIT_BRANCH' RELEASE_BUILT_AT='$RELEASE_BUILT_AT' RELEASE_ID='$RELEASE_ID' REMOTE_LIVE_DIR='$REMOTE_LIVE_DIR' REMOTE_RELEASES_DIR='$REMOTE_RELEASES_DIR' REMOTE_CURRENT_LINK='$REMOTE_CURRENT_LINK' REMOTE_PREVIOUS_FILE='$REMOTE_PREVIOUS_FILE' REMOTE_RUNTIME_LINK_FILE='$REMOTE_RUNTIME_LINK_FILE' SITE_URL='$SITE_URL' bash -s" <<'REMOTE'
set -Eeuo pipefail

exec 9>/tmp/persiantoolbox-deploy.lock
if ! flock -n 9; then
  echo "❌ Another deploy is already running"
  exit 1
fi

RELEASE_DIR="$REMOTE_RELEASES_DIR/$RELEASE_ID"
cd "$RELEASE_DIR"

ACTIVE_RUNTIME_LINK=""
ACTIVE_RUNTIME_CWD="$(node -e '
  const { execSync } = require("child_process");
  try {
    const apps = JSON.parse(execSync("pm2 jlist", { encoding: "utf8" }));
    const app = apps.find((item) => item.name === "persiantoolbox");
    process.stdout.write(app?.pm2_env?.pm_cwd || "");
  } catch {}
')"
case "$ACTIVE_RUNTIME_CWD" in
  /home/ubuntu/persiantoolbox-slot-blue|/home/ubuntu/persiantoolbox-slot-green)
    ACTIVE_RUNTIME_LINK="$ACTIVE_RUNTIME_CWD"
    ;;
esac
printf '%s' "$ACTIVE_RUNTIME_LINK" > "$REMOTE_RUNTIME_LINK_FILE"

PREVIOUS_DIR=""
if [ -n "$ACTIVE_RUNTIME_LINK" ] && [ -L "$ACTIVE_RUNTIME_LINK" ]; then
  PREVIOUS_DIR="$(readlink -f "$ACTIVE_RUNTIME_LINK" || true)"
elif [ -L "$REMOTE_LIVE_DIR" ]; then
  PREVIOUS_DIR="$(readlink -f "$REMOTE_LIVE_DIR" || true)"
elif [ -f "$REMOTE_LIVE_DIR/ecosystem.config.js" ]; then
  PREVIOUS_DIR="$REMOTE_LIVE_DIR"
elif [ -L "$REMOTE_CURRENT_LINK" ]; then
  PREVIOUS_DIR="$(readlink -f "$REMOTE_CURRENT_LINK" || true)"
fi
printf '%s' "$PREVIOUS_DIR" > "$REMOTE_PREVIOUS_FILE"
echo "Previous release: ${PREVIOUS_DIR:-none}"
echo "Runtime topology: pm2_cwd=${ACTIVE_RUNTIME_CWD:-unknown} runtime_link=${ACTIVE_RUNTIME_LINK:-none}"

cat > .env.release <<EOF
NEXT_PUBLIC_GIT_SHA=$RELEASE_GIT_SHA
NEXT_PUBLIC_GIT_BRANCH=$RELEASE_GIT_BRANCH
NEXT_PUBLIC_BUILD_DATE=$RELEASE_BUILT_AT
RELEASE_GIT_SHA=$RELEASE_GIT_SHA
RELEASE_GIT_BRANCH=$RELEASE_GIT_BRANCH
RELEASE_BUILT_AT=$RELEASE_BUILT_AT
APP_VERSION=$(node -p "require('./package.json').version")
EOF

if [ -f "$REMOTE_LIVE_DIR/.env" ]; then
  cp "$REMOTE_LIVE_DIR/.env" .env
  chmod 600 .env
else
  echo "⚠️  No legacy env file found at $REMOTE_LIVE_DIR/.env"
fi

echo "Release info written. App version: $(node -p "require('./package.json').version")"
sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json

pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "Cleaning previous .next in isolated release ..."
rm -rf .next

NODE_OPTIONS='--max-old-space-size=6144' \
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
NEXT_PUBLIC_GIT_SHA="$RELEASE_GIT_SHA" \
NEXT_PUBLIC_GIT_BRANCH="$RELEASE_GIT_BRANCH" \
NEXT_PUBLIC_BUILD_DATE="$RELEASE_BUILT_AT" \
NODE_ENV=production \
npx next build 2>&1 | tee build.log || {
  echo "❌ Build failed. Last 80 lines of build.log:"
  tail -80 build.log
  exit 1
}

if [ ! -d ".next/standalone" ] || [ ! -f ".next/standalone/server.js" ]; then
  echo "ERROR: standalone build incomplete after build"
  exit 1
fi

echo "Copying static assets..."
rm -rf .next/standalone/.next/static
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static

mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true

[ -f .env ] && cp .env .next/standalone/.env || true
[ -f .env.release ] && cp .env.release .next/standalone/.env.release || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

if ls .next/standalone/ 2>/dev/null | grep -qE '^(app|lib|components|AGENTS.md|package.json|deploy-vps)'; then
  echo "⚠️  Source pollution detected in .next/standalone — cleaning extraneous files..."
  find .next/standalone -maxdepth 1 -mindepth 1 ! -name '.next' ! -name 'public' ! -name 'server.js' ! -name 'node_modules' ! -name '.env' ! -name '.env.release' -exec rm -rf {} + 2>/dev/null || true
fi

CSS_COUNT=$(find .next/standalone/.next/static -name '*.css' | wc -l)
JS_COUNT=$(find .next/standalone/.next/static -name '*.js' | wc -l)
FONT_COUNT=$(find .next/standalone/public/fonts -type f 2>/dev/null | wc -l)
WORKER_EXISTS="no"
[ -f ".next/standalone/public/pdf.worker.min.mjs" ] && WORKER_EXISTS="yes"
echo "Static assets: $CSS_COUNT CSS, $JS_COUNT JS, $FONT_COUNT fonts, worker=$WORKER_EXISTS"

[ "$CSS_COUNT" -eq 0 ] && echo "ERROR: No CSS files copied" && exit 1
[ "$WORKER_EXISTS" = "no" ] && echo "ERROR: PDF worker not in standalone/public" && exit 1

echo "Restarting PM2 from isolated release..."
if [ ! -L "$REMOTE_LIVE_DIR" ]; then
  LEGACY_DIR="${REMOTE_LIVE_DIR}-legacy-${RELEASE_ID}"
  echo "Migrating legacy live directory to $LEGACY_DIR"
  mv "$REMOTE_LIVE_DIR" "$LEGACY_DIR"
  PREVIOUS_DIR="$LEGACY_DIR"
  printf '%s' "$PREVIOUS_DIR" > "$REMOTE_PREVIOUS_FILE"
fi
if [ -n "$ACTIVE_RUNTIME_LINK" ]; then
  ln -sfn "$RELEASE_DIR" "$ACTIVE_RUNTIME_LINK"
fi
ln -sfn "$RELEASE_DIR" "$REMOTE_LIVE_DIR"
ln -sfn "$RELEASE_DIR" "$REMOTE_CURRENT_LINK"
PM2_APP_DIR="${ACTIVE_RUNTIME_LINK:-$REMOTE_LIVE_DIR}"
PERSIANTOOLBOX_APP_DIR="$PM2_APP_DIR" pm2 restart "$PM2_APP_DIR/ecosystem.config.js" --only persiantoolbox --update-env \
  || PERSIANTOOLBOX_APP_DIR="$PM2_APP_DIR" pm2 start "$PM2_APP_DIR/ecosystem.config.js" --only persiantoolbox --update-env

echo "Waiting for new process to start (up to 45s)..."
READY=0
for i in $(seq 1 45); do
  HEALTH=$(curl -s --connect-timeout 2 --max-time 3 http://127.0.0.1:3000/api/health 2>/dev/null || true)
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    COMMIT=$(echo "$HEALTH" | grep -o '"commit":"[^"]*"' | head -1 || true)
    echo "✅ New process ready (attempt $i) $COMMIT"
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "❌ New process did not become healthy; rolling back before public traffic verification"
  if [ -n "$PREVIOUS_DIR" ] && [ -f "$PREVIOUS_DIR/ecosystem.config.js" ]; then
    if [ -n "$ACTIVE_RUNTIME_LINK" ]; then
      ln -sfn "$PREVIOUS_DIR" "$ACTIVE_RUNTIME_LINK"
    fi
    ln -sfn "$PREVIOUS_DIR" "$REMOTE_LIVE_DIR"
    ln -sfn "$PREVIOUS_DIR" "$REMOTE_CURRENT_LINK"
    PM2_APP_DIR="${ACTIVE_RUNTIME_LINK:-$REMOTE_LIVE_DIR}"
    PERSIANTOOLBOX_APP_DIR="$PM2_APP_DIR" pm2 restart "$PM2_APP_DIR/ecosystem.config.js" --only persiantoolbox --update-env || true
  fi
  exit 1
fi

RUNNING_COMMIT=$(curl -s --max-time 5 http://127.0.0.1:3000/api/version 2>/dev/null | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
echo "Running commit: ${RUNNING_COMMIT:-null}"
if [ -n "$RELEASE_GIT_SHA" ] && echo "$RUNNING_COMMIT" | grep -q "${RELEASE_GIT_SHA:0:12}"; then
  echo "✅ Deployed commit matches expected"
else
  echo "❌ Commit mismatch: expected ${RELEASE_GIT_SHA:0:12}, got ${RUNNING_COMMIT:-null}"
  if [ -n "$PREVIOUS_DIR" ] && [ -f "$PREVIOUS_DIR/ecosystem.config.js" ]; then
    if [ -n "$ACTIVE_RUNTIME_LINK" ]; then
      ln -sfn "$PREVIOUS_DIR" "$ACTIVE_RUNTIME_LINK"
    fi
    ln -sfn "$PREVIOUS_DIR" "$REMOTE_LIVE_DIR"
    ln -sfn "$PREVIOUS_DIR" "$REMOTE_CURRENT_LINK"
    PM2_APP_DIR="${ACTIVE_RUNTIME_LINK:-$REMOTE_LIVE_DIR}"
    PERSIANTOOLBOX_APP_DIR="$PM2_APP_DIR" pm2 restart "$PM2_APP_DIR/ecosystem.config.js" --only persiantoolbox --update-env || true
  fi
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$REMOTE_CURRENT_LINK"
pm2 save >/dev/null 2>&1 || true

echo "Purging nginx cache..."
sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true
sudo rm -rf /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo mkdir -p /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo chown -R www-data:www-data /var/cache/nginx/persiantoolbox 2>/dev/null || true
if sudo nginx -t; then
  sudo systemctl reload nginx && echo "✅ nginx reloaded after purge"
else
  echo "❌ nginx -t failed after purge"
  exit 1
fi

echo "Warming up key pages..."
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/career-tools" "/business-tools" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 60 "http://127.0.0.1:3000${page}" 2>/dev/null || true)
  echo "${CODE:-000} ${page}"
  [ "$CODE" != "200" ] && echo "❌ Warmup failed for ${page}" && exit 1
done
echo "✅ Warmup complete"

mapfile -t OLD_RELEASES < <(find "$REMOTE_RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | sort -rn | awk 'NR>5 {print $2}')
for old_release in "${OLD_RELEASES[@]}"; do
  if [ "$old_release" != "$RELEASE_DIR" ] && [ "$old_release" != "$PREVIOUS_DIR" ]; then
    rm -rf "$old_release"
  fi
done

echo "=== Deploy complete ==="
pm2 show persiantoolbox 2>/dev/null | grep -E "name|status|pid|memory|restarts" || true
REMOTE

echo "=== Step 4: Mandatory public verification ==="
sleep 3

STATUS=$(curl_public -s --connect-timeout 10 --max-time 20 "$SITE_URL/api/health" 2>/dev/null)
echo "Health: $STATUS"
if ! echo "$STATUS" | grep -q '"status":"ok"'; then
  fail_after_remote_switch "CRITICAL: public health check failed after deploy"
fi
if ! echo "$STATUS" | grep -q "\"commit\":\"${RELEASE_GIT_SHA:0:12}"; then
  fail_after_remote_switch "CRITICAL: public health commit does not match ${RELEASE_GIT_SHA:0:12}"
fi

CSS_FILE=$(curl_public -s --connect-timeout 10 --max-time 20 "$SITE_URL/" 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+' || true)
CACHE_STATUS=$(curl_public -sI --connect-timeout 10 --max-time 10 "$SITE_URL/" 2>/dev/null | grep -i "X-Cache-Status" | tr -d '\r' || true)
echo "Cache status on verify: ${CACHE_STATUS:-unknown}"
if [ -z "$CSS_FILE" ]; then
  fail_after_remote_switch "CRITICAL: no CSS file found in public HTML"
fi
CSS_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "$SITE_URL${CSS_FILE}" 2>/dev/null)
[ "$CSS_HTTP" = "200" ] || fail_after_remote_switch "CRITICAL: CSS returns HTTP $CSS_HTTP"
echo "✅ CSS served correctly (HTTP $CSS_HTTP)"

FONT_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "$SITE_URL/fonts/Vazirmatn-Bold.woff2" 2>/dev/null)
[ "$FONT_HTTP" = "200" ] || fail_after_remote_switch "CRITICAL: font returns HTTP $FONT_HTTP"
echo "✅ Font files: HTTP $FONT_HTTP"

WORKER_HTTP=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 10 "$SITE_URL/pdf.worker.min.mjs" 2>/dev/null)
[ "$WORKER_HTTP" = "200" ] || fail_after_remote_switch "CRITICAL: PDF worker returns HTTP $WORKER_HTTP"
echo "✅ PDF worker: HTTP $WORKER_HTTP"

HEADERS=$(curl_public -sI --connect-timeout 10 --max-time 10 "$SITE_URL/" 2>/dev/null)
for h in "x-frame-options" "x-content-type-options" "strict-transport-security" "content-security-policy"; do
  if ! echo "$HEADERS" | grep -qi "^${h}:"; then
    echo "⚠️  WARNING: Missing security header: $h"
  fi
done

echo "Testing key pages (cold start may take 5-30s per page)..."
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 60 "$SITE_URL${page}" 2>/dev/null)
  echo "${page}: HTTP ${CODE}"
  [ "$CODE" = "200" ] || fail_after_remote_switch "DEPLOY INCOMPLETE: ${page} returned HTTP ${CODE}"
done

VERSION=$(curl_public -s --connect-timeout 10 --max-time 20 "$SITE_URL/api/version" 2>/dev/null)
echo "Version: $VERSION"

echo "=== ✅ All done — deploy verified ==="
