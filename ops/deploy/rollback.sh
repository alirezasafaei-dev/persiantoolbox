#!/usr/bin/env bash
set -Eeuo pipefail

ENVIRONMENT=""
BASE_DIR="/var/www/persian-tools"
TARGET_RELEASE=""
APP_SLUG="persian-tools"
BASE_URL="https://persiantoolbox.ir"
UPSTREAM_FILE="/etc/nginx/conf.d/persiantoolbox-upstream.conf"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --env <staging|production> [options]

Options:
  --app-slug <name>
  --base-dir <path>
  --target-release <id>    Staging only; production uses recorded previous slot
  --base-url <url>
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENVIRONMENT="${2:-}"; shift 2 ;;
    --base-dir) BASE_DIR="${2:-}"; shift 2 ;;
    --app-slug) APP_SLUG="${2:-}"; shift 2 ;;
    --target-release) TARGET_RELEASE="${2:-}"; shift 2 ;;
    --base-url) BASE_URL="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[rollback] unknown argument: $1" >&2; usage; exit 64 ;;
  esac
done

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  usage
  exit 64
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  [[ -z "$TARGET_RELEASE" ]] || {
    echo "[rollback] production rollback only supports the recorded previous slot" >&2
    exit 64
  }

  STATE_FILE="$BASE_DIR/shared/deploy/production-current.env"
  [[ -f "$STATE_FILE" ]] || {
    echo "[rollback] production state file missing: $STATE_FILE" >&2
    exit 1
  }

  # shellcheck disable=SC1090
  source "$STATE_FILE"
  for value in PREVIOUS_PORT PREVIOUS_SLOT PREVIOUS_PROCESS PREVIOUS_RELEASE ACTIVE_PORT ACTIVE_SLOT ACTIVE_PROCESS RELEASE_DIR; do
    [[ -n "${!value:-}" ]] || {
      echo "[rollback] state field missing: $value" >&2
      exit 1
    }
  done
  [[ "$PREVIOUS_PORT" == "3000" || "$PREVIOUS_PORT" == "3003" ]] || {
    echo "[rollback] invalid previous port: $PREVIOUS_PORT" >&2
    exit 1
  }

  VERIFY_SCRIPT="$RELEASE_DIR/scripts/deploy/verify-release-assets.sh"
  [[ -x "$VERIFY_SCRIPT" ]] || chmod +x "$VERIFY_SCRIPT"
  PREVIOUS_COMMIT="$(curl -fsS --connect-timeout 3 --max-time 8 "http://127.0.0.1:$PREVIOUS_PORT/api/version" \
    | sed -nE 's/.*"commit":"([^"]+)".*/\1/p' | head -1 || true)"
  [[ -n "$PREVIOUS_COMMIT" ]] || {
    echo "[rollback] previous slot is not healthy enough to identify its commit" >&2
    exit 1
  }

  bash "$VERIFY_SCRIPT" "http://127.0.0.1:$PREVIOUS_PORT" "$PREVIOUS_COMMIT"

  BACKUP="$BASE_DIR/shared/deploy/upstream-before-rollback-$(date -u +%Y%m%dT%H%M%SZ).conf"
  sudo cat "$UPSTREAM_FILE" > "$BACKUP"
  chmod 600 "$BACKUP"
  printf 'upstream persiantoolbox_backend { server 127.0.0.1:%s; }\n' "$PREVIOUS_PORT" \
    | sudo tee "$UPSTREAM_FILE" >/dev/null

  if ! sudo nginx -t; then
    sudo install -m 644 "$BACKUP" "$UPSTREAM_FILE"
    sudo nginx -t
    echo "[rollback] nginx rejected rollback upstream; original restored" >&2
    exit 1
  fi
  sudo systemctl reload nginx
  sudo find /var/cache/nginx/persiantoolbox -type f -delete 2>/dev/null || true

  if ! bash "$VERIFY_SCRIPT" "${BASE_URL%/}" "$PREVIOUS_COMMIT"; then
    sudo install -m 644 "$BACKUP" "$UPSTREAM_FILE"
    sudo nginx -t
    sudo systemctl reload nginx
    echo "[rollback] public rollback verification failed; prior upstream restored" >&2
    exit 1
  fi

  if [[ -d "$PREVIOUS_RELEASE" ]]; then
    TMP_LINK="$BASE_DIR/current/production.tmp.$$"
    ln -s "$PREVIOUS_RELEASE" "$TMP_LINK"
    mv -Tf "$TMP_LINK" "$BASE_DIR/current/production"
  fi

  cat > "$STATE_FILE.tmp" <<STATE
RELEASE_SHA=$PREVIOUS_COMMIT
RELEASE_ID=$(basename "$PREVIOUS_RELEASE")
ACTIVE_SLOT=$PREVIOUS_SLOT
ACTIVE_PORT=$PREVIOUS_PORT
ACTIVE_PROCESS=$PREVIOUS_PROCESS
RELEASE_DIR=$PREVIOUS_RELEASE
PREVIOUS_SLOT=$ACTIVE_SLOT
PREVIOUS_PORT=$ACTIVE_PORT
PREVIOUS_PROCESS=$ACTIVE_PROCESS
PREVIOUS_RELEASE=$RELEASE_DIR
DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ROLLBACK=true
STATE
  chmod 600 "$STATE_FILE.tmp"
  mv -f "$STATE_FILE.tmp" "$STATE_FILE"
  pm2 save >/dev/null 2>&1 || true
  echo "[rollback] production restored to $PREVIOUS_SLOT:$PREVIOUS_PORT commit=${PREVIOUS_COMMIT:0:12}"
  exit 0
fi

RELEASES_DIR="$BASE_DIR/releases/staging"
CURRENT_LINK="$BASE_DIR/current/staging"
APP_NAME="$APP_SLUG-staging"
PORT=3001

[[ -d "$RELEASES_DIR" ]] || {
  echo "[rollback] staging releases directory missing" >&2
  exit 1
}

if [[ -z "$TARGET_RELEASE" ]]; then
  current_target="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
  mapfile -t releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@\t%p\n' | sort -rn | cut -f2-)
  for candidate in "${releases[@]}"; do
    [[ "$candidate" == "$current_target" ]] && continue
    if [[ -f "$candidate/ecosystem.staging.cjs" ]]; then
      TARGET_RELEASE="$(basename "$candidate")"
      break
    fi
  done
fi

TARGET_DIR="$RELEASES_DIR/$TARGET_RELEASE"
[[ -f "$TARGET_DIR/ecosystem.staging.cjs" ]] || {
  echo "[rollback] valid staging target not found: $TARGET_DIR" >&2
  exit 1
}

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$TARGET_DIR/ecosystem.staging.cjs" --only "$APP_NAME" --update-env
else
  pm2 start "$TARGET_DIR/ecosystem.staging.cjs" --only "$APP_NAME" --update-env
fi

for attempt in $(seq 1 30); do
  if curl -fsS --connect-timeout 2 --max-time 5 "http://127.0.0.1:$PORT/api/health" \
    | grep -q '"status":"ok"'; then
    break
  fi
  [[ "$attempt" -lt 30 ]] || {
    echo "[rollback] staging target failed health checks" >&2
    exit 1
  }
  sleep 1
done

TMP_LINK="${CURRENT_LINK}.tmp.$$"
ln -s "$TARGET_DIR" "$TMP_LINK"
mv -Tf "$TMP_LINK" "$CURRENT_LINK"
pm2 save >/dev/null 2>&1 || true
echo "[rollback] staging restored to $TARGET_RELEASE"
