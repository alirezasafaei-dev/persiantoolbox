#!/usr/bin/env bash
set -Eeuo pipefail

EXPECTED_SHA="${1:-}"
BASE_URL="${2:-https://persiantoolbox.ir}"
BASE_DIR="${3:-/var/www/persian-tools}"
STATE_FILE="$BASE_DIR/shared/deploy/production-current.env"
STATIC_STORE="${STATIC_STORE:-/home/ubuntu/persiantoolbox-shared-assets}"

if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "[safety-audit] expected exact 40-character release SHA" >&2
  exit 64
fi
for command in pm2 curl find sort comm; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[safety-audit] missing command: $command" >&2
    exit 1
  }
done
[[ -f "$STATE_FILE" ]] || {
  echo "[safety-audit] state file missing: $STATE_FILE" >&2
  exit 1
}

# shellcheck disable=SC1090
source "$STATE_FILE"
for key in RELEASE_SHA ACTIVE_PORT ACTIVE_PROCESS RELEASE_DIR PREVIOUS_PORT PREVIOUS_PROCESS PREVIOUS_RELEASE; do
  [[ -n "${!key:-}" ]] || {
    echo "[safety-audit] state field missing: $key" >&2
    exit 1
  }
done

[[ "$RELEASE_SHA" == "$EXPECTED_SHA" ]] || {
  echo "[safety-audit] state SHA mismatch: expected=$EXPECTED_SHA actual=$RELEASE_SHA" >&2
  exit 1
}
[[ "$ACTIVE_PORT" =~ ^(3000|3003)$ && "$PREVIOUS_PORT" =~ ^(3000|3003)$ ]] || {
  echo "[safety-audit] invalid blue-green ports" >&2
  exit 1
}
[[ "$ACTIVE_PORT" != "$PREVIOUS_PORT" ]] || {
  echo "[safety-audit] active and previous ports must differ" >&2
  exit 1
}

assert_online() {
  local process_name="$1"
  local pid
  pid="$(pm2 pid "$process_name" | head -1 | tr -d '[:space:]')"
  [[ "$pid" =~ ^[1-9][0-9]*$ ]] || {
    echo "[safety-audit] PM2 process is not online: $process_name" >&2
    return 1
  }
}
assert_online "$ACTIVE_PROCESS"
assert_online "$PREVIOUS_PROCESS"

VERIFY_SCRIPT="$RELEASE_DIR/scripts/deploy/verify-release-assets.sh"
[[ -f "$VERIFY_SCRIPT" ]] || {
  echo "[safety-audit] verifier missing from active release" >&2
  exit 1
}
chmod +x "$VERIFY_SCRIPT"

VERIFY_CACHE_HEADERS=false bash "$VERIFY_SCRIPT" \
  "http://127.0.0.1:$ACTIVE_PORT" "$EXPECTED_SHA"
bash "$VERIFY_SCRIPT" "${BASE_URL%/}" "$EXPECTED_SHA"

PREVIOUS_COMMIT="$(curl -fsS --connect-timeout 3 --max-time 8 \
  "http://127.0.0.1:$PREVIOUS_PORT/api/version" \
  | sed -nE 's/.*"commit":"([^"]+)".*/\1/p' | head -1)"
[[ -n "$PREVIOUS_COMMIT" ]] || {
  echo "[safety-audit] previous runtime commit is missing" >&2
  exit 1
}
VERIFY_HEALTH=false VERIFY_CACHE_HEADERS=false bash "$VERIFY_SCRIPT" \
  "http://127.0.0.1:$PREVIOUS_PORT" "$PREVIOUS_COMMIT"

[[ -d "$STATIC_STORE" ]] || {
  echo "[safety-audit] shared static store missing: $STATIC_STORE" >&2
  exit 1
}

assert_manifest_in_store() {
  local release="$1"
  local manifest="$release/.next/static.manifest"
  [[ -f "$manifest" ]] || {
    echo "[safety-audit] static manifest missing: $manifest" >&2
    return 1
  }
  while IFS=$'\t' read -r relative expected_size; do
    [[ -n "$relative" ]] || continue
    local target="$STATIC_STORE/$relative"
    [[ -f "$target" ]] || {
      echo "[safety-audit] retained asset missing: $relative" >&2
      return 1
    }
    [[ "$(stat -c '%s' "$target")" == "$expected_size" ]] || {
      echo "[safety-audit] retained asset size mismatch: $relative" >&2
      return 1
    }
  done < "$manifest"
}
assert_manifest_in_store "$RELEASE_DIR"
assert_manifest_in_store "$PREVIOUS_RELEASE"

SW_HEADERS="$(curl -fsSI --connect-timeout 5 --max-time 15 "${BASE_URL%/}/sw.js")"
SW_CACHE="$(printf '%s' "$SW_HEADERS" | grep -i '^cache-control:' | tail -1 | tr -d '\r' || true)"
if [[ "$SW_CACHE" == *'immutable'* || "$SW_CACHE" == *'max-age=31536000'* ]]; then
  echo "[safety-audit] service worker is cached too aggressively: $SW_CACHE" >&2
  exit 1
fi

printf 'PRODUCTION_SAFETY_AUDIT=pass\nRELEASE_SHA=%s\nACTIVE=%s:%s\nPREVIOUS=%s:%s\n' \
  "$EXPECTED_SHA" "$ACTIVE_PROCESS" "$ACTIVE_PORT" "$PREVIOUS_PROCESS" "$PREVIOUS_PORT"
