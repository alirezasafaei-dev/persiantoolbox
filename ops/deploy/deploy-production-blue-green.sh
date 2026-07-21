#!/usr/bin/env bash
set -Eeuo pipefail

APP_SLUG="persian-tools"
BASE_DIR="/var/www/persian-tools"
SOURCE_DIR=""
RELEASE_ID=""
KEEP_RELEASES=5
RUN_MIGRATIONS=false
BASE_URL="https://persiantoolbox.ir"
ENV_FILE=""
UPSTREAM_FILE="/etc/nginx/conf.d/persiantoolbox-upstream.conf"
STATIC_STORE="/home/ubuntu/persiantoolbox-shared-assets"
STATIC_SAFETY_MARKER="/etc/nginx/.persiantoolbox-static-safe"
BLUE_PORT=3000
GREEN_PORT=3003

usage() {
  cat <<USAGE
Usage: $(basename "$0") --source-dir <path> --release-id <id> [options]

Required:
  --source-dir <path>       Extracted release source directory
  --release-id <id>        Immutable release identifier

Options:
  --app-slug <name>        Logical app slug (default: persian-tools)
  --base-dir <path>        Deployment base (default: /var/www/persian-tools)
  --keep-releases <n>      Releases to retain (default: 5)
  --run-migrations <bool>  Run pnpm db:migrate before traffic switch
  --base-url <url>         Public production URL
  --env-file <path>        Production environment file
  --upstream-file <path>   Nginx upstream include
  --static-store <path>    Shared immutable Next static store
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-slug) APP_SLUG="${2:-}"; shift 2 ;;
    --base-dir) BASE_DIR="${2:-}"; shift 2 ;;
    --source-dir) SOURCE_DIR="${2:-}"; shift 2 ;;
    --release-id) RELEASE_ID="${2:-}"; shift 2 ;;
    --keep-releases) KEEP_RELEASES="${2:-}"; shift 2 ;;
    --run-migrations) RUN_MIGRATIONS="${2:-}"; shift 2 ;;
    --base-url) BASE_URL="${2:-}"; shift 2 ;;
    --env-file) ENV_FILE="${2:-}"; shift 2 ;;
    --upstream-file) UPSTREAM_FILE="${2:-}"; shift 2 ;;
    --static-store) STATIC_STORE="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[production-deploy] unknown argument: $1" >&2; usage; exit 64 ;;
  esac
done

if [[ -z "$SOURCE_DIR" || -z "$RELEASE_ID" ]]; then
  usage
  exit 64
fi
if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "[production-deploy] source directory not found: $SOURCE_DIR" >&2
  exit 1
fi
if [[ -z "$ENV_FILE" ]]; then
  ENV_FILE="$BASE_DIR/shared/env/production.env"
fi

for command in rsync pnpm pm2 curl flock find sort diff sudo; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[production-deploy] required command missing: $command" >&2
    exit 1
  }
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[production-deploy] production environment file missing: $ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$STATIC_SAFETY_MARKER" ]]; then
  echo "[production-deploy] safe static routing is not provisioned: $STATIC_SAFETY_MARKER" >&2
  echo "[production-deploy] run scripts/deploy/provision-static-asset-store.sh first" >&2
  exit 1
fi

MARKER_STORE="$(sudo awk -F= '$1 == "STATIC_STORE" { print substr($0, index($0, "=") + 1) }' "$STATIC_SAFETY_MARKER" | tail -1)"
if [[ -z "$MARKER_STORE" || "$MARKER_STORE" != "$STATIC_STORE" ]]; then
  echo "[production-deploy] static safety marker does not match configured store" >&2
  exit 1
fi

SHARED_DIR="$BASE_DIR/shared"
RELEASES_DIR="$BASE_DIR/releases/production"
CURRENT_LINK="$BASE_DIR/current/production"
STATE_DIR="$SHARED_DIR/deploy"
LOG_DIR="$SHARED_DIR/logs"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
LOCK_FILE="$STATE_DIR/production.lock"
STATE_FILE="$STATE_DIR/production-current.env"

mkdir -p "$RELEASES_DIR" "$BASE_DIR/current" "$STATE_DIR" "$LOG_DIR"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[production-deploy] another production deployment is active" >&2
  exit 1
fi

BASE_URL="${BASE_URL%/}"
SOURCE_GIT_SHA="${SOURCE_GIT_SHA:-}"
ALLOW_RECOVERY_DEPLOY="${ALLOW_RECOVERY_DEPLOY:-false}"
ALLOW_LEGACY_CACHE_BOOTSTRAP="${ALLOW_LEGACY_CACHE_BOOTSTRAP:-false}"
if [[ "$ALLOW_RECOVERY_DEPLOY" != "true" && "$ALLOW_RECOVERY_DEPLOY" != "false" ]]; then
  echo "[production-deploy] ALLOW_RECOVERY_DEPLOY must be true or false" >&2
  exit 64
