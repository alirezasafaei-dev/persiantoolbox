#!/usr/bin/env bash
set -uo pipefail

URLS=(
  "https://persiantoolbox.ir/"
  "https://persiantoolbox.ir/api/ready"
  "https://persiantoolbox.ir/blog"
  "https://persiantoolbox.ir/pricing"
  "https://persiantoolbox.ir/tools"
  "https://alirezasafaeisystems.ir/"
  "https://audit.alirezasafaeisystems.ir/"
)

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PASS=0
FAIL=0

echo "=== Uptime Check — $TIMESTAMP ==="
echo ""

for url in "${URLS[@]}"; do
  status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$url" 2>/dev/null) || status="000"
  if [[ "$status" == "200" ]]; then
    echo "[OK]   $status  $url"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $status  $url"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
if [[ $FAIL -eq 0 ]]; then
  echo "HEALTHY — all $PASS endpoints returned 200"
  exit 0
else
  echo "DEGRADED — $FAIL/$((PASS+FAIL)) endpoints non-200"
  exit 1
fi
