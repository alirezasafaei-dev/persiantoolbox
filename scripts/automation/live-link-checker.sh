#!/bin/bash
# live-link-checker.sh — Crawl live site and find broken internal links
# Usage: bash scripts/automation/live-link-checker.sh [max_pages]
# Default: checks 100 pages

set -e

SITE="https://persiantoolbox.ir"
MAX_PAGES="${1:-100}"
TIMEOUT=10
TEMP_DIR=$(mktemp -d)
VISITED="$TEMP_DIR/visited"
QUEUE="$TEMP_DIR/queue"
RESULTS="$TEMP_DIR/results"

trap 'rm -rf "$TEMP_DIR"' EXIT

touch "$VISITED" "$RESULTS"

echo "=== Live Link Checker ==="
echo "Site: $SITE"
echo "Max pages: $MAX_PAGES"
echo ""

# Seed with homepage
echo "/" > "$QUEUE"
PAGE_COUNT=0
BROKEN_COUNT=0
CHECKED_COUNT=0

check_url() {
  local url="$1"
  local HTTP_CODE
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "$url" 2>/dev/null)
  echo "$HTTP_CODE"
}

extract_links() {
  local url="$1"
  curl -s --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "$url" 2>/dev/null \
    | grep -oP 'href="(/[^"]*)"' \
    | sed 's/href="//;s/"//' \
    | grep -v '^#' \
    | grep -v '^//' \
    | grep -v '\.\(js\|css\|png\|jpg\|jpeg\|gif\|svg\|woff\|woff2\|ttf\|ico\|pdf\|zip\)$' \
    | sed 's/?.*$//' \
    | sed 's/#.*$//' \
    | sort -u
}

echo "Crawling..."
while IFS= read -r path && [ "$PAGE_COUNT" -lt "$MAX_PAGES" ]; do
  # Skip if already visited
  if grep -qFx "$path" "$VISITED" 2>/dev/null; then
    continue
  fi

  echo "$path" >> "$VISITED"
  PAGE_COUNT=$((PAGE_COUNT + 1))

  FULL_URL="${SITE}${path}"
  HTTP_CODE=$(check_url "$FULL_URL")
  CHECKED_COUNT=$((CHECKED_COUNT + 1))

  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ [$PAGE_COUNT/$MAX_PAGES] $path (HTTP $HTTP_CODE)"
    # Extract internal links and add to queue
    extract_links "$FULL_URL" >> "$QUEUE"
  elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "  ↗️  [$PAGE_COUNT/$MAX_PAGES] $path (HTTP $HTTP_CODE redirect)"
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "  ❌ [$PAGE_COUNT/$MAX_PAGES] $path (HTTP $HTTP_CODE)"
    echo "BROKEN: $path (HTTP $HTTP_CODE)" >> "$RESULTS"
    BROKEN_COUNT=$((BROKEN_COUNT + 1))
  elif [ "$HTTP_CODE" = "403" ]; then
    echo "  🔒 [$PAGE_COUNT/$MAX_PAGES] $path (HTTP $HTTP_CODE forbidden)"
  else
    echo "  ⚠️  [$PAGE_COUNT/$MAX_PAGES] $path (HTTP $HTTP_CODE)"
    echo "ERROR: $path (HTTP $HTTP_CODE)" >> "$RESULTS"
    BROKEN_COUNT=$((BROKEN_COUNT + 1))
  fi

  # Deduplicate queue
  sort -u "$QUEUE" -o "$QUEUE"

done < "$QUEUE"

echo ""
echo "=== Summary ==="
echo "Pages crawled: $PAGE_COUNT"
echo "URLs checked: $CHECKED_COUNT"
echo "Broken links: $BROKEN_COUNT"

if [ "$BROKEN_COUNT" -gt 0 ]; then
  echo ""
  echo "Broken links found:"
  cat "$RESULTS" | grep "^BROKEN:" | sed 's/^BROKEN: /  ❌ /'
  exit 1
else
  echo ""
  echo "✅ No broken links found"
  exit 0
fi
