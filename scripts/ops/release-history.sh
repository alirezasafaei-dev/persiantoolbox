#!/bin/bash
# release-history.sh — List all PM2 processes and their status
#
# Shows PersianToolbox processes, release directories, and deployment history.
#
# Usage: bash scripts/ops/release-history.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$PROJECT_DIR/.env" 2>/dev/null || true

VPS="${IP:-193.93.169.32}"
REMOTE_USER="ubuntu"
SSH_KEY="/home/dev13/.ssh/id_ed25519"
SSH_PORT="${SSH_PORT:-22}"
SSH_OPTS=(-i "$SSH_KEY" -p "$SSH_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=10)
SSH=(ssh "${SSH_OPTS[@]}")

REMOTE_RELEASES="/home/ubuntu/persiantoolbox-releases"
REMOTE_CURRENT="/home/ubuntu/persiantoolbox-current"

vps_cmd() {
  "${SSH[@]}" "$REMOTE_USER@$VPS" "$@" 2>/dev/null
}

echo "══════════════════════════════════════════════════════════════"
echo "  RELEASE HISTORY — PersianToolbox"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── Section 1: Local PM2 processes ──────────────────────────────────────
echo "┌─ LOCAL PM2 PROCESSES ─────────────────────────────────────────┐"
if command -v pm2 &>/dev/null; then
  PM2_LIST=$(pm2 list --no-color 2>/dev/null || echo "PM2 not available locally")
  PT_LINES=$(echo "$PM2_LIST" | grep -i "persiantoolbox" || true)
  if [[ -n "$PT_LINES" ]]; then
    echo "$PM2_LIST" | head -1
    echo "$PT_LINES"
    echo "$PM2_LIST" | tail -1
  else
    echo "  No PersianToolbox processes running locally"
  fi
else
  echo "  PM2 not installed locally"
fi
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# ── Section 2: VPS PM2 processes ────────────────────────────────────────
echo "┌─ VPS PM2 PROCESSES ───────────────────────────────────────────┐"
if ! vps_cmd "pm2 list --no-color"; then
  echo "  ❌ Cannot reach VPS"
fi
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# ── Section 3: Active slot detection ────────────────────────────────────
echo "┌─ ACTIVE SLOT ──────────────────────────────────────────────────┐"
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
\"" || echo "unknown")

if [[ "$ACTIVE_PORT" == "3003" ]]; then
  ACTIVE_SLOT="green"
elif [[ "$ACTIVE_PORT" == "3000" ]]; then
  ACTIVE_SLOT="blue"
else
  ACTIVE_SLOT="unknown"
fi

echo "  Active slot: $ACTIVE_SLOT (port $ACTIVE_PORT)"
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# ── Section 4: Release directories ──────────────────────────────────────
echo "┌─ RELEASE DIRECTORIES ──────────────────────────────────────────┐"
RELEASES=$(vps_cmd "ls -1dt $REMOTE_RELEASES/*/ 2>/dev/null | head -20" || echo "")

if [[ -n "$RELEASES" ]]; then
  printf "  %-15s %-55s %-8s\n" "RELEASE" "DIRECTORY" "BUILD"
  printf "  %-15s %-55s %-8s\n" "-------" "---------" "-----"
  while IFS= read -r dir; do
    if [[ -z "$dir" ]]; then continue; fi
    RELEASE_ID=$(basename "$dir")
    COMMIT=$(echo "$RELEASE_ID" | cut -d'-' -f1)
    HAS_BUILD=$(vps_cmd "test -f $dir/.next/standalone/server.js && echo 'yes' || echo 'no'")
    IS_CURRENT=""
    CURRENT_TARGET=$(vps_cmd "readlink -f $REMOTE_CURRENT 2>/dev/null" || echo "")
    if [[ "$CURRENT_TARGET" == "$dir" ]]; then IS_CURRENT=" *"; fi
    printf "  %-15s %-55s %-8s%s\n" "${COMMIT:0:12}" "$dir" "$HAS_BUILD" "$IS_CURRENT"
  done <<< "$RELEASES"
else
  echo "  No release directories found"
fi
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# ── Section 5: Symlinks ─────────────────────────────────────────────────
echo "┌─ SYMLINKS ────────────────────────────────────────────────────┐"
for LINK in "$REMOTE_CURRENT" "/home/ubuntu/persiantoolbox"; do
  TARGET=$(vps_cmd "readlink -f '$LINK' 2>/dev/null || echo 'not found'")
  echo "  $LINK → $TARGET"
done
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

# ── Section 6: Git log (local) ─────────────────────────────────────────
echo "┌─ RECENT GIT COMMITS ──────────────────────────────────────────┐"
if git -C "$PROJECT_DIR" log --oneline -5 2>/dev/null; then
  :
else
  echo "  Not a git repo or no commits"
fi
echo "└──────────────────────────────────────────────────────────────┘"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  Done."
echo "══════════════════════════════════════════════════════════════"
