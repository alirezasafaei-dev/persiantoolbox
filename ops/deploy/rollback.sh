#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=""
BASE_DIR="/var/www/persian-tools"
TARGET_RELEASE=""
APP_SLUG="persian-tools"

usage() {
  cat <<USAGE
Usage: $(basename "$0") --env <staging|production> [options]

Required:
  --env <name>             Target environment

Optional:
  --app-slug <name>        Logical app slug (default: persian-tools)
  --base-dir <path>        Base directory on server (default: /var/www/persian-tools)
  --target-release <id>    Explicit release directory name
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
    --target-release)
      TARGET_RELEASE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[rollback] unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$ENVIRONMENT" ]]; then
  usage
  exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "[rollback] unsupported environment: $ENVIRONMENT" >&2
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[rollback] pm2 is required but not installed" >&2
  exit 1
fi

RELEASES_DIR="$BASE_DIR/releases/$ENVIRONMENT"
CURRENT_LINK="$BASE_DIR/current/$ENVIRONMENT"
APP_NAME="$APP_SLUG-$ENVIRONMENT"
PORT="3001"

if [[ "$ENVIRONMENT" == "production" ]]; then
  PORT="3000"
fi

if [[ ! -d "$RELEASES_DIR" ]]; then
  echo "[rollback] releases directory not found: $RELEASES_DIR" >&2
  exit 1
fi

if [[ -z "$TARGET_RELEASE" ]]; then
  current_target=""
  if [[ -L "$CURRENT_LINK" ]]; then
    current_target="$(readlink -f "$CURRENT_LINK")"
  fi

  mapfile -t releases < <(ls -1dt "$RELEASES_DIR"/* 2>/dev/null || true)
  if (( ${#releases[@]} < 2 )); then
    echo "[rollback] at least two releases are required for automatic rollback" >&2
    exit 1
  fi

  for candidate in "${releases[@]}"; do
    if [[ "$candidate" == "$current_target" ]]; then
      continue
    fi

    if [[ -f "$candidate/ecosystem.config.cjs" ]]; then
      TARGET_RELEASE="$(basename "$candidate")"
      break
    fi

    echo "[rollback] skipping candidate without ecosystem file: $candidate/ecosystem.config.cjs" >&2
  done
fi

if [[ -z "$TARGET_RELEASE" ]]; then
  echo "[rollback] could not determine a valid target release with ecosystem config" >&2
  exit 1
fi

TARGET_DIR="$RELEASES_DIR/$TARGET_RELEASE"
if [[ ! -d "$TARGET_DIR" ]]; then
  echo "[rollback] target release not found: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -f "$TARGET_DIR/ecosystem.config.cjs" ]]; then
  echo "[rollback] ecosystem file missing in explicit target: $TARGET_DIR/ecosystem.config.cjs" >&2
  exit 1
fi

ln -sfn "$TARGET_DIR" "$CURRENT_LINK"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 delete "$APP_NAME"
fi
pm2 start "$TARGET_DIR/ecosystem.config.cjs" --only "$APP_NAME" --update-env
pm2 save >/dev/null 2>&1 || true

for attempt in {1..20}; do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    echo "[rollback] health check passed for $ENVIRONMENT on port $PORT"
    break
  fi

  if [[ "$attempt" -eq 20 ]]; then
    echo "[rollback] health check failed after 20 attempts" >&2
    exit 1
  fi

  sleep 2
done

echo "[rollback] switched $ENVIRONMENT to release $TARGET_RELEASE ($APP_NAME)"
