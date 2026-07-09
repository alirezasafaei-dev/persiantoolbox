#!/bin/bash
# rollback-rehearsal.sh — Dry-run rehearsal for PersianToolbox rollback
#
# Checks PM2 status, verifies a rollback target exists, and reports what
# would happen during a real rollback — without performing any changes.
#
# Usage:
#   bash scripts/ops/rollback-rehearsal.sh              # dry-run (default)
#   bash scripts/ops/rollback-rehearsal.sh --live       # actual rollback (use with caution)
#
# Exit 0 = rehearsal passed, Exit 1 = issues found
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$PROJECT_DIR/.env" 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
REMOTE_USER="ubuntu"
SSH_KEY="/home/dev13/.ssh/id_ed25519"
SSH_PORT="${SSH_PORT:-22}"
SSH_OPTS=(-i "$SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30)
SSH=(ssh "${SSH_OPTS[@]}")

BLUE_PORT=3000
GREEN_PORT=3003
NGINX_UPSTREAM="/etc/nginx/conf.d/persiantoolbox-upstream.conf"
REMOTE_RELEASES="/home/ubuntu/persiantoolbox-releases"
REMOTE_CURRENT="/home/ubuntu/persiantoolbox-current"

DRY_RUN=1
if [[ "${1:-}" == "--live" ]]; then
  DRY_RUN=0
  echo "⚠️  LIVE MODE — will perform actual rollback!"
fi

FAILED=0
RESULTS=()

log() { echo "[$(date '+%H:%M:%S')] $1"; }
record() {
  local name="$1" status="$2" detail="$3"
  RESULTS+=("$status|$name|$detail")
  if [[ "$status" == "FAIL" ]]; then FAILED=1; fi
}

vps_cmd() {
  "${SSH[@]}" "$REMOTE_USER@$VPS" "$@" 2>/dev/null
}

# ── Step 1: SSH reachability ─────────────────────────────────────────────
log "Step 1: Checking SSH reachability to $VPS..."
if ! vps_cmd "echo ok" &>/dev/null; then
  record "ssh" "FAIL" "Cannot reach $VPS via SSH"
  log "❌ Cannot reach VPS — aborting"
  exit 1
fi
record "ssh" "OK" "SSH reachable to $VPS"

# ── Step 2: Check PM2 processes ──────────────────────────────────────────
log "Step 2: Checking PM2 processes on VPS..."

PM2_JSON=$(vps_cmd "pm2 jlist 2>/dev/null" || echo "[]")

parse_pm2() {
  local name="$1" field="$2"
  echo "$PM2_JSON" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  try{const a=JSON.parse(d);const x=a.find(i=>i.name==='$name');
  console.log(x?(x.$field||''):'');}catch{console.log('');}
})" 2>/dev/null
}

BLUE_PID=$(parse_pm2 "persiantoolbox-blue" "pid")
BLUE_CWD=$(parse_pm2 "persiantoolbox-blue" "pm2_env.pm_cwd")
BLUE_STATUS_VAL=$(parse_pm2 "persiantoolbox-blue" "pm2_env.status")

GREEN_PID=$(parse_pm2 "persiantoolbox-green" "pid")
GREEN_CWD=$(parse_pm2 "persiantoolbox-green" "pm2_env.pm_cwd")
GREEN_STATUS_VAL=$(parse_pm2 "persiantoolbox-green" "pm2_env.status")

LEGACY_PID=$(parse_pm2 "persiantoolbox" "pid")

if [[ -z "$BLUE_PID" ]] && [[ -z "$GREEN_PID" ]] && [[ -z "$LEGACY_PID" ]]; then
  record "pm2-processes" "FAIL" "No PersianToolbox PM2 processes found"
  log "❌ No PersianToolbox process running in PM2"
else
  if [[ -n "$BLUE_PID" ]]; then log "  Blue:  running (pid=$BLUE_PID, status=$BLUE_STATUS_VAL, cwd=$BLUE_CWD)"; fi
  if [[ -n "$GREEN_PID" ]]; then log "  Green: running (pid=$GREEN_PID, status=$GREEN_STATUS_VAL, cwd=$GREEN_CWD)"; fi
  if [[ -n "$LEGACY_PID" ]]; then log "  Legacy (persiantoolbox): running (pid=$LEGACY_PID)"; fi
  record "pm2-processes" "OK" "Found running processes"
fi

# ── Step 3: Detect active slot ───────────────────────────────────────────
log "Step 3: Detecting active slot..."

ACTIVE_PORT=$(vps_cmd "node -e \"
const fs = require('fs');
let p = '3000';
try {
  if (fs.existsSync('/etc/nginx/conf.d/persiantoolbox-upstream.conf')) {
    const u = fs.readFileSync('/etc/nginx/conf.d/persiantoolbox-upstream.conf','utf8');
    const m = u.match(/127\\.0\\.0\\.1:(\\d+)/);
    if (m) p = m[1];
  }
} catch {}
process.stdout.write(p);
\"" || echo "3000")

