#!/usr/bin/env bash
set -Eeuo pipefail

BASE_DIR="/home/ubuntu/persiantoolbox-blue-green"
ENV_FILE=""
ENV_SOURCE=""
EXPECTED_CURRENT_SHA=""
UPSTREAM_FILE="/etc/nginx/conf.d/persiantoolbox-upstream.conf"
LEGACY_RELEASES_DIR="/home/ubuntu/persiantoolbox-releases"
STATIC_STORE="/home/ubuntu/persiantoolbox-shared-assets"
BLUE_PORT=3000
GREEN_PORT=3003

usage() {
  cat <<USAGE
Usage: $(basename "$0") [options]

Options:
  --base-dir <path>              Canonical blue-green deployment base
  --env-file <path>              Canonical production environment file
  --env-source <path>            Explicit existing environment source
  --expected-current-sha <sha>   Exact SHA for a legacy runtime lacking identity
  --upstream-file <path>         Nginx upstream include
  --legacy-releases-dir <path>   Existing immutable release directory
  --static-store <path>          Shared immutable static asset directory
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-dir) BASE_DIR="${2:-}"; shift 2 ;;
    --env-file) ENV_FILE="${2:-}"; shift 2 ;;
    --env-source) ENV_SOURCE="${2:-}"; shift 2 ;;
    --expected-current-sha) EXPECTED_CURRENT_SHA="${2:-}"; shift 2 ;;
    --upstream-file) UPSTREAM_FILE="${2:-}"; shift 2 ;;
    --legacy-releases-dir) LEGACY_RELEASES_DIR="${2:-}"; shift 2 ;;
    --static-store) STATIC_STORE="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[bootstrap] unknown argument: $1" >&2; usage; exit 64 ;;
  esac
done

[[ -n "$BASE_DIR" ]] || { echo "[bootstrap] base directory is required" >&2; exit 64; }
if [[ -z "$ENV_FILE" ]]; then
  ENV_FILE="$BASE_DIR/shared/env/production.env"
fi
if [[ -n "$EXPECTED_CURRENT_SHA" && ! "$EXPECTED_CURRENT_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "[bootstrap] expected current SHA must be an exact 40-character SHA" >&2
  exit 64
fi

for command in curl grep install node pm2 readlink sed sudo; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[bootstrap] required command missing: $command" >&2
    exit 1
  }
done

mkdir -p \
  "$BASE_DIR/current" \
  "$BASE_DIR/releases/production" \
  "$BASE_DIR/shared/deploy" \
  "$BASE_DIR/shared/env" \
  "$BASE_DIR/shared/logs" \
  "$BASE_DIR/slots" \
  "$BASE_DIR/tmp"
chmod 700 "$BASE_DIR/shared/env" "$BASE_DIR/shared/deploy"

read_configured_port() {
  local candidate
  for candidate in \
    "$UPSTREAM_FILE" \
    /etc/nginx/sites-enabled/projects \
    /etc/nginx/sites-available/projects; do
    if sudo test -f "$candidate"; then
      sudo grep -hoE '127\.0\.0\.1:(3000|3003)' "$candidate" 2>/dev/null \
        | head -1 \
        | cut -d: -f2 \
        && return 0
    fi
  done
  return 1
}

CURRENT_PORT="$(read_configured_port || true)"
if [[ "$CURRENT_PORT" != "$BLUE_PORT" && "$CURRENT_PORT" != "$GREEN_PORT" ]]; then
  CURRENT_PORT=""
  for candidate_port in "$BLUE_PORT" "$GREEN_PORT"; do
    if curl -fsS --connect-timeout 2 --max-time 5 \
      "http://127.0.0.1:$candidate_port/api/health" >/dev/null; then
      if [[ -n "$CURRENT_PORT" ]]; then
        echo "[bootstrap] both ports are reachable but nginx does not identify the active slot" >&2
        exit 1
      fi
      CURRENT_PORT="$candidate_port"
    fi
  done
fi
if [[ "$CURRENT_PORT" != "$BLUE_PORT" && "$CURRENT_PORT" != "$GREEN_PORT" ]]; then
  echo "[bootstrap] cannot identify the active production port" >&2
  exit 1
fi

if [[ "$CURRENT_PORT" == "$BLUE_PORT" ]]; then
  CURRENT_SLOT="blue"
else
  CURRENT_SLOT="green"
fi

PM2_SNAPSHOT="$(mktemp)"
trap 'rm -f "$PM2_SNAPSHOT"' EXIT
chmod 600 "$PM2_SNAPSHOT"
pm2 jlist > "$PM2_SNAPSHOT"
PROCESS_META="$(CURRENT_PORT="$CURRENT_PORT" CURRENT_SLOT="$CURRENT_SLOT" PM2_SNAPSHOT="$PM2_SNAPSHOT" node <<'NODE'
const fs = require('node:fs');

const port = process.env.CURRENT_PORT;
const slot = process.env.CURRENT_SLOT;
const entries = JSON.parse(fs.readFileSync(process.env.PM2_SNAPSHOT, 'utf8'));
const preferredNames = [`persiantoolbox-${slot}`, 'persiantoolbox'];
const candidates = entries
  .filter((entry) => entry?.pm2_env?.status === 'online')
  .filter((entry) => {
    const envPort = entry?.pm2_env?.env?.PORT ?? entry?.pm2_env?.PORT;
    return String(envPort ?? '') === String(port);
  })
  .sort((left, right) => {
    const leftRank = preferredNames.indexOf(left.name);
    const rightRank = preferredNames.indexOf(right.name);
    return (leftRank === -1 ? 99 : leftRank) - (rightRank === -1 ? 99 : rightRank);
  });

if (candidates.length === 0) {
  process.exit(2);
}
const selected = candidates[0];
const cwd = selected?.pm2_env?.pm_cwd;
if (typeof selected.name !== 'string' || typeof cwd !== 'string' || cwd.length === 0) {
  process.exit(3);
}
process.stdout.write(`${selected.name}\t${cwd}`);
NODE
)" || {
  echo "[bootstrap] no online PM2 process matches active port $CURRENT_PORT" >&2
  exit 1
}
IFS=$'\t' read -r CURRENT_PROCESS CURRENT_RELEASE <<< "$PROCESS_META"
CURRENT_RELEASE="$(readlink -f "$CURRENT_RELEASE")"

