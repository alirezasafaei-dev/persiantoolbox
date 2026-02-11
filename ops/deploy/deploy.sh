#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=""
BASE_DIR="/var/www/persian-tools"
SOURCE_DIR=""
RELEASE_ID=""
KEEP_RELEASES=3
RUN_MIGRATIONS=true
APP_SLUG="persian-tools"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --env <staging|production> --source-dir <path> [options]

Required:
  --env <name>             Target environment (staging, production)
  --source-dir <path>      Extracted release source directory

Optional:
  --app-slug <name>        Logical app slug (default: persian-tools)
  --base-dir <path>        Base directory on server (default: /var/www/persian-tools)
  --release-id <id>        Release identifier (default: UTC timestamp)
  --keep-releases <n>      Number of old releases to keep per env (default: 3)
  --run-migrations <bool>  Run pnpm db:migrate (default: true)
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENVIRONMENT="${2:-}"
      shift 2
      ;;
    --base-dir)
      BASE_DIR="${2:-}"
      shift 2
      ;;
    --app-slug)
      APP_SLUG="${2:-}"
      shift 2
      ;;
    --source-dir)
      SOURCE_DIR="${2:-}"
      shift 2
      ;;
    --release-id)
      RELEASE_ID="${2:-}"
      shift 2
      ;;
    --keep-releases)
      KEEP_RELEASES="${2:-}"
      shift 2
      ;;
    --run-migrations)
      RUN_MIGRATIONS="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[deploy] unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$ENVIRONMENT" || -z "$SOURCE_DIR" ]]; then
  usage
  exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "[deploy] unsupported environment: $ENVIRONMENT" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "[deploy] source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

if [[ -z "$RELEASE_ID" ]]; then
  RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "[deploy] rsync is required but not installed" >&2
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[deploy] pm2 is required but not installed" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[deploy] pnpm is required but not installed" >&2
  exit 1
fi

SHARED_DIR="$BASE_DIR/shared"
ENV_DIR="$SHARED_DIR/env"
LOG_DIR="$SHARED_DIR/logs"
RELEASES_DIR="$BASE_DIR/releases/$ENVIRONMENT"
CURRENT_LINK="$BASE_DIR/current/$ENVIRONMENT"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
ENV_FILE="$ENV_DIR/$ENVIRONMENT.env"
APP_NAME="$APP_SLUG-$ENVIRONMENT"
PORT="3001"

if [[ "$ENVIRONMENT" == "production" ]]; then
  PORT="3000"
fi

mkdir -p "$ENV_DIR" "$LOG_DIR" "$RELEASES_DIR" "$BASE_DIR/current"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] environment file not found: $ENV_FILE" >&2
  echo "[deploy] upload it first (chmod 600 recommended)." >&2
  exit 1
fi

mkdir -p "$RELEASE_DIR"
rsync -a --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'node_modules' \
  --exclude 'coverage' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  --exclude '.next/cache' \
  --exclude 'docs/snapshots' \
  "$SOURCE_DIR/" "$RELEASE_DIR/"

cd "$RELEASE_DIR"

corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.0 --activate >/dev/null 2>&1 || true

pnpm install --frozen-lockfile --prod --ignore-scripts

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

export NODE_ENV=production
export PORT

if [[ "$RUN_MIGRATIONS" == "true" ]]; then
  if [[ -n "${DATABASE_URL:-}" ]]; then
    echo "[deploy] running database migrations"
    pnpm db:migrate
  else
    echo "[deploy] skipping migrations because DATABASE_URL is empty"
  fi
fi

cat > ecosystem.config.cjs <<ECOSYSTEM
module.exports = {
  apps: [
    {
      name: '$APP_NAME',
      cwd: '$RELEASE_DIR',
      script: 'pnpm',
      args: 'start -- --hostname 127.0.0.1 --port $PORT',
      env: {
        NODE_ENV: 'production',
        PORT: '$PORT'
      },
      max_restarts: 10,
      restart_delay: 3000,
      out_file: '$LOG_DIR/$APP_NAME.out.log',
      error_file: '$LOG_DIR/$APP_NAME.err.log',
      merge_logs: true,
      time: true
    }
  ]
};
ECOSYSTEM

pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save >/dev/null 2>&1 || true

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

for attempt in {1..20}; do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    echo "[deploy] health check passed for $ENVIRONMENT on port $PORT"
    break
  fi

  if [[ "$attempt" -eq 20 ]]; then
    echo "[deploy] health check failed after 20 attempts" >&2
    exit 1
  fi

  sleep 2
done

mapfile -t releases < <(ls -1dt "$RELEASES_DIR"/* 2>/dev/null || true)
if (( ${#releases[@]} > KEEP_RELEASES )); then
  for old_release in "${releases[@]:KEEP_RELEASES}"; do
    rm -rf "$old_release"
  done
fi

echo "[deploy] completed $ENVIRONMENT release $RELEASE_ID"