if [[ "$ACTIVE_PORT" == "3003" ]]; then
  ACTIVE_SLOT="green"; ROLLBACK_SLOT="blue"; ROLLBACK_PORT=$BLUE_PORT
else
  ACTIVE_SLOT="blue"; ROLLBACK_SLOT="green"; ROLLBACK_PORT=$GREEN_PORT
fi

log "  Active:  slot=$ACTIVE_SLOT port=$ACTIVE_PORT"
log "  Rollback target: slot=$ROLLBACK_SLOT port=$ROLLBACK_PORT"
record "active-slot" "OK" "Active=$ACTIVE_SLOT:$ACTIVE_PORT, Rollback=$ROLLBACK_SLOT:$ROLLBACK_PORT"

# ── Step 4: Check rollback target exists ─────────────────────────────────
log "Step 4: Verifying rollback target exists..."

ROLLBACK_EXISTS=$(vps_cmd "pm2 describe persiantoolbox-$ROLLBACK_SLOT >/dev/null 2>&1 && echo YES || echo NO")

if [[ "$ROLLBACK_EXISTS" == "YES" ]]; then
  BUILD_CHECK=$(vps_cmd "test -f $ROLLBACK_CWD/.next/standalone/server.js && echo OK || echo MISSING" || echo "UNKNOWN")
  # Get cwd from pm2 describe
  ROLLBACK_CWD=$(vps_cmd "pm2 describe persiantoolbox-$ROLLBACK_SLOT 2>/dev/null | grep 'cwd path' | head -1 | awk '{print \$NF}'" || echo "")

  if [[ -n "$ROLLBACK_CWD" ]]; then
    BUILD_CHECK=$(vps_cmd "test -f $ROLLBACK_CWD/.next/standalone/server.js && echo OK || echo MISSING" || echo "UNKNOWN")
    if [[ "$BUILD_CHECK" == "OK" ]]; then
      record "rollback-target" "OK" "persiantoolbox-$ROLLBACK_SLOT at $ROLLBACK_CWD (build verified)"
      log "  Process: persiantoolbox-$ROLLBACK_SLOT"
      log "  Directory: $ROLLBACK_CWD"
      log "  Build: .next/standalone/server.js exists ✓"
    else
      record "rollback-target" "FAIL" "Build missing at $ROLLBACK_CWD"
      log "  ❌ Build artifact .next/standalone/server.js missing"
    fi
  else
    record "rollback-target" "WARN" "Could not determine cwd for persiantoolbox-$ROLLBACK_SLOT"
    log "  ⚠️  Could not determine process directory"
  fi
else
  record "rollback-target" "FAIL" "No PM2 process for persiantoolbox-$ROLLBACK_SLOT"
  log "  ❌ No PM2 process 'persiantoolbox-$ROLLBACK_SLOT' found"
fi

# ── Step 5: Check rollback port health ───────────────────────────────────
log "Step 5: Checking rollback port $ROLLBACK_PORT health..."

ROLLBACK_HEALTH=$(vps_cmd "curl -s --connect-timeout 3 --max-time 5 http://127.0.0.1:$ROLLBACK_PORT/api/health 2>/dev/null" || echo "unreachable")

if echo "$ROLLBACK_HEALTH" | grep -q '"status":"ok"'; then
  ROLLBACK_COMMIT=$(echo "$ROLLBACK_HEALTH" | grep -o '"commit":"[^"]*"' | head -1 || echo "unknown")
  record "rollback-health" "OK" "Port $ROLLBACK_PORT healthy ($ROLLBACK_COMMIT)"
  log "  Health: OK $ROLLBACK_COMMIT"
elif [[ "$ROLLBACK_HEALTH" == "unreachable" ]] || [[ -z "$ROLLBACK_HEALTH" ]]; then
  record "rollback-health" "WARN" "Port $ROLLBACK_PORT not responding"
  log "  ⚠️  Port $ROLLBACK_PORT not responding (process may need restart)"
else
  record "rollback-health" "WARN" "Port $ROLLBACK_PORT returned unexpected response"
  log "  ⚠️  Unexpected response from port $ROLLBACK_PORT"
fi

# ── Step 6: List available releases ──────────────────────────────────────
log "Step 6: Listing available releases on VPS..."

RELEASE_LIST=$(vps_cmd "ls -1dt $REMOTE_RELEASES/*/ 2>/dev/null | head -10" || echo "")

if [[ -z "$RELEASE_LIST" ]]; then
  record "releases" "WARN" "No release directories found"
  log "  ⚠️  No release directories in $REMOTE_RELEASES"