[[ -d "$CURRENT_RELEASE" ]] || {
  echo "[bootstrap] active release directory is missing: $CURRENT_RELEASE" >&2
  exit 1
}
[[ -f "$CURRENT_RELEASE/ecosystem.config.js" ]] || {
  echo "[bootstrap] active release is not restartable: $CURRENT_RELEASE" >&2
  exit 1
}
[[ -f "$CURRENT_RELEASE/.next/standalone/server.js" ]] || {
  echo "[bootstrap] active release does not contain a standalone server" >&2
  exit 1
}

if [[ ! -f "$ENV_FILE" ]]; then
  env_candidates=()
  [[ -n "$ENV_SOURCE" ]] && env_candidates+=("$ENV_SOURCE")
  env_candidates+=(
    "$CURRENT_RELEASE/.env"
    "/home/ubuntu/persiantoolbox/.env"
    "/home/ubuntu/persiantoolbox-current/.env"
  )
  selected_env=""
  for candidate in "${env_candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      selected_env="$candidate"
      break
    fi
  done
  [[ -n "$selected_env" ]] || {
    echo "[bootstrap] no production environment source was found" >&2
    exit 1
  }
  install -m 600 "$selected_env" "$ENV_FILE"
else
  chmod 600 "$ENV_FILE"
fi

CURRENT_COMMIT="$(curl -fsS --connect-timeout 3 --max-time 8 \
  "http://127.0.0.1:$CURRENT_PORT/api/version" \
  | sed -nE 's/.*"commit":"([0-9a-f]{40})".*/\1/p' \
  | head -1 || true)"

if [[ -n "$CURRENT_COMMIT" && -n "$EXPECTED_CURRENT_SHA" && "$CURRENT_COMMIT" != "$EXPECTED_CURRENT_SHA" ]]; then
  echo "[bootstrap] live commit does not match expected current SHA" >&2
  exit 1
fi