fi
if [[ "$ALLOW_LEGACY_CACHE_BOOTSTRAP" != "true" && "$ALLOW_LEGACY_CACHE_BOOTSTRAP" != "false" ]]; then
  echo "[production-deploy] ALLOW_LEGACY_CACHE_BOOTSTRAP must be true or false" >&2
  exit 64
fi
if [[ -z "$SOURCE_GIT_SHA" && -f "$SOURCE_DIR/.git-revision" ]]; then
  SOURCE_GIT_SHA="$(tr -d '[:space:]' < "$SOURCE_DIR/.git-revision")"
fi
if [[ ! "$SOURCE_GIT_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "[production-deploy] SOURCE_GIT_SHA must be the exact 40-character release SHA" >&2
  exit 1
fi

CURRENT_UPSTREAM_CONTENT=""
CURRENT_PORT=""
if sudo test -f "$UPSTREAM_FILE"; then
  CURRENT_UPSTREAM_CONTENT="$(sudo cat "$UPSTREAM_FILE")"
  CURRENT_PORT="$(printf '%s' "$CURRENT_UPSTREAM_CONTENT" | grep -oE '127\.0\.0\.1:[0-9]+' | head -1 | cut -d: -f2 || true)"
fi

if [[ "$CURRENT_PORT" != "$BLUE_PORT" && "$CURRENT_PORT" != "$GREEN_PORT" ]]; then
  for candidate_port in "$BLUE_PORT" "$GREEN_PORT"; do
    if curl -fsS --connect-timeout 2 --max-time 5 "http://127.0.0.1:$candidate_port/api/version" >/dev/null; then
      CURRENT_PORT="$candidate_port"
      CURRENT_UPSTREAM_CONTENT="upstream persiantoolbox_backend { server 127.0.0.1:$candidate_port; }"
      break
    fi
  done
fi

if [[ "$CURRENT_PORT" != "$BLUE_PORT" && "$CURRENT_PORT" != "$GREEN_PORT" ]]; then
  echo "[production-deploy] cannot identify a running active production slot" >&2
  exit 1
fi

if [[ "$CURRENT_PORT" == "$BLUE_PORT" ]]; then
  CURRENT_SLOT="blue"
  NEW_SLOT="green"
  NEW_PORT="$GREEN_PORT"
else
  CURRENT_SLOT="green"
  NEW_SLOT="blue"
  NEW_PORT="$BLUE_PORT"
fi

CURRENT_PROCESS="persiantoolbox-$CURRENT_SLOT"
NEW_PROCESS="persiantoolbox-$NEW_SLOT"
CURRENT_RELEASE="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
if [[ -z "$CURRENT_RELEASE" || ! -d "$CURRENT_RELEASE" ]]; then
  CURRENT_RELEASE="$(readlink -f /home/ubuntu/persiantoolbox 2>/dev/null || true)"
fi
CURRENT_COMMIT="$(curl -fsS --connect-timeout 3 --max-time 8 "http://127.0.0.1:$CURRENT_PORT/api/version" \
  | sed -nE 's/.*"commit":"([^"]+)".*/\1/p' | head -1 || true)"
VERIFY_SCRIPT="$SOURCE_DIR/scripts/deploy/verify-release-assets.sh"
CURRENT_VERIFY_HEALTH=true
if [[ "$ALLOW_RECOVERY_DEPLOY" == "true" ]]; then
  CURRENT_VERIFY_HEALTH=false
  echo "[production-deploy] recovery mode: current-release health is skipped, assets and commit remain mandatory" >&2
fi
CURRENT_VERIFY_CACHE_HEADERS=true
if [[ "$ALLOW_LEGACY_CACHE_BOOTSTRAP" == "true" ]]; then
  CURRENT_VERIFY_CACHE_HEADERS=false
  echo "[production-deploy] legacy cache bootstrap: only current-release cache headers are skipped" >&2
fi

VERIFY_HEALTH="$CURRENT_VERIFY_HEALTH" VERIFY_CACHE_HEADERS="$CURRENT_VERIFY_CACHE_HEADERS" \
  bash "$VERIFY_SCRIPT" "http://127.0.0.1:$CURRENT_PORT" "$CURRENT_COMMIT"
VERIFY_HEALTH="$CURRENT_VERIFY_HEALTH" VERIFY_CACHE_HEADERS="$CURRENT_VERIFY_CACHE_HEADERS" \
  bash "$VERIFY_SCRIPT" "$BASE_URL" "$CURRENT_COMMIT"

echo "[production-deploy] active=$CURRENT_SLOT:$CURRENT_PORT candidate=$NEW_SLOT:$NEW_PORT release=${SOURCE_GIT_SHA:0:12}"

if [[ -e "$RELEASE_DIR" ]]; then
  echo "[production-deploy] immutable release directory already exists: $RELEASE_DIR" >&2
  exit 1
fi
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
printf '%s\n' "$SOURCE_GIT_SHA" > "$RELEASE_DIR/.git-revision"
cat > "$RELEASE_DIR/.env.release" <<ENVRELEASE
NEXT_PUBLIC_GIT_SHA=$SOURCE_GIT_SHA
RELEASE_GIT_SHA=$SOURCE_GIT_SHA
RELEASE_BUILT_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ENVRELEASE
chmod 600 "$RELEASE_DIR/.env.release"

cd "$RELEASE_DIR"
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.0 --activate >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

set -a
# shellcheck disable=SC1090
source "$RELEASE_DIR/.env"
# shellcheck disable=SC1090
source "$RELEASE_DIR/.env.release"
set +a
export NODE_ENV=production
export NEXT_PUBLIC_GIT_SHA="$SOURCE_GIT_SHA"
export RELEASE_GIT_SHA="$SOURCE_GIT_SHA"

rm -rf .next
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}" pnpm build

