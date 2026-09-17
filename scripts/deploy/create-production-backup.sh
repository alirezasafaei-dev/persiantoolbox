#!/usr/bin/env bash
set -Eeuo pipefail

BASE_DIR="${1:-/home/ubuntu/persiantoolbox-blue-green}"
BACKUP_DIR="${2:-/home/ubuntu/backups}"
ENV_FILE="$BASE_DIR/shared/env/production.env"
STATE_FILE="$BASE_DIR/shared/deploy/production-current.env"

for command_name in pg_dump gzip; do
  command -v "$command_name" >/dev/null 2>&1 || {
    echo "[production-backup] missing required command: $command_name" >&2
    exit 1
  }
done

test -f "$ENV_FILE" || {
  echo "[production-backup] missing production env: $ENV_FILE" >&2
  exit 1
}

install -d -m 700 "$BACKUP_DIR"
umask 077
set -a
source "$ENV_FILE"
set +a
: "${DATABASE_URL:?DATABASE_URL is required for production backup}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/persian_tools_predeploy_${timestamp}.sql.gz"
tmp_file="${backup_file}.tmp"
cleanup() { rm -f "$tmp_file"; }
trap cleanup EXIT

pg_dump --no-owner --no-acl "$DATABASE_URL" | gzip -9 > "$tmp_file"
test -s "$tmp_file" || {
  echo "[production-backup] backup file is empty" >&2
  exit 1
}
gzip -t "$tmp_file"
mv "$tmp_file" "$backup_file"
chmod 600 "$backup_file"

if [[ -f "$STATE_FILE" ]]; then
  install -m 600 "$STATE_FILE" "$BACKUP_DIR/production-current_${timestamp}.env"
fi

size_bytes="$(stat -c %s "$backup_file")"
echo "[production-backup] created $(basename "$backup_file") bytes=$size_bytes"
trap - EXIT
