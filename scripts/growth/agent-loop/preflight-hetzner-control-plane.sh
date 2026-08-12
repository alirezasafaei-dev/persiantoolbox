#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
pass() { printf 'PASS: %s\n' "$*"; }

[[ "$(id -u)" -ne 0 ]] || fail "run as the dedicated automation user, not root"
export PATH="${HOME}/.local/bin:${PATH}"

cpu_count="$(nproc)"
memory_kib="$(awk '/MemTotal/ { print $2 }' /proc/meminfo)"
[[ "$cpu_count" -ge 2 ]] || fail "at least 2 CPU cores are required"
[[ "$memory_kib" -ge 3500000 ]] || fail "at least 3.5 GiB usable memory is required"
pass "host resources: ${cpu_count} CPU, ${memory_kib} KiB MemTotal"

for command in bash curl gh git loginctl node npm ssh systemctl; do
  command -v "$command" >/dev/null || fail "missing command: $command"
done

[[ "$(loginctl show-user "$USER" -p Linger --value)" == "yes" ]] \
  || fail "Linger must be enabled before installation: sudo loginctl enable-linger $USER"
pass "systemd user persistence is enabled"

node_version="$(node -p 'process.versions.node')"
node -e 'const [a,b,c]=process.versions.node.split(".").map(Number); const ok=(a===22&&(b>22||(b===22&&c>=3)))||(a===24&&b>=15)||(a===25&&b>=9)||a>=26; process.exit(ok?0:1)' \
  || fail "supported Node is required (22.22.3+, 24.15+, 25.9+, or 26+); found ${node_version}"
pass "Node ${node_version}"

tmp_headers="$(mktemp)"
tmp_body="$(mktemp)"
trap 'rm -f "$tmp_headers" "$tmp_body"' EXIT

http_code="$(curl --silent --show-error --location \
  --connect-timeout 10 --max-time 20 \
  --dump-header "$tmp_headers" --output "$tmp_body" \
  --write-out '%{http_code}' \
  https://api.notion.com/v1/users/me)" || http_code="000"

content_type="$(awk 'BEGIN{IGNORECASE=1} /^content-type:/ {gsub("\r", ""); print tolower($0)}' "$tmp_headers" | tail -1)"
if [[ "$http_code" == "403" && "$content_type" == *"text/html"* ]]; then
  awk 'BEGIN{IGNORECASE=1} /^(server|via|cf-ray|content-type):/ {gsub("\r", ""); print "NOTION_HEADER " $0}' "$tmp_headers"
  printf 'NOTION_EDGE_BLOCKED: HTTP 403 HTML response\n' >&2
  exit 1
elif [[ "$http_code" == "401" && "$content_type" == *"application/json"* ]]; then
  pass "Notion route is healthy: HTTP 401 application/json without credentials"
else
  pass "Notion diagnostic: HTTP ${http_code:-000}; GitHub remains canonical"
fi

git ls-remote --exit-code https://github.com/alirezasafaei-dev/persiantoolbox.git HEAD >/dev/null \
  || fail "GitHub repository is unreachable"
pass "GitHub repository is reachable"

available_kib="$(df -Pk "$HOME" | awk 'NR==2 {print $4}')"
[[ "$available_kib" -ge 8388608 ]] || fail "at least 8 GiB free disk space is required"
pass "disk capacity is sufficient"

printf 'PREFLIGHT_OK\n'
