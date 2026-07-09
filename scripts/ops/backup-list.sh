#!/bin/bash
# backup-list.sh — List all existing PersianToolbox backups with sizes and dates
# Usage: bash scripts/ops/backup-list.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"

echo "══════════════════════════════════════════════════════════════"
echo "  PersianToolbox Backups — $(date)"
echo "══════════════════════════════════════════════════════════════"
echo ""

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "  No backups directory found at: $BACKUP_DIR"
  echo "  Run backup-restore-drill.sh first."
  exit 0
fi

TOTAL_FILES=0
TOTAL_SIZE=0

format_size() {
  local size=$1
  if [[ "$size" -ge 1073741824 ]]; then
    echo "$(echo "scale=1; $size/1073741824" | bc)G"
  elif [[ "$size" -ge 1048576 ]]; then
    echo "$(echo "scale=1; $size/1048576" | bc)M"
  elif [[ "$size" -ge 1024 ]]; then
    echo "$(echo "scale=1; $size/1024" | bc)K"
  else
    echo "${size}B"
  fi
}

list_dir() {
  local dir="$1" label="$2"
  local count
  count=$(find "$dir" -maxdepth 1 -type f 2>/dev/null | wc -l)
  [[ "$count" -eq 0 ]] && return

  echo "── $label ──────────────────────────────────────"
  printf "  %-30s %12s  %s\n" "FILE" "SIZE" "MODIFIED"
  echo "  ───────────────────────────── ──────────── ──────────────────"

  while IFS=' ' read -r ts size fname; do
    [[ -z "$fname" ]] && continue
    mod_date=$(date -d "@${ts%.*}" '+%Y-%m-%d %H:%M' 2>/dev/null || echo "unknown")
    human_size=$(format_size "$size")
    printf "  %-30s %12s  %s\n" "$fname" "$human_size" "$mod_date"
    TOTAL_FILES=$((TOTAL_FILES + 1))
    TOTAL_SIZE=$((TOTAL_SIZE + size))
  done < <(find "$dir" -maxdepth 1 -type f -printf "%T@ %s %f\n" 2>/dev/null | sort -rn)

  echo ""
}

# Group backups by subdirectory
for subdir in "$BACKUP_DIR"/*/; do
  [[ ! -d "$subdir" ]] && continue
  list_dir "$subdir" "$(basename "$subdir")"
done

# Also list any backup files directly in backups/
list_dir "$BACKUP_DIR" "root"

# Summary
TOTAL_HUMAN=$(format_size "$TOTAL_SIZE")

echo "══════════════════════════════════════════════════════════════"
echo "  Total: $TOTAL_FILES files, $TOTAL_HUMAN"
echo "══════════════════════════════════════════════════════════════"
