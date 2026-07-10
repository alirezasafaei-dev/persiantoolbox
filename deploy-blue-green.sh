#!/bin/bash
# deploy-blue-green.sh — Zero-downtime blue-green production deploy
#
# Flow: QA gate → detect slot → rsync → build (production unaffected) →
#       start new PM2 process → switch nginx upstream (<1s) → verify → cleanup
set -Eeuo pipefail

source .env 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
USER="ubuntu"
SSH_KEY="/home/dev13/.ssh/id_ed25519"
SSH_PORT="${SSH_PORT:-${VPS_PORT:-${PORT:-22}}}"
SSH_OPTS=(-i "$SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10)
SSH=(ssh "${SSH_OPTS[@]}")
RSYNC_SSH="ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10"

SITE_URL="https://persiantoolbox.ir"
REMOTE_BASE="/home/ubuntu"
REMOTE_RELEASES="$REMOTE_BASE/persiantoolbox-releases"
REMOTE_CURRENT_LINK="$REMOTE_BASE/persiantoolbox-current"
NGINX_UPSTREAM="/etc/nginx/conf.d/persiantoolbox-upstream.conf"
NGINX_PROJECTS_ENABLED="/etc/nginx/sites-enabled/projects"
NGINX_PROJECTS_AVAILABLE="/etc/nginx/sites-available/projects"

RELEASE_SHA=$(git rev-parse --verify HEAD)
RELEASE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RELEASE_ID="${RELEASE_SHA:0:12}-$(date -u +"%Y%m%dT%H%M%SZ")"

BLUE_PORT=3000
GREEN_PORT=3003

curl_public() { env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy curl "$@"; }
check_ssh_reachability() {
  if command -v nc >/dev/null 2>&1; then
    nc -z -w 5 "$VPS" "$SSH_PORT" >/dev/null 2>&1
    return $?
  fi
  timeout 5 bash -c ":</dev/tcp/$VPS/$SSH_PORT" >/dev/null 2>&1
}

echo "Release: ${RELEASE_BRANCH}@${RELEASE_SHA:0:12} (${RELEASE_BUILT})"
echo "Dir: ${REMOTE_RELEASES}/${RELEASE_ID}"
echo "SSH: ${USER}@${VPS}:${SSH_PORT}"

if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY_DEPLOY:-0}" != "1" ]; then
  echo "❌ Working tree dirty. Commit first or set ALLOW_DIRTY_DEPLOY=1"
  exit 1
fi

if ! check_ssh_reachability; then
  echo "❌ SSH preflight failed: ${VPS}:${SSH_PORT} is not reachable from this environment"
  exit 1
fi

# ── Step 0: QA ──────────────────────────────────────────────────
echo "=== QA Gate ==="
pnpm pwa:shell:check 2>&1 | tail -1
pnpm pwa:sw:validate 2>&1 | tail -1
pnpm typecheck 2>&1 | tail -1
LINT_ERRS=$(pnpm lint 2>&1 | grep -c " error " || true)
[ "$LINT_ERRS" -gt 0 ] && echo "❌ $LINT_ERRS lint errors" && exit 1
pnpm vitest --run 2>&1 | tail -3
[ ! -f "public/pdf.worker.min.mjs" ] && cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null
echo "✅ QA passed"

