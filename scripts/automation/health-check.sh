#!/bin/bash
# health-check.sh — Verify site, SSL, services
# Usage: bash scripts/automation/health-check.sh
set -e

echo "=== PersianToolbox Health Check ==="
echo "Time: $(date)"
echo ""

# 1. HTTPS health endpoint
HEALTH=$(curl -s --connect-timeout 5 --max-time 10 https://persiantoolbox.ir/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null)
  echo "✅ Health: OK (v$VERSION)"
else
  echo "❌ Health: FAIL"
fi

# 2. CSS served correctly
CSS_FILE=$(curl -s --connect-timeout 5 https://persiantoolbox.ir/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
  if [ "$CSS_HTTP" = "200" ]; then
    echo "✅ CSS: HTTP $CSS_HTTP"
  else
    echo "❌ CSS: HTTP $CSS_HTTP"
  fi
else
  echo "❌ CSS: Not found in HTML"
fi

# 3. SSL certificate
SSL_EXPIRY=$(echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
  echo "✅ SSL: Expires $SSL_EXPIRY"
else
  echo "❌ SSL: Could not check"
fi

# 4. Key pages return 200
for PAGE in "/" "/topics" "/salary" "/pricing" "/blog" "/search"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${PAGE}" 2>/dev/null)
  if [ "$HTTP" = "200" ]; then
    echo "✅ $PAGE: HTTP $HTTP"
  else
    echo "❌ $PAGE: HTTP $HTTP"
  fi
done

echo ""
echo "=== Check complete ==="
