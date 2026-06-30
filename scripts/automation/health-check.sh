#!/bin/bash
# health-check.sh — Comprehensive site, SSL, services check
# Usage: bash scripts/automation/health-check.sh

echo "=== PersianToolbox Health Check ==="
echo "Time: $(date)"
echo ""

PASS=0
FAIL=0

ok()   { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }

# 1. Health API
HEALTH=$(curl -s --connect-timeout 5 --max-time 10 https://persiantoolbox.ir/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null)
  UPTIME=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['uptime'])" 2>/dev/null)
  ok "Health: v${VERSION}, uptime=${UPTIME}s"
else
  fail "Health: FAIL"
fi

# 2. CSS served correctly
CSS_FILE=$(curl -s --connect-timeout 5 https://persiantoolbox.ir/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${CSS_FILE}" 2>/dev/null)
  if [ "$CSS_HTTP" = "200" ]; then
    ok "CSS: HTTP 200"
  else
    fail "CSS: HTTP $CSS_HTTP"
  fi
else
  fail "CSS: Not found in HTML"
fi

# 3. PDF Worker
WORKER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://persiantoolbox.ir/pdf.worker.min.mjs 2>/dev/null)
[ "$WORKER_HTTP" = "200" ] && ok "PDF worker: HTTP 200" || fail "PDF worker: HTTP $WORKER_HTTP"

# 4. Fonts
for font in "/fonts/Vazirmatn-Regular.woff2" "/fonts/Vazirmatn-Bold.woff2" "/fonts/Vazirmatn-SemiBold.woff2"; do
  FONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${font}" 2>/dev/null)
  [ "$FONT_HTTP" = "200" ] && ok "Font $(basename $font): HTTP 200" || fail "Font $(basename $font): HTTP $FONT_HTTP"
done

# 5. SSL certificate
SSL_EXPIRY=$(echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
  EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  [ "$DAYS_LEFT" -gt 30 ] && ok "SSL: $DAYS_LEFT days remaining" || fail "SSL: $DAYS_LEFT days remaining (renew!)"
else
  fail "SSL: Could not check"
fi

# 6. HTTP → HTTPS redirect
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://persiantoolbox.ir/ 2>/dev/null)
[ "$HTTP_CODE" = "301" ] && ok "HTTP→HTTPS: 301 redirect" || fail "HTTP→HTTPS: HTTP $HTTP_CODE"

# 7. Key pages
echo ""
echo "Key pages:"
for PAGE in "/" "/topics" "/salary" "/pricing" "/blog" "/search" "/about" "/contact" "/tools" "/contract-tools" "/writing-tools/persian-writing-studio"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "https://persiantoolbox.ir${PAGE}" 2>/dev/null)
  [ "$HTTP" = "200" ] && ok "$PAGE: HTTP 200" || fail "$PAGE: HTTP $HTTP"
done

# 8. API endpoints
echo ""
echo "API endpoints:"
for API in "/api/health" "/api/ready" "/api/version" "/api/market" "/api/widget/tools"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${API}" 2>/dev/null)
  [ "$HTTP" = "200" ] && ok "$API: HTTP 200" || fail "$API: HTTP $HTTP"
done

# 9. Security headers
echo ""
echo "Security headers:"
HEADERS=$(curl -sI https://persiantoolbox.ir/ 2>/dev/null)
for h in "x-frame-options" "x-content-type-options" "strict-transport-security" "content-security-policy"; do
  FOUND=$(echo "$HEADERS" | grep -i "^${h}:" | head -1)
  [ -n "$FOUND" ] && ok "$h" || fail "$h: MISSING"
done

# 10. Static assets
echo ""
echo "Static assets:"
for ASSET in "/robots.txt" "/sitemap.xml" "/favicon.ico" "/manifest.webmanifest"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://persiantoolbox.ir${ASSET}" 2>/dev/null)
  [ "$HTTP" = "200" ] && ok "$ASSET: HTTP 200" || fail "$ASSET: HTTP $HTTP"
done

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "✅ All checks passed" || echo "❌ $FAIL check(s) failed"
