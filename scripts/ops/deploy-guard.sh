#!/bin/bash
# deploy-guard.sh — Pre-deploy health check + deploy serialization lock
#
# Usage:
#   bash scripts/ops/deploy-guard.sh --check        # verify all sites are healthy
#   bash scripts/ops/deploy-guard.sh --lock          # acquire deploy lock
#   bash scripts/ops/deploy-guard.sh --unlock        # release deploy lock
#   bash scripts/ops/deploy-guard.sh --guard         # check + lock (for deploy scripts)
#
# This script:
#   - Checks ALL sites on the server before any deploy
#   - Prevents concurrent deploys with a lock file
#   - Reports which site would be affected before you proceed
#   - Has zero side-effects on running processes

set -Eeuo pipefail

SITES_FILE="${DEPLOY_GUARD_SITES:-/etc/deploy-guard/sites.txt}"
LOCK_FILE="${DEPLOY_GUARD_LOCK:-/tmp/deploy-guard.lock}"
LOCK_TTL_SEC="${DEPLOY_GUARD_TTL:-900}"
HEALTH_TIMEOUT="${DEPLOY_GUARD_TIMEOUT:-15}"
LOG_FILE="${DEPLOY_GUARD_LOG:-/var/log/deploy-guard.log}"

log() { echo "[deploy-guard] $(date -u +%FT%TZ) $*"; }

health_check() {
  local url="$1"
  local code
  code=$(curl -sS --max-time "$HEALTH_TIMEOUT" --connect-timeout 5 \
    --output /dev/null --write-out "%{http_code}" "$url" 2>/dev/null || echo "FAIL")
  echo "$code"
}

check_all_sites() {
  if [ ! -f "$SITES_FILE" ]; then
    log "WARN: $SITES_FILE not found — skipping per-site health checks"
    return 0
  fi

  local failed=0
  while IFS='|' read -r name url expected; do
    [ -z "$name" ] && continue
    [ "${name:0:1}" = "#" ] && continue

    code=$(health_check "$url")
    if [ "$code" = "$expected" ]; then
      log "OK    $name → $code (expected $expected)"
    else
      log "FAIL  $name → $code (expected $expected)"
      failed=$((failed + 1))
    fi
  done < "$SITES_FILE"

  return "$failed"
}

acquire_lock() {
  local lock_cmd="$*"
  (
    set -C
    if 2>/dev/null > "$LOCK_FILE"; then
      echo "$$ $(date +%s) $lock_cmd" > "$LOCK_FILE"
      log "LOCK acquired by PID $$"
      exit 0
    fi
    exit 1
  ) && return 0

  local lock_content=""
  lock_content=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  local pid=""
  local ts=""
  local cmd=""
  if [ -n "$lock_content" ]; then
    pid=$(echo "$lock_content" | cut -d' ' -f1)
    ts=$(echo "$lock_content" | cut -d' ' -f2)
    cmd=$(echo "$lock_content" | cut -d' ' -f3-)
  fi

  if [ -n "$ts" ]; then
    local now
    now=$(date +%s)
    if [ $((now - ts)) -gt "$LOCK_TTL_SEC" ]; then
      log "LOCK stale (PID $pid, age $((now - ts))s) — removing"
      rm -f "$LOCK_FILE"
      (
        set -C
        if 2>/dev/null > "$LOCK_FILE"; then
          echo "$$ $(date +%s) $lock_cmd" > "$LOCK_FILE"
          log "LOCK acquired by PID $$ (after stale cleanup)"
          exit 0
        fi
        exit 1
      ) && return 0
    fi
  fi

  log "LOCK held by PID $pid ($cmd)"
  return 1
}

release_lock() {
  local my_pid=$$
  local lock_content=""
  lock_content=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  local lock_pid=""
  if [ -n "$lock_content" ]; then
    lock_pid=$(echo "$lock_content" | cut -d' ' -f1)
  fi
  if [ -z "$lock_content" ] || [ -z "$lock_pid" ] || [ "$lock_pid" = "$my_pid" ]; then
    rm -f "$LOCK_FILE" 2>/dev/null || true
    log "LOCK released by PID $my_pid"
    return 0
  fi
  log "LOCK not owned by PID $my_pid (owner: $lock_pid) — cannot release"
  return 1
}

case "${1:---help}" in
  --check)
    check_all_sites
    exit $?
    ;;
  --lock)
    acquire_lock "${2:-$(basename "$0")}"
    exit $?
    ;;
  --unlock)
    release_lock
    exit $?
    ;;
  --guard)
    check_all_sites
    guard_exit=$?
    acquire_lock "${2:-$(basename "$0")}" || {
      log "GUARD BLOCKED: deploy lock held by another process"
      exit 1
    }
    if [ "$guard_exit" -gt 0 ]; then
      log "WARN: $guard_exit site(s) unhealthy — lock acquired but deploy at your own risk"
    fi
    exit 0
    ;;
  --install)
    mkdir -p "$(dirname "$SITES_FILE")" 2>/dev/null || true
    if [ ! -f "$SITES_FILE" ]; then
      cat > "$SITES_FILE" << 'EOF'
# Deploy guard — site health check targets
# Format: name|url|expected_http_code
# Lines starting with # are ignored
persiantoolbox|https://persiantoolbox.ir/api/health|200
auditsystems|https://auditsystems.ir/api/health|200
devatlas|https://devatlas.ir/api/health|200
my-portfolio|https://alirezasafaeisystems.ir/api/health|200
EOF
      log "Created $SITES_FILE with default targets"
    else
      log "SKIP: $SITES_FILE already exists"
    fi
    if [ ! -f /etc/logrotate.d/deploy-guard ]; then
      cat > /tmp/deploy-guard-logrotate << 'EOF'
/var/log/deploy-guard.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
}
EOF
      sudo mv /tmp/deploy-guard-logrotate /etc/logrotate.d/deploy-guard 2>/dev/null || true
      log "Created logrotate config"
    fi
    log "Install complete. Edit $SITES_FILE to add/remove sites."
    ;;
  --help|*)
    echo "Usage: bash scripts/ops/deploy-guard.sh <command>"
    echo ""
    echo "Commands:"
    echo "  --check           Check all sites are healthy"
    echo "  --lock [name]     Acquire deploy lock (block concurrent deploys)"
    echo "  --unlock          Release deploy lock"
    echo "  --guard [name]    Check + lock (use in deploy scripts)"
    echo "  --install         Create default config and logrotate"
    echo ""
    echo "Env vars:"
    echo "  DEPLOY_GUARD_SITES     Path to sites list (default: /etc/deploy-guard/sites.txt)"
    echo "  DEPLOY_GUARD_LOCK      Path to lock file (default: /tmp/deploy-guard.lock)"
    echo "  DEPLOY_GUARD_TTL       Lock TTL seconds (default: 900)"
    echo "  DEPLOY_GUARD_TIMEOUT   Health check timeout (default: 15)"
    echo "  DEPLOY_GUARD_LOG       Log file path (default: /var/log/deploy-guard.log)"
    exit 0
    ;;
esac
