#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${1:-}"
EXPECTED_COMMIT="${2:-}"
VERIFY_HEALTH="${VERIFY_HEALTH:-true}"
VERIFY_CACHE_HEADERS="${VERIFY_CACHE_HEADERS:-true}"

if [[ -z "$BASE_URL" ]]; then
  echo "usage: $(basename "$0") <base-url> [expected-commit]" >&2
  exit 64
fi
for flag in VERIFY_HEALTH VERIFY_CACHE_HEADERS; do
  value="${!flag}"
  if [[ "$value" != "true" && "$value" != "false" ]]; then
    echo "[verify-assets] $flag must be true or false" >&2
    exit 64
  fi
done

BASE_URL="${BASE_URL%/}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl_safe() {
  env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy \
    curl --fail --silent --show-error --location --retry 2 --retry-all-errors \
      --connect-timeout 5 --max-time 30 "$@"
}

assert_json_status() {
  local endpoint="$1"
  local expected_pattern="$2"
  local output="$TMP_DIR/$(printf '%s' "$endpoint" | tr '/?' '__').json"
  curl_safe -H 'Cache-Control: no-cache' "$BASE_URL$endpoint" > "$output"
  grep -Eq "$expected_pattern" "$output" || {
    echo "[verify-assets] unexpected response from $endpoint" >&2
    head -c 500 "$output" >&2 || true
    echo >&2
    return 1
  }
}

if [[ "$VERIFY_HEALTH" == "true" ]]; then
  assert_json_status "/api/health" '"status"[[:space:]]*:[[:space:]]*"ok"'
  assert_json_status "/api/ready" '"ok"[[:space:]]*:[[:space:]]*true'
fi

if [[ -n "$EXPECTED_COMMIT" ]]; then
  VERSION_FILE="$TMP_DIR/version.json"
  curl_safe -H 'Cache-Control: no-cache' "$BASE_URL/api/version" > "$VERSION_FILE"
  SHORT_COMMIT="${EXPECTED_COMMIT:0:12}"
  grep -Fq "$SHORT_COMMIT" "$VERSION_FILE" || {
    echo "[verify-assets] commit mismatch: expected $SHORT_COMMIT" >&2
    head -c 500 "$VERSION_FILE" >&2 || true
    echo >&2
    exit 1
  }
fi

PAGES=("/" "/blog" "/pricing" "/tools" "/salary")
ASSET_LIST="$TMP_DIR/assets.txt"
: > "$ASSET_LIST"

for page in "${PAGES[@]}"; do
  safe_name="$(printf '%s' "$page" | sed 's#[^A-Za-z0-9]#_#g')"
  html="$TMP_DIR/page${safe_name}.html"
  headers="$TMP_DIR/page${safe_name}.headers"
  curl_safe -H 'Cache-Control: no-cache' -D "$headers" "$BASE_URL$page" > "$html"
  [[ -s "$html" ]] || {
    echo "[verify-assets] empty HTML for $page" >&2
    exit 1
  }

  if [[ "$VERIFY_CACHE_HEADERS" == "true" ]]; then
    cache_control="$(grep -i '^cache-control:' "$headers" | tail -1 | tr -d '\r' || true)"
    cdn_cache_control="$(grep -i '^cdn-cache-control:' "$headers" | tail -1 | tr -d '\r' || true)"
    if [[ "$cache_control" != *"no-store"* && "$cache_control" != *"max-age=0"* ]]; then
      echo "[verify-assets] unsafe HTML cache policy for $page: ${cache_control:-missing}" >&2
      exit 1
    fi
    if [[ -n "$cdn_cache_control" && "$cdn_cache_control" != *"no-store"* ]]; then
      echo "[verify-assets] unsafe CDN cache policy for $page: $cdn_cache_control" >&2
      exit 1
    fi
  fi

  grep -oE '(href|src)="/_next/static/[^"]+\.(css|js)(\?[^\"]*)?"' "$html" \
    | sed -E 's/^(href|src)="([^"]+)"$/\2/' \
    | sed 's/[?].*$//' >> "$ASSET_LIST" || true
done

sort -u -o "$ASSET_LIST" "$ASSET_LIST"
CSS_COUNT="$(grep -cE '\.css$' "$ASSET_LIST" || true)"
JS_COUNT="$(grep -cE '\.js$' "$ASSET_LIST" || true)"

if [[ "$CSS_COUNT" -lt 1 || "$JS_COUNT" -lt 1 ]]; then
  echo "[verify-assets] expected at least one CSS and one JS asset; css=$CSS_COUNT js=$JS_COUNT" >&2
  exit 1
fi

FAILURES=0
while IFS= read -r asset; do
  [[ -n "$asset" ]] || continue
  metrics="$(curl_safe -H 'Cache-Control: no-cache' --output /dev/null --write-out '%{http_code}\t%{content_type}\t%{size_download}' "$BASE_URL$asset")" || {
    echo "[verify-assets] request failed: $asset" >&2
    FAILURES=$((FAILURES + 1))
    continue
  }
  IFS=$'\t' read -r code content_type size_download <<< "$metrics"

  if [[ "$code" != "200" || "${size_download%.*}" -le 0 ]]; then
    echo "[verify-assets] invalid asset response: code=$code size=$size_download asset=$asset" >&2
    FAILURES=$((FAILURES + 1))
    continue
  fi

  case "$asset" in
    *.css)
      [[ "$content_type" == text/css* ]] || {
        echo "[verify-assets] invalid CSS content-type '$content_type': $asset" >&2
        FAILURES=$((FAILURES + 1))
      }
      ;;
    *.js)
      [[ "$content_type" == *javascript* || "$content_type" == text/plain* ]] || {
        echo "[verify-assets] invalid JS content-type '$content_type': $asset" >&2
        FAILURES=$((FAILURES + 1))
      }
      ;;
  esac
done < "$ASSET_LIST"

for font in \
  /fonts/Vazirmatn-Regular.woff2 \
  /fonts/Vazirmatn-SemiBold.woff2 \
  /fonts/Vazirmatn-Bold.woff2; do
  curl_safe -H 'Cache-Control: no-cache' --output /dev/null "$BASE_URL$font" || {
    echo "[verify-assets] font unavailable: $font" >&2
    FAILURES=$((FAILURES + 1))
  }
done

if [[ "$FAILURES" -ne 0 ]]; then
  echo "[verify-assets] failed with $FAILURES asset error(s)" >&2
  exit 1
fi

echo "[verify-assets] pass: pages=${#PAGES[@]} css=$CSS_COUNT js=$JS_COUNT health=$VERIFY_HEALTH cache=$VERIFY_CACHE_HEADERS base=$BASE_URL"
