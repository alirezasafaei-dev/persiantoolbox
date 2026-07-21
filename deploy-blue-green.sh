#!/usr/bin/env bash
# Manual production entrypoint. All production mutations are delegated to the
# canonical fail-closed server-side blue/green deployer.
set -Eeuo pipefail

source .env 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
SSH_USER="${DEPLOY_SSH_USER:-ubuntu}"
SSH_KEY="${DEPLOY_SSH_KEY_PATH:-/home/dev13/.ssh/id_ed25519}"
SSH_PORT="${SSH_PORT:-${VPS_PORT:-${PORT:-22}}}"
SITE_URL="${SITE_URL:-https://persiantoolbox.ir}"
REMOTE_BASE="${DEPLOY_BASE_DIR:-/var/www/persian-tools}"
REMOTE_ENV_FILE="${PRODUCTION_ENV_FILE:-$REMOTE_BASE/shared/env/production.env}"
DEPLOY_GUARD_NAME="${DEPLOY_GUARD_NAME:-persiantoolbox-blue-green}"

SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SSH_PORT"
  -o StrictHostKeyChecking=accept-new
  -o ServerAliveInterval=30
  -o ServerAliveCountMax=10
  -o TCPKeepAlive=yes
)
SSH=(ssh "${SSH_OPTS[@]}")
RSYNC_SSH="ssh -i $SSH_KEY -p $SSH_PORT -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -o TCPKeepAlive=yes"

RELEASE_SHA="$(git rev-parse --verify HEAD)"
RELEASE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RELEASE_ID="production-manual-$(date -u +%Y%m%dT%H%M%SZ)-${RELEASE_SHA:0:12}"
REMOTE_SOURCE="$REMOTE_BASE/tmp/$RELEASE_ID"
CONFIRMED_SHA="${PRODUCTION_DEPLOY_SHA:-}"

if [[ ! "$CONFIRMED_SHA" =~ ^[0-9a-f]{40}$ || "$CONFIRMED_SHA" != "$RELEASE_SHA" ]]; then
  echo "[deploy] set PRODUCTION_DEPLOY_SHA=$RELEASE_SHA to confirm the exact production release" >&2
  exit 64
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "[deploy] working tree must be clean" >&2
  exit 1
fi
if [[ "$RELEASE_BRANCH" != "main" && "${ALLOW_NON_MAIN_PRODUCTION_DEPLOY:-false}" != "true" ]]; then
  echo "[deploy] production deploys must originate from main" >&2
  exit 1
fi

for command in pnpm rsync ssh git; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[deploy] required command missing: $command" >&2
    exit 1
  }
done

release_guard() {
  "${SSH[@]}" "$SSH_USER@$VPS" "sudo bash /usr/local/bin/deploy-guard --unlock" >/dev/null 2>&1 || true
}
cleanup_remote_source() {
  "${SSH[@]}" "$SSH_USER@$VPS" "rm -rf '$REMOTE_SOURCE'" >/dev/null 2>&1 || true
}
trap 'cleanup_remote_source; release_guard' EXIT

"${SSH[@]}" "$SSH_USER@$VPS" "sudo bash /usr/local/bin/deploy-guard --guard '$DEPLOY_GUARD_NAME'"

pnpm ci:quick
pnpm ci:contracts
pnpm build
pnpm predeploy:smoke

"${SSH[@]}" "$SSH_USER@$VPS" "
  set -euo pipefail
  test -f '$REMOTE_ENV_FILE'
  test -f /etc/nginx/.persiantoolbox-static-safe
  mkdir -p '$REMOTE_SOURCE'
"

rsync -az --delete \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='coverage' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  --exclude='tsconfig.tsbuildinfo' \
  -e "$RSYNC_SSH" \
  ./ "$SSH_USER@$VPS:$REMOTE_SOURCE/"

printf '%s\n' "$RELEASE_SHA" \
  | "${SSH[@]}" "$SSH_USER@$VPS" "cat > '$REMOTE_SOURCE/.git-revision'"

"${SSH[@]}" "$SSH_USER@$VPS" "
  set -euo pipefail
  chmod +x \
    '$REMOTE_SOURCE/ops/deploy/deploy-production-blue-green.sh' \
    '$REMOTE_SOURCE/scripts/deploy/verify-release-assets.sh'
  SOURCE_GIT_SHA='$RELEASE_SHA' \
    '$REMOTE_SOURCE/ops/deploy/deploy-production-blue-green.sh' \
      --app-slug persian-tools \
      --base-dir '$REMOTE_BASE' \
      --source-dir '$REMOTE_SOURCE' \
      --release-id '$RELEASE_ID' \
      --keep-releases 5 \
      --run-migrations '${RUN_MIGRATIONS:-false}' \
      --base-url '$SITE_URL' \
      --env-file '$REMOTE_ENV_FILE'
"

echo "[deploy] production release complete: ${RELEASE_SHA:0:12}"
