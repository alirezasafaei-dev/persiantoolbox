#!/usr/bin/env bash
set -Eeuo pipefail

SITE_URL="${SITE_URL:-https://persiantoolbox.ir}"
STATIC_STORE="${STATIC_STORE:-/home/ubuntu/persiantoolbox-shared-assets}"
CURRENT_APP_LINK="${CURRENT_APP_LINK:-/home/ubuntu/persiantoolbox}"
MARKER_FILE="${MARKER_FILE:-/etc/nginx/.persiantoolbox-static-safe}"
BACKUP_DIR="/etc/nginx/persiantoolbox-backups/$(date -u +%Y%m%dT%H%M%SZ)"
VERIFY_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/verify-release-assets.sh"

for command in rsync curl find sudo python3; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[static-store] required command missing: $command" >&2
    exit 1
  }
done

CURRENT_STATIC="$CURRENT_APP_LINK/.next/standalone/.next/static"
if [[ ! -d "$CURRENT_STATIC" ]]; then
  echo "[static-store] current production static directory missing: $CURRENT_STATIC" >&2
  exit 1
fi

CURRENT_COMMIT="$(curl -fsS --connect-timeout 3 --max-time 10 "${SITE_URL%/}/api/version" \
  | sed -nE 's/.*"commit":"([^"]+)".*/\1/p' | head -1 || true)"

bash "$VERIFY_SCRIPT" "${SITE_URL%/}" "$CURRENT_COMMIT"

sudo mkdir -p "$STATIC_STORE" "$BACKUP_DIR"
sudo rsync -a "$CURRENT_STATIC/" "$STATIC_STORE/"
sudo chmod -R a+rX "$STATIC_STORE"

CSS_COUNT="$(sudo find "$STATIC_STORE" -type f -name '*.css' | wc -l)"
JS_COUNT="$(sudo find "$STATIC_STORE" -type f -name '*.js' | wc -l)"
if [[ "$CSS_COUNT" -lt 1 || "$JS_COUNT" -lt 1 ]]; then
  echo "[static-store] seed failed: css=$CSS_COUNT js=$JS_COUNT" >&2
  exit 1
fi

mapfile -t NGINX_FILES < <(
  sudo grep -RIlE 'alias[[:space:]]+[^;]*\.next/(standalone/\.next/)?static/' \
    /etc/nginx/sites-enabled /etc/nginx/sites-available 2>/dev/null | sort -u
)

if (( ${#NGINX_FILES[@]} == 0 )); then
  if sudo grep -RqsF "alias $STATIC_STORE/;" /etc/nginx/sites-enabled /etc/nginx/sites-available; then
    echo "[static-store] nginx already uses the shared static store"
  else
    echo "[static-store] no known Next static alias found; refusing an unverified nginx edit" >&2
    exit 1
  fi
else
  for file in "${NGINX_FILES[@]}"; do
    relative="${file#/etc/nginx/}"
    backup="$BACKUP_DIR/$relative"
    sudo mkdir -p "$(dirname "$backup")"
    sudo cp -a "$file" "$backup"

    temp="$(mktemp)"
    sudo cat "$file" > "$temp"
    python3 - "$temp" "$STATIC_STORE" <<'PY'
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
store = sys.argv[2].rstrip('/')
text = path.read_text()
pattern = re.compile(r"alias\s+[^;\n]*?\.next/(?:standalone/\.next/)?static/;")
updated, count = pattern.subn(f"alias {store}/;", text)
if count == 0:
    raise SystemExit("no replaceable Next static alias found")
path.write_text(updated)
PY
    sudo install -m "$(stat -c '%a' "$file")" "$temp" "$file"
    rm -f "$temp"
  done
fi

restore_nginx() {
  echo "[static-store] restoring nginx configuration" >&2
  while IFS= read -r backup; do
    relative="${backup#$BACKUP_DIR/}"
    sudo cp -a "$backup" "/etc/nginx/$relative"
  done < <(sudo find "$BACKUP_DIR" -type f 2>/dev/null || true)
  sudo nginx -t
  sudo systemctl reload nginx
}

if ! sudo nginx -t; then
  restore_nginx
  exit 1
fi
sudo systemctl reload nginx

if ! sudo grep -RqsF "alias $STATIC_STORE/;" /etc/nginx/sites-enabled /etc/nginx/sites-available; then
  restore_nginx
  echo "[static-store] shared static alias not active after reload" >&2
  exit 1
fi

if ! bash "$VERIFY_SCRIPT" "${SITE_URL%/}" "$CURRENT_COMMIT"; then
  restore_nginx
  echo "[static-store] public verification failed; nginx configuration restored" >&2
  exit 1
fi

printf 'STATIC_STORE=%s\nPROVISIONED_AT=%s\n' \
  "$STATIC_STORE" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  | sudo tee "$MARKER_FILE" >/dev/null
sudo chmod 600 "$MARKER_FILE"

echo "[static-store] provisioned: store=$STATIC_STORE css=$CSS_COUNT js=$JS_COUNT backup=$BACKUP_DIR"
