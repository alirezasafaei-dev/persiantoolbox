#!/bin/bash
# deploy-blue-green.sh — Zero-downtime blue-green production deploy
#
# Flow:
#   1. QA gate (local)
#   2. Detect current slot (blue/green)
#   3. Build new release in staging dir (production NOT affected)
#   4. Start new PM2 process on alternate port
#   5. Health check new process
#   6. Switch nginx upstream (atomic, <1s)
#   7. Stop old process after verification
#   8. Cleanup old releases
#
# Rollback: just switch nginx back to old upstream (<1s)
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
NGINX_UPSTREAM_CONF="/etc/nginx/conf.d/persiantoolbox-upstream.conf"

RELEASE_GIT_SHA=$(git rev-parse --verify HEAD)
RELEASE_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
RELEASE_BUILT_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RELEASE_ID="${RELEASE_GIT_SHA:0:12}-$(date -u +"%Y%m%dT%H%M%SZ")"

# Ports: blue=3000, green=3003 (3001=alirezasafaeisystems, 3002=audit)
BLUE_PORT=3000
GREEN_PORT=3003

curl_public() {
  env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy curl "$@"
}

echo "Release: ${RELEASE_GIT_BRANCH}@${RELEASE_GIT_SHA:0:12} (${RELEASE_BUILT_AT})"
echo "Release dir: ${REMOTE_RELEASES}/${RELEASE_ID}"

if [ -n "$(git status --porcelain)" ] && [ "${ALLOW_DIRTY_DEPLOY:-0}" != "1" ]; then
  echo "❌ Working tree is dirty. Commit/stash first, or set ALLOW_DIRTY_DEPLOY=1."
  git status --short
  exit 1
fi

# ── Step 0: QA Gate ─────────────────────────────────────────────
echo "=== Step 0: QA Gate ==="

pnpm pwa:shell:check 2>&1 | tail -3
pnpm pwa:sw:validate 2>&1 | tail -3
pnpm typecheck 2>&1 | tail -3

LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c " error " || true)
echo "$LINT_OUTPUT" | tail -3
if [ "$LINT_ERRORS" -gt 0 ]; then
  echo "❌ QA GATE: $LINT_ERRORS lint errors"
  exit 1
fi

pnpm vitest --run 2>&1 | tail -3

if [ ! -f "public/pdf.worker.min.mjs" ]; then
  cp -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs 2>/dev/null || true
fi
echo "✅ QA gate passed"

# ── Step 1: Detect current slot ─────────────────────────────────
echo "=== Step 1: Detect current slot ==="