# ── Step 1: Detect slot ─────────────────────────────────────────
echo "=== Detect slot ==="
SLOT_INFO=$("${SSH[@]}" "$USER@$VPS" "NGINX_UPSTREAM='$NGINX_UPSTREAM' NGINX_PROJECTS_ENABLED='$NGINX_PROJECTS_ENABLED' node - <<'NODE'
const fs = require('fs');
const { execSync } = require('child_process');
const upstreamPath = process.env.NGINX_UPSTREAM;
const projectsPath = process.env.NGINX_PROJECTS_ENABLED;
let activePort = '3000';
try {
  if (fs.existsSync(upstreamPath)) {
    const upstream = fs.readFileSync(upstreamPath, 'utf8');
    const match = upstream.match(/127\\.0\\.0\\.1:(\\d+)/);
    if (match) activePort = match[1];
  } else if (fs.existsSync(projectsPath)) {
    const projects = fs.readFileSync(projectsPath, 'utf8');
    const match = projects.match(/proxy_pass\\s+http:\\/\\/127\\.0\\.0\\.1:(\\d+);/);
    if (match) activePort = match[1];
  }
} catch {}
let activeSlot = '';
try {
  const apps = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8' }));
  const app = apps.find((item) => item.name === 'persiantoolbox');
  const cwd = app?.pm2_env?.pm_cwd || '';
  const slotMatch = cwd.match(/persiantoolbox-slot-(blue|green)$/);
  if (slotMatch) activeSlot = slotMatch[1];
} catch {}
if (!activeSlot) {
  activeSlot = activePort === '3003' ? 'green' : 'blue';
}
process.stdout.write([activeSlot, activePort].join('\\t'));
NODE" 2>/dev/null || true)
ACTIVE_SLOT=$(printf '%s' "$SLOT_INFO" | cut -f1)
ACTIVE_PORT=$(printf '%s' "$SLOT_INFO" | cut -f2)
ACTIVE_SLOT="${ACTIVE_SLOT:-blue}"
ACTIVE_PORT="${ACTIVE_PORT:-$BLUE_PORT}"
if [ "$ACTIVE_SLOT" = "blue" ]; then
  NEW_SLOT="green"; NEW_PORT=$GREEN_PORT; OLD_PORT="$ACTIVE_PORT"
else
  NEW_SLOT="blue"; NEW_PORT=$BLUE_PORT; OLD_PORT="$ACTIVE_PORT"
fi
echo "Current → New: slot $ACTIVE_SLOT port $OLD_PORT → port $NEW_PORT ($NEW_SLOT)"

# ── Step 2: Setup nginx upstream ─────────────────────────────────
echo "=== Nginx upstream ==="
"${SSH[@]}" "$USER@$VPS" "
if [ ! -f $NGINX_UPSTREAM ]; then
  echo 'upstream persiantoolbox_backend { server 127.0.0.1:3000; }' | sudo tee $NGINX_UPSTREAM > /dev/null
  echo 'Created upstream config'
fi
if ! grep -q proxy_pass.*persiantoolbox_backend $NGINX_PROJECTS_ENABLED 2>/dev/null; then
  for file in $NGINX_PROJECTS_ENABLED $NGINX_PROJECTS_AVAILABLE; do
    [ -f \"\$file\" ] || continue
    sudo sed -i 's|proxy_pass http://127.0.0.1:3000;|proxy_pass http://persiantoolbox_backend;|g' \"\$file\"
  done
  sudo nginx -t && sudo systemctl reload nginx
  echo 'Updated nginx to use upstream'
else
  echo 'Nginx already uses upstream'
fi
"

# ── Step 3: Rsync ───────────────────────────────────────────────
echo "=== Rsync ==="
"${SSH[@]}" "$USER@$VPS" "mkdir -p '$REMOTE_RELEASES/$RELEASE_ID'"
rsync -az --delete \
  --exclude='node_modules' --exclude='.next' --exclude='.git' \
  --exclude='*.log' --exclude='.env' --exclude='.env.*' \
  --exclude='coverage' --exclude='playwright-report' --exclude='test-results' \
  --exclude='tsconfig.tsbuildinfo' \
  -e "$RSYNC_SSH" \
  . "$USER@$VPS:$REMOTE_RELEASES/$RELEASE_ID/"

# ── Step 4: Build on VPS ────────────────────────────────────────
echo "=== Build (production on port $OLD_PORT unaffected) ==="
"${SSH[@]}" "$USER@$VPS" "bash /dev/stdin" "$RELEASE_SHA" "$RELEASE_BRANCH" "$RELEASE_BUILT" "$RELEASE_ID" "$SITE_URL" <<'BUILD'
set -Eeuo pipefail
RELEASE_SHA="$1"; RELEASE_BRANCH="$2"; RELEASE_BUILT="$3"; RELEASE_ID="$4"; SITE_URL="$5"
cd "/home/ubuntu/persiantoolbox-releases/$RELEASE_ID"

[ -f /home/ubuntu/persiantoolbox/.env ] && cp /home/ubuntu/persiantoolbox/.env .env && chmod 600 .env

cat > .env.release <<EOF
NEXT_PUBLIC_GIT_SHA=$RELEASE_SHA
NEXT_PUBLIC_GIT_BRANCH=$RELEASE_BRANCH
NEXT_PUBLIC_BUILD_DATE=$RELEASE_BUILT
RELEASE_GIT_SHA=$RELEASE_SHA
RELEASE_GIT_BRANCH=$RELEASE_BRANCH
RELEASE_BUILT_AT=$RELEASE_BUILT
APP_VERSION=$(node -p "require('./package.json').version")
EOF

sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
rm -rf .next

NODE_OPTIONS='--max-old-space-size=6144' \
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
NEXT_PUBLIC_GIT_SHA="$RELEASE_SHA" \
NEXT_PUBLIC_GIT_BRANCH="$RELEASE_BRANCH" \
NEXT_PUBLIC_BUILD_DATE="$RELEASE_BUILT" \
NODE_ENV=production \
npx next build 2>&1 | tee build.log || { tail -20 build.log; exit 1; }

[ ! -d ".next/standalone" ] || [ ! -f ".next/standalone/server.js" ] && echo "ERROR: incomplete build" && exit 1

rm -rf .next/standalone/.next/static && mkdir -p .next/standalone/.next/static
cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true
[ -f .env ] && cp .env .next/standalone/.env || true
[ -f .env.release ] && cp .env.release .next/standalone/.env.release || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

# CRITICAL: Copy ALL JS chunks from main build to standalone (standalone may miss some)
# This fixes the React hydration failure caused by missing JS chunks
JS_SRC=$(find .next/static/chunks -name '*.js' 2>/dev/null | wc -l)
JS_DST=$(find .next/standalone/.next/static/chunks -name '*.js' 2>/dev/null | wc -l)
if [ "$JS_SRC" -gt "$JS_DST" ]; then
  echo "⚠️ Standalone missing $((JS_SRC - JS_DST)) JS chunks — copying from main build"
  cp -r .next/static/chunks/*.js .next/standalone/.next/static/chunks/ 2>/dev/null || true
fi

CSS=$(find .next/standalone/.next/static -name '*.css' | wc -l)
JS_TOTAL=$(find .next/standalone/.next/static -name '*.js' | wc -l)
[ "$CSS" -eq 0 ] && echo "ERROR: No CSS" && exit 1
[ "$JS_TOTAL" -eq 0 ] && echo "ERROR: No JS chunks" && exit 1
echo "✅ Build: $CSS CSS, $JS_TOTAL JS chunks, worker=$(test -f .next/standalone/public/pdf.worker.min.mjs && echo yes || echo no)"
BUILD

# ── Step 5: Start new process ───────────────────────────────────
echo "=== Start new process (port $NEW_PORT) ==="
"${SSH[@]}" "$USER@$VPS" "bash /dev/stdin" "$NEW_SLOT" "$NEW_PORT" "$RELEASE_ID" "$RELEASE_SHA" <<'START'
set -Eeuo pipefail
NEW_SLOT="$1"; NEW_PORT="$2"; RELEASE_ID="$3"; RELEASE_SHA="$4"
SLOT_DIR="/home/ubuntu/persiantoolbox-slot-$NEW_SLOT"
RELEASE_DIR="/home/ubuntu/persiantoolbox-releases/$RELEASE_ID"
PROCESS_NAME="persiantoolbox-$NEW_SLOT"

ln -sfn "$RELEASE_DIR" "$SLOT_DIR"

# Never pass Node inspector into PM2 production processes (causes hang / 502).
# Scrub --inspect* from inherited NODE_OPTIONS; keep heap/other flags.
scrub_node_options() {
  local raw="${NODE_OPTIONS:-}"
  # shellcheck disable=SC2001
  echo "$raw" | sed -E 's/(^|[[:space:]])--inspect(-brk|-port)?(=[^[:space:]]*)?//g' | sed -E 's/[[:space:]]+/ /g' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g'
}
export NODE_OPTIONS="$(scrub_node_options)"
# Force clean production start env for PM2 child
export HOSTNAME=127.0.0.1

# Restart existing slot in place, otherwise start it.
if pm2 describe "$PROCESS_NAME" >/dev/null 2>&1; then
  PORT=$NEW_PORT HOSTNAME=127.0.0.1 NODE_OPTIONS="${NODE_OPTIONS:-}" \
    PM2_PROCESS_NAME="$PROCESS_NAME" PERSIANTOOLBOX_APP_DIR="$SLOT_DIR" \
    pm2 restart "$RELEASE_DIR/ecosystem.config.js" --only "$PROCESS_NAME" --update-env
else
  PORT=$NEW_PORT HOSTNAME=127.0.0.1 NODE_OPTIONS="${NODE_OPTIONS:-}" \
    PM2_PROCESS_NAME="$PROCESS_NAME" PERSIANTOOLBOX_APP_DIR="$SLOT_DIR" \
    pm2 start "$RELEASE_DIR/ecosystem.config.js" --only "$PROCESS_NAME" --update-env
fi

echo "Waiting for process (up to 45s)..."
for i in $(seq 1 45); do
  H=$(curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:$NEW_PORT/api/health" 2>/dev/null || true)
  if echo "$H" | grep -q '"status":"ok"'; then
    C=$(echo "$H" | grep -o '"commit":"[^"]*"' | head -1)
    echo "✅ Ready (attempt $i) $C"
    break
  fi
  [ "$i" -eq 45 ] && echo "❌ Process failed" && pm2 delete "$PROCESS_NAME" 2>/dev/null && exit 1
  sleep 1
done

VC=$(curl -s --max-time 5 "http://127.0.0.1:$NEW_PORT/api/version" 2>/dev/null | grep -o '"commit":"[^"]*"' | cut -d'"' -f4)
echo "$VC" | grep -q "${RELEASE_SHA:0:12}" && echo "✅ Commit verified" || { echo "❌ Commit mismatch"; exit 1; }
START

# ── Step 6: Switch nginx ────────────────────────────────────────
echo "=== Switch nginx (<1s downtime) ==="
"${SSH[@]}" "$USER@$VPS" "bash /dev/stdin" "$NEW_PORT" <<'SWITCH'
set -Eeuo pipefail
NEW_PORT="$1"
echo "upstream persiantoolbox_backend { server 127.0.0.1:$NEW_PORT; }" | sudo tee /etc/nginx/conf.d/persiantoolbox-upstream.conf > /dev/null
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx → port $NEW_PORT"
sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true
sudo rm -rf /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo mkdir -p /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo chown -R www-data:www-data /var/cache/nginx/persiantoolbox 2>/dev/null || true
echo "✅ Cache purged"
SWITCH

# ── Step 7: Verify ──────────────────────────────────────────────
echo "=== Verify ==="
sleep 2
STATUS=$(curl_public -s --connect-timeout 10 --max-time 20 "$SITE_URL/api/health" 2>/dev/null)
echo "Health: $(echo "$STATUS" | head -c 200)"
if ! echo "$STATUS" | grep -q '"status":"ok"'; then
  echo "❌ FAIL — rolling back"
  "${SSH[@]}" "$USER@$VPS" "echo 'upstream persiantoolbox_backend { server 127.0.0.1:$OLD_PORT; }' | sudo tee $NGINX_UPSTREAM > /dev/null && sudo nginx -t && sudo systemctl reload nginx"
  exit 1
fi
if ! echo "$STATUS" | grep -q "\"commit\":\"${RELEASE_SHA:0:12}\""; then
  echo "❌ Commit mismatch — rolling back"
  "${SSH[@]}" "$USER@$VPS" "echo 'upstream persiantoolbox_backend { server 127.0.0.1:$OLD_PORT; }' | sudo tee $NGINX_UPSTREAM > /dev/null && sudo nginx -t && sudo systemctl reload nginx"
  exit 1
fi

for p in "/" "/blog" "/about" "/pricing" "/tools" "/contract-tools" "/loan" "/salary"; do
  CODE=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$SITE_URL$p")
  echo "$p: $CODE"
  [ "$CODE" = "200" ] || { echo "❌ $p failed"; exit 1; }
done
echo "✅ All pages OK"

# ── Step 8: Cleanup ─────────────────────────────────────────────
echo "=== Cleanup ==="
"${SSH[@]}" "$USER@$VPS" "bash /dev/stdin" "$NEW_SLOT" "$RELEASE_ID" <<'CLEAN'
set -Eeuo pipefail
NEW_SLOT="$1"; RELEASE_ID="$2"
OLD_PROCESS="persiantoolbox-$([ "$NEW_SLOT" = "blue" ] && echo green || echo blue)"
pm2 delete "$OLD_PROCESS" 2>/dev/null || true
if pm2 describe "persiantoolbox" >/dev/null 2>&1; then
  pm2 delete "persiantoolbox" 2>/dev/null || true
fi
rm -f "/home/ubuntu/persiantoolbox-slot-$([ "$NEW_SLOT" = "blue" ] && echo green || echo blue)"
ln -sfn "/home/ubuntu/persiantoolbox-releases/$RELEASE_ID" /home/ubuntu/persiantoolbox-current
ln -sfn "/home/ubuntu/persiantoolbox-releases/$RELEASE_ID" /home/ubuntu/persiantoolbox
pm2 save >/dev/null 2>&1 || true
find /home/ubuntu/persiantoolbox-releases -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | sort -rn | awk 'NR>3 {print $2}' | xargs rm -rf 2>/dev/null || true
echo "✅ Done"
pm2 show "persiantoolbox-$NEW_SLOT" 2>/dev/null | grep -E "status|pid|memory" || true
CLEAN

echo ""
echo "=== ✅ Deploy complete ==="
echo "Slot: $NEW_SLOT (port $NEW_PORT) | Commit: ${RELEASE_SHA:0:12}"
