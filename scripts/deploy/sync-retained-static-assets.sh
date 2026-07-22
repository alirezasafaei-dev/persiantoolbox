#!/usr/bin/env bash
set -Eeuo pipefail

STATIC_STORE="${STATIC_STORE:-/home/ubuntu/persiantoolbox-shared-assets}"
PRIMARY_RELEASES="${PRIMARY_RELEASES:-/var/www/persian-tools/releases/production}"
LEGACY_RELEASES="${LEGACY_RELEASES:-/home/ubuntu/persiantoolbox-releases}"
CURRENT_LINK="${CURRENT_LINK:-/home/ubuntu/persiantoolbox}"

for command in find rsync sudo; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "[static-retention] missing command: $command" >&2
    exit 1
  }
done

sudo mkdir -p "$STATIC_STORE"
SYNCED=0

sync_directory() {
  local static_dir="$1"
  [[ -d "$static_dir" ]] || return 0
  sudo rsync -a "$static_dir/" "$STATIC_STORE/"
  SYNCED=$((SYNCED + 1))
}

for root in "$PRIMARY_RELEASES" "$LEGACY_RELEASES"; do
  [[ -d "$root" ]] || continue
  while IFS= read -r static_dir; do
    sync_directory "$static_dir"
  done < <(find "$root" -type d -path '*/.next/standalone/.next/static' -print)
done

sync_directory "$CURRENT_LINK/.next/standalone/.next/static"
sudo chmod -R a+rX "$STATIC_STORE"

for root in "$PRIMARY_RELEASES" "$LEGACY_RELEASES"; do
  [[ -d "$root" ]] || continue
  while IFS= read -r blog_dir; do
    [[ -d "$blog_dir" ]] || continue
    latest_release="$(dirname "$(dirname "$blog_dir")")"
    standalone_blog="$latest_release/.next/standalone/content/blog"
    if [[ -d "$blog_dir" && ! -d "$standalone_blog" ]]; then
      mkdir -p "$(dirname "$standalone_blog")"
      cp -a "$blog_dir" "$standalone_blog"
      echo "[static-retention] synced content/blog to standalone: $standalone_blog ($(find "$standalone_blog" -name '*.md' | wc -l) files)"
    fi
  done < <(find "$root" -maxdepth 3 -type d -name 'blog' -path '*/content/blog' -print 2>/dev/null)
done

CSS_COUNT="$(sudo find "$STATIC_STORE" -type f -name '*.css' | wc -l)"
JS_COUNT="$(sudo find "$STATIC_STORE" -type f -name '*.js' | wc -l)"
[[ "$CSS_COUNT" -gt 0 && "$JS_COUNT" -gt 0 ]] || {
  echo "[static-retention] invalid store after sync: css=$CSS_COUNT js=$JS_COUNT" >&2
  exit 1
}

echo "[static-retention] pass: sources=$SYNCED css=$CSS_COUNT js=$JS_COUNT store=$STATIC_STORE"
