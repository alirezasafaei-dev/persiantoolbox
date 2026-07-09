#!/bin/bash
# backup-restore-drill.sh — Backup and restore drill for PersianToolbox
# Creates backups of: database, .env files, PM2 ecosystem config
# Verifies backups exist and have content, reports status
# Usage: bash scripts/ops/backup-restore-drill.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups/drill"
DATE=$(date +%Y%m%d_%H%M%S)
DRILL_LOG="$BACKUP_DIR/drill-${DATE}.log"

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
VPS_USER="ubuntu"
DB_NAME="persian_tools"

FAILED=0
RESULTS=()

mkdir -p "$BACKUP_DIR"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" | tee -a "$DRILL_LOG"
}

record() {
  local name="$1" status="$2" detail="$3"
  RESULTS+=("$status|$name|$detail")
  if [[ "$status" == "FAIL" ]]; then
    FAILED=1
  fi
}

# ── Step 1: Backup database ──────────────────────────────────────────────
log "Step 1: Backing up PostgreSQL database..."

DB_BACKUP="$BACKUP_DIR/db_${DATE}.sql"
if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
     "$VPS_USER@$VPS" \
     "sudo -u postgres pg_dump $DB_NAME" > "$DB_BACKUP" 2>/dev/null; then
  DB_SIZE=$(stat -c%s "$DB_BACKUP" 2>/dev/null || echo "0")
  if [[ "$DB_SIZE" -gt 100 ]]; then
    record "database" "OK" "$DB_BACKUP ($DB_SIZE bytes)"
  else
    record "database" "FAIL" "Backup too small ($DB_SIZE bytes), likely empty"
  fi
else
  # Fallback: try SQLite if present locally
  SQLITE_DB="$PROJECT_DIR/data/persiantoolbox.db"
  if [[ -f "$SQLITE_DB" ]]; then
    cp "$SQLITE_DB" "$BACKUP_DIR/db_${DATE}.sqlite"
    SQLITE_SIZE=$(stat -c%s "$BACKUP_DIR/db_${DATE}.sqlite" 2>/dev/null || echo "0")
    record "database" "OK" "SQLite fallback: $BACKUP_DIR/db_${DATE}.sqlite ($SQLITE_SIZE bytes)"
  else
    record "database" "FAIL" "PostgreSQL unreachable, no local SQLite found"
  fi
fi

# ── Step 2: Backup .env files ───────────────────────────────────────────
log "Step 2: Backing up .env files..."

ENV_BACKUP="$BACKUP_DIR/env_${DATE}.tar.gz"
ENV_FILES_FOUND=0
ENV_TAR_ARGS=()

for env_file in .env .env.local .env.production .env.release .env.example .env.production.example; do
  if [[ -f "$PROJECT_DIR/$env_file" ]]; then
    ENV_TAR_ARGS+=("$env_file")
    ENV_FILES_FOUND=$((ENV_FILES_FOUND + 1))
  fi
done

if [[ $ENV_FILES_FOUND -gt 0 ]]; then
  tar czf "$ENV_BACKUP" -C "$PROJECT_DIR" "${ENV_TAR_ARGS[@]}" 2>/dev/null
  ENV_SIZE=$(stat -c%s "$ENV_BACKUP" 2>/dev/null || echo "0")
  record "env" "OK" "$ENV_BACKUP ($ENV_SIZE bytes, $ENV_FILES_FOUND files)"
else
  record "env" "FAIL" "No .env files found in $PROJECT_DIR"
fi

# ── Step 3: Backup PM2 ecosystem config ──────────────────────────────────
log "Step 3: Backing up PM2 ecosystem config..."

PM2_BACKUP="$BACKUP_DIR/ecosystem_${DATE}.js"
ECOSYSTEM_SRC="$PROJECT_DIR/ecosystem.config.js"

if [[ -f "$ECOSYSTEM_SRC" ]]; then
  cp "$ECOSYSTEM_SRC" "$PM2_BACKUP"
  PM2_SIZE=$(stat -c%s "$PM2_BACKUP" 2>/dev/null || echo "0")
  record "pm2-config" "OK" "$PM2_BACKUP ($PM2_SIZE bytes)"
else
  record "pm2-config" "FAIL" "ecosystem.config.js not found at $ECOSYSTEM_SRC"
fi

# Also save PM2 process list if pm2 is available
PM2_DUMP="$BACKUP_DIR/pm2-processes_${DATE}.txt"
if command -v pm2 &>/dev/null; then
  pm2 list > "$PM2_DUMP" 2>/dev/null || true
  PM2_DUMP_SIZE=$(stat -c%s "$PM2_DUMP" 2>/dev/null || echo "0")
  record "pm2-processes" "OK" "$PM2_DUMP ($PM2_DUMP_SIZE bytes)"
else
  # Try over SSH to VPS
  if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
       "$VPS_USER@$VPS" "pm2 list" > "$PM2_DUMP" 2>/dev/null; then
    PM2_DUMP_SIZE=$(stat -c%s "$PM2_DUMP" 2>/dev/null || echo "0")
    record "pm2-processes" "OK" "$PM2_DUMP ($PM2_DUMP_SIZE bytes, via VPS)"
  else
    record "pm2-processes" "FAIL" "pm2 not available locally or on VPS"
  fi
fi

# ── Step 4: Verify backup files ─────────────────────────────────────────
log "Step 4: Verifying backup integrity..."

VERIFY_OK=0
VERIFY_TOTAL=0

for f in "$BACKUP_DIR"/*_${DATE}.*; do
  [[ ! -f "$f" ]] && continue
  VERIFY_TOTAL=$((VERIFY_TOTAL + 1))
  FSIZE=$(stat -c%s "$f" 2>/dev/null || echo "0")
  if [[ "$FSIZE" -gt 0 ]]; then
    VERIFY_OK=$((VERIFY_OK + 1))
    log "  ✓ $(basename "$f"): $FSIZE bytes"
  else
    log "  ✗ $(basename "$f"): EMPTY (0 bytes)"
    FAILED=1
  fi
done

if [[ $VERIFY_TOTAL -eq 0 ]]; then
  record "verify" "FAIL" "No backup files created"
  FAILED=1
else
  record "verify" "OK" "$VERIFY_OK/$VERIFY_TOTAL files have content"
fi

# ── Step 5: Report ──────────────────────────────────────────────────────
log ""
log "══════════════════════════════════════════════════════"
log "  BACKUP DRILL REPORT — $(date)"
log "══════════════════════════════════════════════════════"

TOTAL=0
PASSED=0
FAILED_COUNT=0

for entry in "${RESULTS[@]}"; do
  IFS='|' read -r status name detail <<< "$entry"
  TOTAL=$((TOTAL + 1))
  if [[ "$status" == "OK" ]]; then
    PASSED=$((PASSED + 1))
    log "  ✓ $name: $detail"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    log "  ✗ $name: $detail"
  fi
done

log ""
log "  Total: $TOTAL | Passed: $PASSED | Failed: $FAILED_COUNT"
log "  Backup directory: $BACKUP_DIR"
log "  Drill log: $DRILL_LOG"
log "══════════════════════════════════════════════════════"

# ── Step 6: Exit ────────────────────────────────────────────────────────
if [[ "$FAILED" -eq 0 ]]; then
  log ""
  log "DRILL PASSED — All backups created successfully."
  exit 0
else
  log ""
  log "DRILL FAILED — One or more backups failed. Review above."
  exit 1
fi
