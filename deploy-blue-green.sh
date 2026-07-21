#!/usr/bin/env bash
set -Eeuo pipefail

source .env 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
SSH_USER="${DEPLOY_SSH_USER:-ubuntu}"
SSH_KEY="${DEPLOY_SSH_KEY_PATH:-/home/dev13/.ssh/id_ed25519}"
SSH_PORT="${SSH_PORT:-${VPS_PORT:-${PORT:-22}}}"
SITE_URL="${SITE_URL:-https://persiantoolbox.ir}"
REMOTE_BASE="${DEPLOY_BASE_DIR:-/home/ubuntu/persiantoolbox-blue-green}"
REMOTE_ENV_FILE="${PRODUCTION_ENV_FILE:-$REMOTE_BASE/shared/env/production.env}"
REMOTE_ENV_SOURCE="${PRODUCTION_ENV_SOURCE:-}"
LEGACY_RELEASES_DIR="${LEGACY_RELEASES_DIR:-/home/ubuntu/persiantoolbox-releases}"
STATIC_STORE="${STATIC_STORE:-/home/ubuntu/persiantoolbox-shared-assets}"
UPSTREAM_FILE="${UPSTREAM_FILE:-/etc/nginx/conf.d/persiantoolbox-upstream.conf}"
STATIC_SAFETY_MARKER="${STATIC_SAFETY_MARKER:-/etc/nginx/.persiantoolbox-static-safe}"
DEPLOY_GUARD_NAME="${DEPLOY_GUARD_NAME:-persiantoolbox-blue-green}"
ALLOW_RECOVERY_DEPLOY="${ALLOW_RECOVERY_DEPLOY:-false}"
EXPECTED_CURRENT_SHA="${PRODUCTION_CURRENT_SHA:-}"

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
if [[ -n "$EXPECTED_CURRENT_SHA" && ! "$EXPECTED_CURRENT_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "[deploy] PRODUCTION_CURRENT_SHA must be an exact 40-character SHA" >&2
  exit 64
fi
if [[ "$ALLOW_RECOVERY_DEPLOY" != "true" && "$ALLOW_RECOVERY_DEPLOY" != "false" ]]; then
  echo "[deploy] ALLOW_RECOVERY_DEPLOY must be true or false" >&2
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

"${SSH[@]}" "$SSH_USER@$VPS" bash -s -- \
  "$REMOTE_SOURCE" "$REMOTE_BASE" "$STATIC_SAFETY_MARKER" <<'REMOTE_PREFLIGHT'
set -Eeuo pipefail
REMOTE_SOURCE="$1"
REMOTE_BASE="$2"
STATIC_SAFETY_MARKER="$3"
test -f "$STATIC_SAFETY_MARKER"
mkdir -p "$REMOTE_SOURCE" "$REMOTE_BASE/tmp"
REMOTE_PREFLIGHT

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

"${SSH[@]}" "$SSH_USER@$VPS" bash -s -- \
  "$REMOTE_SOURCE" \
  "$REMOTE_BASE" \
  "$REMOTE_ENV_FILE" \
  "$REMOTE_ENV_SOURCE" \
  "$EXPECTED_CURRENT_SHA" \
  "$LEGACY_RELEASES_DIR" \
  "$STATIC_STORE" \
  "$UPSTREAM_FILE" \
  "$ALLOW_RECOVERY_DEPLOY" \
  "$RELEASE_SHA" \
  "$RELEASE_ID" \
  "$SITE_URL" \
  "${RUN_MIGRATIONS:-false}" <<'REMOTE_DEPLOY'
set -Eeuo pipefail
REMOTE_SOURCE="$1"
REMOTE_BASE="$2"
REMOTE_ENV_FILE="$3"
REMOTE_ENV_SOURCE="$4"
EXPECTED_CURRENT_SHA="$5"
LEGACY_RELEASES_DIR="$6"
STATIC_STORE="$7"
UPSTREAM_FILE="$8"
ALLOW_RECOVERY_DEPLOY="$9"
RELEASE_SHA="${10}"
RELEASE_ID="${11}"
SITE_URL="${12}"
RUN_MIGRATIONS="${13}"

chmod +x \
  "$REMOTE_SOURCE/ops/deploy/deploy-production-blue-green.sh" \
  "$REMOTE_SOURCE/ops/deploy/rollback.sh" \
  "$REMOTE_SOURCE/scripts/deploy/assert-production-safety.sh" \
  "$REMOTE_SOURCE/scripts/deploy/bootstrap-production-layout.sh" \
  "$REMOTE_SOURCE/scripts/deploy/sync-retained-static-assets.sh" \
  "$REMOTE_SOURCE/scripts/deploy/verify-release-assets.sh"

bootstrap_args=(
  --base-dir "$REMOTE_BASE"
  --env-file "$REMOTE_ENV_FILE"
  --upstream-file "$UPSTREAM_FILE"
  --legacy-releases-dir "$LEGACY_RELEASES_DIR"
  --static-store "$STATIC_STORE"
)
[[ -n "$REMOTE_ENV_SOURCE" ]] && bootstrap_args+=(--env-source "$REMOTE_ENV_SOURCE")
[[ -n "$EXPECTED_CURRENT_SHA" ]] && bootstrap_args+=(--expected-current-sha "$EXPECTED_CURRENT_SHA")
"$REMOTE_SOURCE/scripts/deploy/bootstrap-production-layout.sh" "${bootstrap_args[@]}"

set -a
source "$REMOTE_BASE/shared/deploy/bootstrap-current.env"
set +a

STATIC_STORE="$STATIC_STORE" \
PRIMARY_RELEASES="$REMOTE_BASE/releases/production" \
LEGACY_RELEASES="$LEGACY_RELEASES_DIR" \
  "$REMOTE_SOURCE/scripts/deploy/sync-retained-static-assets.sh"

ALLOW_RECOVERY_DEPLOY="$ALLOW_RECOVERY_DEPLOY" \
SOURCE_GIT_SHA="$RELEASE_SHA" \
CURRENT_PROCESS_OVERRIDE="$CURRENT_PROCESS_OVERRIDE" \
CURRENT_RELEASE_OVERRIDE="$CURRENT_RELEASE_OVERRIDE" \
CURRENT_PORT_OVERRIDE="$CURRENT_PORT_OVERRIDE" \
CURRENT_SLOT_OVERRIDE="$CURRENT_SLOT_OVERRIDE" \
CURRENT_COMMIT_OVERRIDE="$CURRENT_COMMIT_OVERRIDE" \
  "$REMOTE_SOURCE/ops/deploy/deploy-production-blue-green.sh" \
    --app-slug persian-tools \
    --base-dir "$REMOTE_BASE" \
    --source-dir "$REMOTE_SOURCE" \
    --release-id "$RELEASE_ID" \
    --keep-releases 5 \
    --run-migrations "$RUN_MIGRATIONS" \
    --base-url "$SITE_URL" \
    --env-file "$REMOTE_ENV_FILE" \
    --upstream-file "$UPSTREAM_FILE" \
    --static-store "$STATIC_STORE"

if ! "$REMOTE_BASE/current/production/scripts/deploy/assert-production-safety.sh" \
    "$RELEASE_SHA" "$SITE_URL" "$REMOTE_BASE"; then
  echo '[deploy] strict production audit failed; rolling back' >&2
  "$REMOTE_BASE/current/production/ops/deploy/rollback.sh" \
    --env production \
    --base-dir "$REMOTE_BASE" \
    --base-url "$SITE_URL"
  exit 1
fi
REMOTE_DEPLOY

echo "[deploy] production release complete and audited: ${RELEASE_SHA:0:12}"