CURRENT_SLOT=$("${SSH[@]}" "$USER@$VPS" "
  if [ -L '$REMOTE_CURRENT_LINK' ]; then
    TARGET=\$(readlink -f '$REMOTE_CURRENT_LINK')
    if echo \"\$TARGET\" | grep -q 'slot-blue'; then
      echo 'blue'
    elif echo \"\$TARGET\" | grep -q 'slot-green'; then
      echo 'green'
    else
      echo 'legacy'
    fi
  else
    echo 'legacy'
  fi
" 2>/dev/null || echo "legacy")

if [ "$CURRENT_SLOT" = "blue" ]; then
  NEW_SLOT="green"
  NEW_PORT=$GREEN_PORT
  OLD_SLOT="blue"
  OLD_PORT=$BLUE_PORT
else
  NEW_SLOT="blue"
  NEW_PORT=$BLUE_PORT
  OLD_SLOT="green"
  OLD_PORT=$GREEN_PORT
fi

echo "Current: $CURRENT_SLOT (port $OLD_PORT)"
echo "New: $NEW_SLOT (port $NEW_PORT)"

# ── Step 2: Setup nginx upstream if missing ──────────────────────
echo "=== Step 2: Ensure nginx upstream config ==="

"${SSH[@]}" "$USER@$VPS" bash -s <<SETUP_UPSTREAM
set -Eeuo pipefail

# Create upstream config if it doesn't exist
if [ ! -f "$NGINX_UPSTREAM_CONF" ]; then
  echo "Creating upstream config..."
  cat > "$NGINX_UPSTREAM_CONF" <<'UPSTREAM'
upstream persiantoolbox_backend {
    server 127.0.0.1:3000;
}
UPSTREAM
  sudo chown root:root "$NGINX_UPSTREAM_CONF"
fi

# Check if main nginx config uses the upstream
if ! grep -q "proxy_pass http://persiantoolbox_backend" /etc/nginx/sites-available/projects 2>/dev/null; then
  echo "Updating nginx to use upstream..."
  sudo sed -i 's|proxy_pass http://127.0.0.1:3000;|proxy_pass http://persiantoolbox_backend;|g' /etc/nginx/sites-available/projects
  sudo nginx -t && sudo systemctl reload nginx
  echo "✅ Nginx updated to use upstream"
else
  echo "✅ Nginx already uses upstream"
fi
SETUP_UPSTREAM

# ── Step 3: Rsync to release dir ────────────────────────────────
echo "=== Step 3: Rsync files ==="
"${SSH[@]}" "$USER@$VPS" "mkdir -p '$REMOTE_RELEASES/$RELEASE_ID'"

rsync -az --delete \
  --exclude='node_modules' --exclude='.next' --exclude='.git' \
  --exclude='*.log' --exclude='.env' --exclude='.env.*' \
  --exclude='coverage' --exclude='playwright-report' --exclude='test-results' \
  --exclude='tsconfig.tsbuildinfo' \
  -e "$RSYNC_SSH" \
  . "$USER@$VPS:$REMOTE_RELEASES/$RELEASE_ID/"

# ── Step 4: Build on VPS (production NOT affected) ──────────────
echo "=== Step 4: Build on VPS (production serving on port $OLD_PORT) ==="

"${SSH[@]}" "$USER@$VPS" bash -s <<REMOTE_BUILD
set -Eeuo pipefail

RELEASE_DIR="$REMOTE_RELEASES/$RELEASE_ID"
cd "\$RELEASE_DIR"

# Copy env from current live
CURRENT_ENV="$REMOTE_BASE/persiantoolbox/.env"
if [ -f "\$CURRENT_ENV" ]; then
  cp "\$CURRENT_ENV" .env
  chmod 600 .env
fi

cat > .env.release <<EOF
NEXT_PUBLIC_GIT_SHA=$RELEASE_GIT_SHA
NEXT_PUBLIC_GIT_BRANCH=$RELEASE_GIT_BRANCH
NEXT_PUBLIC_BUILD_DATE=$RELEASE_BUILT_AT
RELEASE_GIT_SHA=$RELEASE_GIT_SHA
RELEASE_GIT_BRANCH=$RELEASE_GIT_BRANCH
RELEASE_BUILT_AT=$RELEASE_BUILT_AT
APP_VERSION=\$(node -p "require('./package.json').version")
EOF

sed -i 's|../../shared/packages/payments|/home/ubuntu/shared/packages/payments|g' package.json
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

rm -rf .next
NODE_OPTIONS='--max-old-space-size=6144' \
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
NEXT_PUBLIC_GIT_SHA="$RELEASE_GIT_SHA" \
NEXT_PUBLIC_GIT_BRANCH="$RELEASE_GIT_BRANCH" \
NEXT_PUBLIC_BUILD_DATE="$RELEASE_BUILT_AT" \
NODE_ENV=production \
npx next build 2>&1 | tee build.log || {
  echo "❌ Build failed"
  tail -20 build.log
  exit 1
}

if [ ! -d ".next/standalone" ] || [ ! -f ".next/standalone/server.js" ]; then
  echo "ERROR: standalone build incomplete"
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

# Cleanup pollution
if ls .next/standalone/ 2>/dev/null | grep -qE '^(app|lib|components|AGENTS.md|package.json|deploy-vps)'; then
  find .next/standalone -maxdepth 1 -mindepth 1 ! -name '.next' ! -name 'public' ! -name 'server.js' ! -name 'node_modules' ! -name '.env' ! -name '.env.release' -exec rm -rf {} + 2>/dev/null || true
fi

CSS_COUNT=\$(find .next/standalone/.next/static -name '*.css' | wc -l)
WORKER_EXISTS="no"
[ -f ".next/standalone/public/pdf.worker.min.mjs" ] && WORKER_EXISTS="yes"
echo "Static: \$CSS_COUNT CSS, worker=\$WORKER_EXISTS"

[ "\$CSS_COUNT" -eq 0 ] && echo "ERROR: No CSS" && exit 1
[ "\$WORKER_EXISTS" = "no" ] && echo "ERROR: PDF worker missing" && exit 1

echo "✅ Build complete"
REMOTE_BUILD

# ── Step 5: Start new PM2 process ───────────────────────────────
echo "=== Step 5: Start new process (port $NEW_PORT) ==="

"${SSH[@]}" "$USER@$VPS" bash -s <<REMOTE_START
set -Eeuo pipefail

RELEASE_DIR="$REMOTE_RELEASES/$RELEASE_ID"
SLOT_DIR="$REMOTE_BASE/persiantoolbox-slot-$NEW_SLOT"

# Create slot symlink
ln -sfn "\$RELEASE_DIR" "\$SLOT_DIR"

# Stop old slot if running
pm2 delete "persiantoolbox-\$NEW_SLOT" 2>/dev/null || true

# Start new process
PORT=$NEW_PORT PERSIANTOOLBOX_APP_DIR="\$SLOT_DIR" \
  pm2 start "\$RELEASE_DIR/ecosystem.config.js" \
  --name "persiantoolbox-$NEW_SLOT" \
  --update-env

echo "Waiting for new process (up to 45s)..."
READY=0
for i in \$(seq 1 45); do
  HEALTH=\$(curl -s --connect-timeout 2 --max-time 3 "http://127.0.0.1:$NEW_PORT/api/health" 2>/dev/null || true)
  if echo "\$HEALTH" | grep -q '"status":"ok"'; then
    COMMIT=\$(echo "\$HEALTH" | grep -o '"commit":"[^"]*"' | head -1 || true)
    echo "✅ New process ready (attempt \$i) \$COMMIT"
    READY=1
    break
  fi
  sleep 1
done

if [ "\$READY" -ne 1 ]; then
  echo "❌ New process failed to start"
  pm2 delete "persiantoolbox-$NEW_SLOT" 2>/dev/null || true
  exit 1
fi

# Verify commit
RUNNING_COMMIT=\$(curl -s --max-time 5 "http://127.0.0.1:$NEW_PORT/api/version" 2>/dev/null | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
if echo "\$RUNNING_COMMIT" | grep -q "${RELEASE_GIT_SHA:0:12}"; then
  echo "✅ Commit verified: \$RUNNING_COMMIT"
else
  echo "❌ Commit mismatch: expected ${RELEASE_GIT_SHA:0:12}, got \$RUNNING_COMMIT"
  pm2 delete "persiantoolbox-$NEW_SLOT" 2>/dev/null || true
  exit 1
fi
REMOTE_START

# ── Step 6: Switch nginx (atomic, <1s) ──────────────────────────
echo "=== Step 6: Switch nginx upstream (production downtime: <1s) ==="

"${SSH[@]}" "$USER@$VPS" bash -s <<REMOTE_SWITCH
set -Eeuo pipefail

cat > "$NGINX_UPSTREAM_CONF" <<UPSTREAM
upstream persiantoolbox_backend {
    server 127.0.0.1:$NEW_PORT;
}
UPSTREAM

if sudo nginx -t 2>/dev/null; then
  sudo systemctl reload nginx
  echo "✅ Nginx switched to port $NEW_PORT"
else
  echo "❌ nginx -t failed"
  exit 1
fi

# Purge cache
sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true
sudo rm -rf /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo mkdir -p /var/cache/nginx/persiantoolbox/pages /var/cache/nginx/persiantoolbox/api 2>/dev/null || true
sudo chown -R www-data:www-data /var/cache/nginx/persiantoolbox 2>/dev/null || true
echo "✅ Cache purged"
REMOTE_SWITCH

# ── Step 7: Public verification ─────────────────────────────────
echo "=== Step 7: Public verification ==="
sleep 2

STATUS=$(curl_public -s --connect-timeout 10 --max-time 20 "$SITE_URL/api/health" 2>/dev/null)
echo "Health: $STATUS"
if ! echo "$STATUS" | grep -q '"status":"ok"'; then
  echo "❌ CRITICAL: health check failed — rolling back"
  "${SSH[@]}" "$USER@$VPS" bash -s <<ROLLBACK
cat > "$NGINX_UPSTREAM_CONF" <<UPSTREAM
upstream persiantoolbox_backend {
    server 127.0.0.1:$OLD_PORT;
}
UPSTREAM
sudo nginx -t && sudo systemctl reload nginx
ROLLBACK
  exit 1
fi

if ! echo "$STATUS" | grep -q "\"commit\":\"${RELEASE_GIT_SHA:0:12}\""; then
  echo "❌ CRITICAL: commit mismatch — rolling back"
  "${SSH[@]}" "$USER@$VPS" bash -s <<ROLLBACK
cat > "$NGINX_UPSTREAM_CONF" <<UPSTREAM
upstream persiantoolbox_backend {
    server 127.0.0.1:$OLD_PORT;
}
UPSTREAM
sudo nginx -t && sudo systemctl reload nginx
ROLLBACK
  exit 1
fi

for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/career-tools" "/business-tools" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl_public -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$SITE_URL${page}" 2>/dev/null)
  echo "${page}: HTTP ${CODE}"
  [ "$CODE" = "200" ] || { echo "❌ ${page} failed"; exit 1; }
done

# ── Step 8: Stop old process & cleanup ──────────────────────────
echo "=== Step 8: Cleanup ==="

"${SSH[@]}" "$USER@$VPS" bash -s <<CLEANUP
set -Eeuo pipefail

# Stop old process
pm2 delete "persiantoolbox-$OLD_SLOT" 2>/dev/null || true
rm -f "$REMOTE_BASE/persiantoolbox-slot-$OLD_SLOT"

# Update current link
ln -sfn "$REMOTE_RELEASES/$RELEASE_ID" "$REMOTE_CURRENT_LINK"
ln -sfn "$REMOTE_RELEASES/$RELEASE_ID" "$REMOTE_BASE/persiantoolbox"
pm2 save >/dev/null 2>&1 || true

# Cleanup old releases (keep last 3)
mapfile -t OLD < <(find "$REMOTE_RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | sort -rn | awk 'NR>3 {print \$2}')
for old in "\${OLD[@]}"; do
  [ "\$old" != "$REMOTE_RELEASES/$RELEASE_ID" ] && rm -rf "\$old" 2>/dev/null || true
done

echo "✅ Cleanup complete"
echo "Active slot: $NEW_SLOT"
pm2 show "persiantoolbox-$NEW_SLOT" 2>/dev/null | grep -E "name|status|pid|memory" || true
CLEANUP

echo ""
echo "=== ✅ Deploy complete ==="
echo "Slot: $NEW_SLOT (port $NEW_PORT)"
echo "Commit: ${RELEASE_GIT_SHA:0:12}"
echo "URL: $SITE_URL"