[[ -f .next/standalone/server.js ]] || {
  echo "[production-deploy] standalone server missing" >&2
  exit 1
}
[[ -d .next/static ]] || {
  echo "[production-deploy] .next/static missing" >&2
  exit 1
}

rm -rf .next/standalone/.next/static .next/standalone/public
mkdir -p .next/standalone/.next/static .next/standalone/public
cp -a .next/static/. .next/standalone/.next/static/
cp -a public/. .next/standalone/public/
install -m 600 .env .next/standalone/.env
install -m 600 .env.release .next/standalone/.env.release

find .next/static -type f -printf '%P\t%s\n' | sort > .next/static.manifest
find .next/standalone/.next/static -type f -printf '%P\t%s\n' | sort > .next/standalone-static.manifest
diff -u .next/static.manifest .next/standalone-static.manifest

grep -q $'\.css\t' .next/static.manifest || {
  echo "[production-deploy] no CSS generated" >&2
  exit 1
}
grep -q $'\.js\t' .next/static.manifest || {
  echo "[production-deploy] no JS generated" >&2
  exit 1
}

if [[ "$RUN_MIGRATIONS" == "true" ]]; then
  [[ -n "${DATABASE_URL:-}" ]] || {
    echo "[production-deploy] DATABASE_URL is required for migrations" >&2
    exit 1
  }
  pnpm db:migrate
elif [[ "$RUN_MIGRATIONS" != "false" ]]; then
  echo "[production-deploy] --run-migrations must be true or false" >&2
  exit 64
fi

UPSTREAM_BACKUP="$STATE_DIR/upstream-before-$RELEASE_ID.conf"
printf '%s\n' "$CURRENT_UPSTREAM_CONTENT" > "$UPSTREAM_BACKUP"
chmod 600 "$UPSTREAM_BACKUP"
SWITCHED=false

rollback() {
  local reason="${1:-unknown failure}"
  echo "[production-deploy] rollback: $reason" >&2
  if [[ "$SWITCHED" == "true" ]]; then
    sudo install -m 644 "$UPSTREAM_BACKUP" "$UPSTREAM_FILE"
    sudo nginx -t
    sudo systemctl reload nginx
    sudo find /var/cache/nginx/persiantoolbox -type f -delete 2>/dev/null || true
  fi
  pm2 stop "$NEW_PROCESS" >/dev/null 2>&1 || true
  if [[ -n "$CURRENT_COMMIT" ]]; then
    VERIFY_HEALTH="$CURRENT_VERIFY_HEALTH" VERIFY_CACHE_HEADERS="$CURRENT_VERIFY_CACHE_HEADERS" \
      bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" "$BASE_URL" "$CURRENT_COMMIT" || true
  fi
}

on_error() {
  local exit_code=$?
  local line_no="${BASH_LINENO[0]:-unknown}"
  rollback "command failed at line $line_no"
  exit "$exit_code"
}
trap on_error ERR INT TERM

SLOT_LINK="$BASE_DIR/slots/$NEW_SLOT"
mkdir -p "$BASE_DIR/slots"
TMP_SLOT_LINK="${SLOT_LINK}.tmp.$$"
ln -s "$RELEASE_DIR" "$TMP_SLOT_LINK"
mv -Tf "$TMP_SLOT_LINK" "$SLOT_LINK"

if pm2 describe "$NEW_PROCESS" >/dev/null 2>&1; then
  PORT="$NEW_PORT" HOSTNAME=127.0.0.1 PM2_PROCESS_NAME="$NEW_PROCESS" \
    PERSIANTOOLBOX_APP_DIR="$SLOT_LINK" \
    pm2 restart "$RELEASE_DIR/ecosystem.config.js" --only "$NEW_PROCESS" --update-env