if [[ -z "$CURRENT_COMMIT" ]]; then
  [[ "$EXPECTED_CURRENT_SHA" =~ ^[0-9a-f]{40}$ ]] || {
    echo "[bootstrap] live runtime has no immutable identity; provide --expected-current-sha" >&2
    exit 1
  }

  existing_release_sha="$(sed -nE 's/^RELEASE_GIT_SHA=([0-9a-f]{40})$/\1/p' \
    "$CURRENT_RELEASE/.env.release" 2>/dev/null | tail -1 || true)"
  if [[ -n "$existing_release_sha" && "$existing_release_sha" != "$EXPECTED_CURRENT_SHA" ]]; then
    echo "[bootstrap] existing release metadata conflicts with expected current SHA" >&2
    exit 1
  fi

  printf '%s\n' "$EXPECTED_CURRENT_SHA" > "$CURRENT_RELEASE/.git-revision.tmp"
  chmod 600 "$CURRENT_RELEASE/.git-revision.tmp"
  mv -f "$CURRENT_RELEASE/.git-revision.tmp" "$CURRENT_RELEASE/.git-revision"

  cat > "$CURRENT_RELEASE/.env.release.tmp" <<ENVRELEASE
NEXT_PUBLIC_GIT_SHA=$EXPECTED_CURRENT_SHA
RELEASE_GIT_SHA=$EXPECTED_CURRENT_SHA
RELEASE_BUILT_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ENVRELEASE
  chmod 600 "$CURRENT_RELEASE/.env.release.tmp"
  mv -f "$CURRENT_RELEASE/.env.release.tmp" "$CURRENT_RELEASE/.env.release"

  PORT="$CURRENT_PORT" HOSTNAME=127.0.0.1 PM2_PROCESS_NAME="$CURRENT_PROCESS" \
    PERSIANTOOLBOX_APP_DIR="$CURRENT_RELEASE" \
    pm2 restart "$CURRENT_RELEASE/ecosystem.config.js" --only "$CURRENT_PROCESS" --update-env

  CURRENT_COMMIT=""
  for attempt in $(seq 1 60); do
    CURRENT_COMMIT="$(curl -fsS --connect-timeout 2 --max-time 5 \
      "http://127.0.0.1:$CURRENT_PORT/api/version" \
      | sed -nE 's/.*"commit":"([0-9a-f]{40})".*/\1/p' \
      | head -1 || true)"
    [[ "$CURRENT_COMMIT" == "$EXPECTED_CURRENT_SHA" ]] && break
    sleep 1
  done
  [[ "$CURRENT_COMMIT" == "$EXPECTED_CURRENT_SHA" ]] || {
    echo "[bootstrap] failed to backfill immutable identity into live runtime" >&2
    exit 1
  }
fi

CURRENT_LINK="$BASE_DIR/current/production"
SLOT_LINK="$BASE_DIR/slots/$CURRENT_SLOT"
for link in "$CURRENT_LINK" "$SLOT_LINK"; do
  tmp_link="${link}.tmp.$$"
  ln -s "$CURRENT_RELEASE" "$tmp_link"
  mv -Tf "$tmp_link" "$link"
done

BOOTSTRAP_STATE="$BASE_DIR/shared/deploy/bootstrap-current.env"
{
  printf 'CURRENT_PROCESS_OVERRIDE=%q\n' "$CURRENT_PROCESS"
  printf 'CURRENT_RELEASE_OVERRIDE=%q\n' "$CURRENT_RELEASE"
  printf 'CURRENT_PORT_OVERRIDE=%q\n' "$CURRENT_PORT"
  printf 'CURRENT_SLOT_OVERRIDE=%q\n' "$CURRENT_SLOT"
  printf 'CURRENT_COMMIT_OVERRIDE=%q\n' "$CURRENT_COMMIT"
  printf 'LEGACY_RELEASES_DIR=%q\n' "$LEGACY_RELEASES_DIR"
  printf 'STATIC_STORE=%q\n' "$STATIC_STORE"
  printf 'BOOTSTRAPPED_AT=%q\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$BOOTSTRAP_STATE.tmp"
chmod 600 "$BOOTSTRAP_STATE.tmp"
mv -f "$BOOTSTRAP_STATE.tmp" "$BOOTSTRAP_STATE"

pm2 save >/dev/null 2>&1 || true

printf 'BOOTSTRAP_STATUS=pass\n'
printf 'CANONICAL_BASE=%s\n' "$BASE_DIR"
printf 'ENV_FILE=%s\n' "$ENV_FILE"
printf 'ACTIVE_SLOT=%s\n' "$CURRENT_SLOT"
printf 'ACTIVE_PORT=%s\n' "$CURRENT_PORT"
printf 'ACTIVE_PROCESS=%s\n' "$CURRENT_PROCESS"
printf 'ACTIVE_RELEASE=%s\n' "$CURRENT_RELEASE"
printf 'ACTIVE_COMMIT=%s\n' "$CURRENT_COMMIT"