else
  RELEASE_COUNT=$(echo "$RELEASE_LIST" | wc -l)
  record "releases" "OK" "$RELEASE_COUNT release(s) available"
  log "  Available releases (newest first):"
  while IFS= read -r dir; do
    if [[ -z "$dir" ]]; then continue; fi
    RELEASE_ID=$(basename "$dir")
    HAS_BUILD=$(vps_cmd "test -f $dir/.next/standalone/server.js && echo yes || echo no")
    IS_CURRENT=""
    CURRENT_TARGET=$(vps_cmd "readlink -f $REMOTE_CURRENT 2>/dev/null" || echo "")
    if [[ "$CURRENT_TARGET" == "$dir" ]]; then IS_CURRENT=" (CURRENT)"; fi
    log "    $RELEASE_ID (build: $HAS_BUILD)$IS_CURRENT"
  done <<< "$RELEASE_LIST"
fi

# ── Step 7: Simulate or perform rollback ─────────────────────────────────
if [[ "$DRY_RUN" -eq 1 ]]; then
  log ""
  log "Step 7: DRY RUN — Rollback simulation"
  log "  Would perform these steps:"
  log "    1. Switch nginx upstream: port $ACTIVE_PORT → port $ROLLBACK_PORT"
  log "    2. Reload nginx: sudo nginx -t && sudo systemctl reload nginx"
  log "    3. Purge nginx cache"
  log "    4. Verify health on https://persiantoolbox.ir/api/health"
  log "    5. If health OK → delete active process (persiantoolbox-$ACTIVE_SLOT)"
  log "    6. Update symlinks to point to rollback release"
  log "    7. pm2 save"
  log ""
  log "  Nginx upstream change (dry-run):"
  log "    echo 'upstream persiantoolbox_backend { server 127.0.0.1:$ROLLBACK_PORT; }' | sudo tee $NGINX_UPSTREAM"
  log ""
  record "dry-run" "OK" "Simulation completed — no changes made"
else
  log "Step 7: Performing LIVE rollback..."

  vps_cmd "echo 'upstream persiantoolbox_backend { server 127.0.0.1:$ROLLBACK_PORT; }' | sudo tee $NGINX_UPSTREAM > /dev/null && sudo nginx -t && sudo systemctl reload nginx" || {
    record "nginx-switch" "FAIL" "Failed to switch nginx upstream"
    log "❌ Nginx switch failed"
    exit 1
  }

  vps_cmd "sudo find /var/cache/nginx/persiantoolbox/ -type f -delete 2>/dev/null || true"

  sleep 2
  HEALTH=$(curl -s --connect-timeout 10 --max-time 20 "https://persiantoolbox.ir/api/health" 2>/dev/null || echo "unreachable")
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    record "live-rollback" "OK" "Rollback successful — site healthy"
    log "✅ Rollback complete — site healthy"
    vps_cmd "pm2 delete persiantoolbox-$ACTIVE_SLOT 2>/dev/null || true"
    vps_cmd "pm2 save >/dev/null 2>&1 || true"
  else
    record "live-rollback" "FAIL" "Site unhealthy after rollback"
    log "❌ Site unhealthy after rollback!"
    vps_cmd "echo 'upstream persiantoolbox_backend { server 127.0.0.1:$ACTIVE_PORT; }' | sudo tee $NGINX_UPSTREAM > /dev/null && sudo nginx -t && sudo systemctl reload nginx" 2>/dev/null || true
    exit 1
  fi
fi

# ── Report ───────────────────────────────────────────────────────────────
log ""
log "════════════════════════════════════════════════════════════"
log "  ROLLBACK REHEARSAL REPORT — $(date '+%Y-%m-%d %H:%M:%S')"
log "════════════════════════════════════════════════════════════"

TOTAL=0; PASSED=0; FAILED_COUNT=0; WARN_COUNT=0
for entry in "${RESULTS[@]}"; do
  IFS='|' read -r status name detail <<< "$entry"
  TOTAL=$((TOTAL + 1))
  case "$status" in
    OK)   PASSED=$((PASSED + 1)); log "  ✓ $name: $detail" ;;
    FAIL) FAILED_COUNT=$((FAILED_COUNT + 1)); log "  ✗ $name: $detail" ;;
    WARN) WARN_COUNT=$((WARN_COUNT + 1)); log "  ⚠ $name: $detail" ;;
  esac
done

log ""
log "  Total: $TOTAL | Passed: $PASSED | Failed: $FAILED_COUNT | Warnings: $WARN_COUNT"
log "  Mode: $([ "$DRY_RUN" -eq 1 ] && echo "DRY-RUN" || echo "LIVE")"
log "════════════════════════════════════════════════════════════"

if [[ "$FAILED" -eq 0 ]]; then
  log ""
  log "REHEARSAL PASSED — Rollback is feasible."
  exit 0
else
  log ""
  log "REHEARSAL FAILED — Fix issues before attempting rollback."
  exit 1
fi
