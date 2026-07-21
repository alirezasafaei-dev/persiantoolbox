#!/usr/bin/env bash
set -Eeuo pipefail

ENVIRONMENT=""
BASE_DIR="/var/www/persian-tools"
SOURCE_DIR=""
RELEASE_ID=""
KEEP_RELEASES=3
RUN_MIGRATIONS=true
APP_SLUG="persian-tools"
BASE_URL=""
ENV_FILE=""

usage() {
  cat <<USAGE
Usage: $(basename "$0") --env <staging|production> --source-dir <path> [options]

Required:
  --env <name>             Target environment
  --source-dir <path>      Extracted release source directory

Options:
  --app-slug <name>        Logical app slug
  --base-dir <path>        Deployment base directory
  --release-id <id>        Immutable release identifier
  --keep-releases <n>      Number of releases to retain
  --run-migrations <bool>  Run database migrations
  --base-url <url>         Public URL used by production verification
  --env-file <path>        Explicit environment file
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENVIRONMENT="${2:-}"; shift 2 ;;
    --base-dir) BASE_DIR="${2:-}"; shift 2 ;;
    --app-slug) APP_SLUG="${2:-}"; shift 2 ;;
    --source-dir) SOURCE_DIR="${2:-}"; shift 2 ;;
    --release-id) RELEASE_ID="${2:-}"; shift 2 ;;
    --keep-releases) KEEP_RELEASES="${2:-}"; shift 2 ;;
    --run-migrations) RUN_MIGRATIONS="${2:-}"; shift 2 ;;
    --base-url) BASE_URL="${2:-}"; shift 2 ;;
    --env-file) ENV_FILE="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[deploy] unknown argument: $1" >&2; usage; exit 64 ;;
  esac
done

if [[ -z "$ENVIRONMENT" || -z "$SOURCE_DIR" ]]; then
  usage
  exit 64
fi
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "[deploy] unsupported environment: $ENVIRONMENT" >&2
  exit 64
fi
if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "[deploy] source directory not found: $SOURCE_DIR" >&2
  exit 1
fi
if [[ -z "$RELEASE_ID" ]]; then
  RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
fi
if [[ -z "$ENV_FILE" ]]; then
  ENV_FILE="$BASE_DIR/shared/env/$ENVIRONMENT.env"
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  PROD_SCRIPT="$SOURCE_DIR/ops/deploy/deploy-production-blue-green.sh"
  [[ -x "$PROD_SCRIPT" ]] || chmod +x "$PROD_SCRIPT"
  exec "$PROD_SCRIPT" \
    --app-slug "$APP_SLUG" \
    --base-dir "$BASE_DIR" \
    --source-dir "$SOURCE_DIR" \
    --release-id "$RELEASE_ID" \
    --keep-releases "$KEEP_RELEASES" \
    --run-migrations "$RUN_MIGRATIONS" \
    --base-url "${BASE_URL:-https://persiantoolbox.ir}" \
    --env-file "$ENV_FILE"
fi

# Staging is isolated on port 3001 and never switches production traffic.
for command in rsync pm2 pnpm curl; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[deploy] required command missing: $command" >&2
    exit 1
  }
done
[[ -f "$ENV_FILE" ]] || {
  echo "[deploy] environment file missing: $ENV_FILE" >&2
  exit 1
}

SHARED_DIR="$BASE_DIR/shared"
LOG_DIR="$SHARED_DIR/logs"
RELEASES_DIR="$BASE_DIR/releases/staging"
CURRENT_LINK="$BASE_DIR/current/staging"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
APP_NAME="$APP_SLUG-staging"
PORT=3001

mkdir -p "$LOG_DIR" "$RELEASES_DIR" "$BASE_DIR/current"
[[ ! -e "$RELEASE_DIR" ]] || {
  echo "[deploy] immutable release already exists: $RELEASE_DIR" >&2
  exit 1
}
mkdir -p "$RELEASE_DIR"
rsync -a --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '.next' \
  --exclude 'node_modules' \
  --exclude 'coverage' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  --exclude 'tsconfig.tsbuildinfo' \
  "$SOURCE_DIR/" "$RELEASE_DIR/"

install -m 600 "$ENV_FILE" "$RELEASE_DIR/.env"
cd "$RELEASE_DIR"
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.0 --activate >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

set -a
# shellcheck disable=SC1090
source "$RELEASE_DIR/.env"
set +a
export NODE_ENV=production
export PORT
pnpm build

[[ -f .next/standalone/server.js ]] || {
  echo "[deploy] staging standalone build missing" >&2
  exit 1
}
rm -rf .next/standalone/.next/static .next/standalone/public
mkdir -p .next/standalone/.next/static .next/standalone/public
cp -a .next/static/. .next/standalone/.next/static/
cp -a public/. .next/standalone/public/
install -m 600 .env .next/standalone/.env

if [[ "$RUN_MIGRATIONS" == "true" ]]; then
  [[ -n "${DATABASE_URL:-}" ]] || {
    echo "[deploy] DATABASE_URL required for staging migrations" >&2
    exit 1
  }
  pnpm db:migrate
elif [[ "$RUN_MIGRATIONS" != "false" ]]; then
  echo "[deploy] --run-migrations must be true or false" >&2
  exit 64
fi

cat > ecosystem.staging.cjs <<ECOSYSTEM
module.exports = {
  apps: [{
    name: '$APP_NAME',
    cwd: '$RELEASE_DIR',
    script: '.next/standalone/server.js',
    env: { NODE_ENV: 'production', PORT: '$PORT', HOSTNAME: '127.0.0.1' },
    max_restarts: 10,
    restart_delay: 3000,
    out_file: '$LOG_DIR/$APP_NAME.out.log',
    error_file: '$LOG_DIR/$APP_NAME.err.log',
    merge_logs: true,
    time: true
  }]
};
ECOSYSTEM

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart ecosystem.staging.cjs --only "$APP_NAME" --update-env
else
  pm2 start ecosystem.staging.cjs --only "$APP_NAME" --update-env
fi

for attempt in $(seq 1 45); do
  if curl -fsS --connect-timeout 2 --max-time 5 "http://127.0.0.1:$PORT/api/health" \
    | grep -q '"status":"ok"'; then
    break
  fi
  if [[ "$attempt" -eq 45 ]]; then
    echo "[deploy] staging health check failed" >&2
    exit 1
  fi
  sleep 1
done

bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" "http://127.0.0.1:$PORT" "${SOURCE_GIT_SHA:-}"
TMP_LINK="${CURRENT_LINK}.tmp.$$"
ln -s "$RELEASE_DIR" "$TMP_LINK"
mv -Tf "$TMP_LINK" "$CURRENT_LINK"
pm2 save >/dev/null 2>&1 || true

mapfile -t releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@\t%p\n' | sort -rn | cut -f2-)
if (( ${#releases[@]} > KEEP_RELEASES )); then
  for old_release in "${releases[@]:KEEP_RELEASES}"; do
    [[ "$old_release" == "$RELEASE_DIR" ]] || rm -rf "$old_release"
  done
fi

echo "[deploy] completed staging release $RELEASE_ID"