else
  PORT="$NEW_PORT" HOSTNAME=127.0.0.1 PM2_PROCESS_NAME="$NEW_PROCESS" \
    PERSIANTOOLBOX_APP_DIR="$SLOT_LINK" \
    pm2 start "$RELEASE_DIR/ecosystem.config.js" --only "$NEW_PROCESS" --update-env
fi

CANDIDATE_HEALTHY=false
for attempt in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 --max-time 5 "http://127.0.0.1:$NEW_PORT/api/health" \
    | grep -q '"status":"ok"'; then
    CANDIDATE_HEALTHY=true
    break
  fi
  sleep 1
done

if [[ "$CANDIDATE_HEALTHY" != "true" ]]; then
  echo "[production-deploy] candidate did not become healthy" >&2
  exit 1
fi

bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" \
  "http://127.0.0.1:$NEW_PORT" "$SOURCE_GIT_SHA"

sudo mkdir -p "$STATIC_STORE"
sudo rsync -a "$RELEASE_DIR/.next/standalone/.next/static/" "$STATIC_STORE/"
sudo chmod -R a+rX "$STATIC_STORE"

while IFS=$'\t' read -r relative expected_size; do
  target="$STATIC_STORE/$relative"
  sudo test -f "$target" || {
    echo "[production-deploy] shared static asset missing: $relative" >&2
    exit 1
  }
  actual_size="$(sudo stat -c '%s' "$target")"
  [[ "$actual_size" == "$expected_size" ]] || {
    echo "[production-deploy] shared static asset size mismatch: $relative" >&2
    exit 1
  }
done < .next/static.manifest

NEW_UPSTREAM_TMP="$STATE_DIR/upstream-$RELEASE_ID.conf"
printf 'upstream persiantoolbox_backend { server 127.0.0.1:%s; }\n' "$NEW_PORT" > "$NEW_UPSTREAM_TMP"
sudo install -m 644 "$NEW_UPSTREAM_TMP" "$UPSTREAM_FILE"
if ! sudo nginx -t; then
  sudo install -m 644 "$UPSTREAM_BACKUP" "$UPSTREAM_FILE"
  sudo nginx -t
  rollback "nginx rejected candidate upstream"
  exit 1
fi
sudo systemctl reload nginx
SWITCHED=true
sudo find /var/cache/nginx/persiantoolbox -type f -delete 2>/dev/null || true

bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" "$BASE_URL" "$SOURCE_GIT_SHA"
sleep 5
bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" "$BASE_URL" "$SOURCE_GIT_SHA"

TMP_CURRENT_LINK="${CURRENT_LINK}.tmp.$$"
ln -s "$RELEASE_DIR" "$TMP_CURRENT_LINK"
mv -Tf "$TMP_CURRENT_LINK" "$CURRENT_LINK"

cat > "$STATE_FILE.tmp" <<STATE
RELEASE_SHA=$SOURCE_GIT_SHA
RELEASE_ID=$RELEASE_ID
ACTIVE_SLOT=$NEW_SLOT
ACTIVE_PORT=$NEW_PORT
ACTIVE_PROCESS=$NEW_PROCESS
RELEASE_DIR=$RELEASE_DIR
PREVIOUS_SLOT=$CURRENT_SLOT
PREVIOUS_PORT=$CURRENT_PORT
PREVIOUS_PROCESS=$CURRENT_PROCESS
PREVIOUS_RELEASE=$CURRENT_RELEASE
DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STATE
chmod 600 "$STATE_FILE.tmp"
mv -f "$STATE_FILE.tmp" "$STATE_FILE"
pm2 save >/dev/null 2>&1 || true

SWITCHED=false
trap - ERR INT TERM

# Keep both slots running. The previous slot remains the immediate rollback target.
mapfile -t releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@\t%p\n' | sort -rn | cut -f2-)
protected=("$RELEASE_DIR" "$CURRENT_RELEASE")
if (( ${#releases[@]} > KEEP_RELEASES )); then
  retained=0
  for release in "${releases[@]}"; do
    keep=false
    for item in "${protected[@]}"; do
      [[ -n "$item" && "$release" == "$item" ]] && keep=true
    done
    if [[ "$keep" == "true" || "$retained" -lt "$KEEP_RELEASES" ]]; then
      retained=$((retained + 1))
      continue
    fi
    rm -rf "$release"
  done
fi

echo "[production-deploy] success release=${SOURCE_GIT_SHA:0:12} slot=$NEW_SLOT port=$NEW_PORT rollback=$CURRENT_SLOT:$CURRENT_PORT"
