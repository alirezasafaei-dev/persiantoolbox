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
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10)
SSH=(ssh "${SSH_OPTS[@]}")
RSYNC_SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10"

SITE_URL="https://persiantoolbox.ir"
REMOTE_BASE="/home/ubuntu"
REMOTE_RELEASES="$REMOTE_BASE/persiantoolbox-releases"
REMOTE_CURRENT_LINK="$REMOTE_BASE/persiantoolbox-current"
NGINX_UPSTREAM="/etc/nginx/conf.d/persiantoolbox-upstream.conf"

RELEASE_SHA=$(git rev-parse --verify HEAD)
RELEASE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RELEASE_ID="${RELEASE_SHA:0:12}-$(date -u +"%Y%m%dT%H%M%SZ")"

BLUE_PORT=3000
GREEN_PORT=3003

curl_public() { env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy curl "$@"; }

echo "Release: ${RELEASE_BRANCH}@${RELEASE_SHA:0:12} (${RELEASE_BUILT})"
echo "Dir: ${REMOTE_RELEASES}/${RELEASE_ID}"

if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY_DEPLOY:-0}" != "1" ]; then
  echo "❌ Working tree dirty. Commit first or set ALLOW_DIRTY_DEPLOY=1"
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
CURRENT_SLOT=$("${SSH[@]}" "$USER@$VPS" "[ -L '$REMOTE_CURRENT_LINK' ] && readlink -f '$REMOTE_CURRENT_LINK'" 2>/dev/null || echo "")
if echo "$CURRENT_SLOT" | grep -q 'slot-blue'; then
  NEW_SLOT="green"; NEW_PORT=$GREEN_PORT; OLD_PORT=$BLUE_PORT
else
  NEW_SLOT="blue"; NEW_PORT=$BLUE_PORT; OLD_PORT=$GREEN_PORT
fi
echo "Current → New: port $OLD_PORT → port $NEW_PORT ($NEW_SLOT)"

# ── Step 2: Setup nginx upstream ─────────────────────────────────
echo "=== Nginx upstream ==="
"${SSH[@]}" "$USER@$VPS" "
if [ ! -f $NGINX_UPSTREAM ]; then
  echo 'upstream persiantoolbox_backend { server 127.0.0.1:3000; }' | sudo tee $NGINX_UPSTREAM > /dev/null
  echo 'Created upstream config'
fi
if ! grep -q proxy_pass.*persiantoolbox_backend /etc/nginx/sites-available/projects 2>/dev/null; then
  sudo sed -i 's|proxy_pass http://127.0.0.1:3000;|proxy_pass http://persiantoolbox_backend;|g' /etc/nginx/sites-available/projects
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

rm -rf .next/standalone/.next/static && mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r public/* .next/standalone/public/ 2>/dev/null || true
cp -r public/.well-known .next/standalone/public/ 2>/dev/null || true
[ -f .env ] && cp .env .next/standalone/.env || true
[ -f .env.release ] && cp .env.release .next/standalone/.env.release || true
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/

find .next/standalone -maxdepth 1 -mindepth 1 ! -name '.next' ! -name 'public' ! -name 'server.js' ! -name 'node_modules' ! -name '.env' ! -name '.env.release' -exec rm -rf {} + 2>/dev/null || true

CSS=$(find .next/standalone/.next/static -name '*.css' | wc -l)
[ "$CSS" -eq 0 ] && echo "ERROR: No CSS" && exit 1
echo "✅ Build: $CSS CSS, worker=$(test -f .next/standalone/public/pdf.worker.min.mjs && echo yes || echo no)"
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

# Stop old slot if running
pm2 delete "$PROCESS_NAME" 2>/dev/null || true

# Also stop legacy process if it exists
pm2 delete "persiantoolbox" 2>/dev/null || true

# Start new process
PORT=$NEW_PORT PERSIANTOOLBOX_APP_DIR="$SLOT_DIR" pm2 start "$RELEASE_DIR/ecosystem.config.js" --name "$PROCESS_NAME" --update-env

echo "Waiting for process (up to 45s)..."
for i in $(seq 1 45); do
  H=$(curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:$NEW_PORT/api/health" 2>/dev/null || true)
  if echo "$H" | grep -q '"status":"ok"'; then
    C=$(echo "$H" | grep -o '"commit":"[^"]*"' | head -1)
    echo "✅ Ready (attempt $i) $C"
    break
  fi
  [ "$i" -eq 45 ] && echo "❌ Process failed" && pm2 delete "persiantoolbox-$NEW_SLOT" 2>/dev/null && exit 1
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
pm2 delete "persiantoolbox-$([ "$NEW_SLOT" = "blue" ] && echo green || echo blue)" 2>/dev/null || true
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
