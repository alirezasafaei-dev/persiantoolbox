#!/bin/bash
# post-deploy-verify.sh — Comprehensive post-deploy verification
# Run after deploy to verify everything works: health, CSS, fonts, worker, SSL, headers, pages
# Usage: bash scripts/automation/post-deploy-verify.sh

set -e

SITE="https://persiantoolbox.ir"
PASS=0
FAIL=0
WARN=0

ok()   { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN + 1)); }

echo "============================================"
echo "  POST-DEPLOY VERIFICATION"
echo "  Site: $SITE"
echo "  Time: $(date)"
echo "============================================"
echo ""

# 1. Health API
echo "--- 1. Health API ---"
HEALTH=$(curl -s --connect-timeout 5 --max-time 10 "${SITE}/api/health" 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
  UPTIME=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('uptime',0))" 2>/dev/null || echo "0")
  MEM=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('memory',{}).get('rss',0))" 2>/dev/null || echo "0")
  ok "Health: v${VERSION}, uptime=${UPTIME}s, mem=${MEM}MB"
else
  fail "Health endpoint failed"
fi

# 2. Readiness API
READY=$(curl -s --connect-timeout 5 "${SITE}/api/ready" 2>/dev/null)
if echo "$READY" | grep -q '"ok":true'; then
  ok "Ready: OK"
else
  fail "Readiness check failed"
fi

# 3. CSS serving
echo ""
echo "--- 2. Static Assets ---"
CSS_FILE=$(curl -s "${SITE}/" 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}${CSS_FILE}" 2>/dev/null)
  CSS_SIZE=$(curl -s "${SITE}${CSS_FILE}" 2>/dev/null | wc -c)
  if [ "$CSS_HTTP" = "200" ]; then
    ok "CSS: HTTP 200 ($((CSS_SIZE / 1024))KB)"
  else
    fail "CSS: HTTP $CSS_HTTP"
  fi
else
  fail "CSS: not found in HTML"
fi

# JS chunks (sample)
JS_COUNT=0
JS_OK=0
for js in $(curl -s "${SITE}/" 2>/dev/null | grep -oP 'src="/_next/static/chunks/[^"]*\.js"' | head -3 | grep -oP '/_next/[^"]+'); do
  JS_COUNT=$((JS_COUNT + 1))
  JS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}${js}" 2>/dev/null)
  [ "$JS_HTTP" = "200" ] && JS_OK=$((JS_OK + 1))
done
[ "$JS_OK" = "$JS_COUNT" ] && [ "$JS_COUNT" -gt 0 ] && ok "JS chunks: $JS_OK/$JS_COUNT OK" || warn "JS chunks: $JS_OK/$JS_COUNT OK"

# Fonts
FONT_OK=0
FONT_TOTAL=0
for font in "/fonts/Vazirmatn-Regular.woff2" "/fonts/Vazirmatn-Bold.woff2" "/fonts/Vazirmatn-SemiBold.woff2"; do
  FONT_TOTAL=$((FONT_TOTAL + 1))
  FONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}${font}" 2>/dev/null)
  [ "$FONT_HTTP" = "200" ] && FONT_OK=$((FONT_OK + 1))
done
[ "$FONT_OK" = "$FONT_TOTAL" ] && ok "Fonts: $FONT_OK/$FONT_TOTAL OK" || fail "Fonts: $FONT_OK/$FONT_TOTAL OK"

# PDF Worker
WORKER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}/pdf.worker.min.mjs" 2>/dev/null)
[ "$WORKER_HTTP" = "200" ] && ok "PDF worker: HTTP 200" || fail "PDF worker: HTTP $WORKER_HTTP"

# Static assets
for asset in "/favicon.ico" "/robots.txt" "/sitemap.xml" "/manifest.webmanifest"; do
  A_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}${asset}" 2>/dev/null)
  [ "$A_HTTP" = "200" ] && ok "$asset: HTTP 200" || warn "$asset: HTTP $A_HTTP"
done

# 4. Security Headers
echo ""
echo "--- 3. Security Headers ---"
HEADERS=$(curl -sI "${SITE}/" 2>/dev/null)
for h in "x-frame-options" "x-content-type-options" "strict-transport-security" "content-security-policy" "permissions-policy" "referrer-policy"; do
  FOUND=$(echo "$HEADERS" | grep -i "^${h}:" | head -1)
  [ -n "$FOUND" ] && ok "$h: present" || fail "$h: MISSING"
done

# 5. SSL
echo ""
echo "--- 4. SSL Certificate ---"
SSL_EXPIRY=$(echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
  EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  [ "$DAYS_LEFT" -gt 30 ] && ok "SSL: $DAYS_LEFT days remaining" || warn "SSL: $DAYS_LEFT days remaining"
else
  fail "SSL: could not check"
fi

# HTTP → HTTPS redirect
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://persiantoolbox.ir/" 2>/dev/null)
[ "$HTTP_CODE" = "301" ] && ok "HTTP→HTTPS redirect: 301" || warn "HTTP→HTTPS redirect: HTTP $HTTP_CODE"

# 6. Key Pages
echo ""
echo "--- 5. Key Pages ---"
PAGE_FAIL=0
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio" "/pdf-tools" "/image-tools" "/text-tools" "/date-tools" "/search" "/salary" "/market"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "${SITE}${page}" 2>/dev/null)
  if [ "$CODE" = "200" ]; then
    ok "${page}: HTTP 200"
  else
    fail "${page}: HTTP $CODE"
    PAGE_FAIL=$((PAGE_FAIL + 1))
  fi
done

# 7. API Endpoints
echo ""
echo "--- 6. API Endpoints ---"
for api in "/api/health" "/api/ready" "/api/version" "/api/market" "/api/widget/tools" "/api/public/stats" "/api/data/salary-laws"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${SITE}${api}" 2>/dev/null)
  [ "$CODE" = "200" ] && ok "${api}: HTTP 200" || fail "${api}: HTTP $CODE"
done

# Newsletter validation
INVALID=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"email":"invalid"}' "${SITE}/api/newsletter/subscribe" 2>/dev/null)
[ "$INVALID" = "400" ] && ok "Newsletter: invalid email → 400" || warn "Newsletter: invalid email → HTTP $INVALID"

# 8. SEO
echo ""
echo "--- 7. SEO ---"
HTML=$(curl -s "${SITE}/" 2>/dev/null)
echo "$HTML" | grep -q '<title>' && ok "Title tag: present" || fail "Title tag: MISSING"
echo "$HTML" | grep -q 'og:title' && ok "OG title: present" || fail "OG title: MISSING"
echo "$HTML" | grep -q 'og:image' && ok "OG image: present" || fail "OG image: MISSING"
echo "$HTML" | grep -q 'lang="fa"' && ok "lang=fa: present" || fail "lang=fa: MISSING"
echo "$HTML" | grep -q 'dir="rtl"' && ok "dir=rtl: present" || fail "dir=rtl: MISSING"
echo "$HTML" | grep -q 'canonical' && ok "Canonical: present" || fail "Canonical: MISSING"
echo "$HTML" | grep -q 'json-ld\|application/ld+json' && ok "JSON-LD: present" || warn "JSON-LD: not found in SSR (may be client-rendered)"
echo "$HTML" | grep -q '<h1' && ok "H1 tag: present" || fail "H1 tag: MISSING"

# 9. Performance
echo ""
echo "--- 8. Performance ---"
START=$(date +%s%N)
curl -s -o /dev/null --connect-timeout 5 --max-time 15 "${SITE}/" 2>/dev/null
END=$(date +%s%N)
TTFB=$(( (END - START) / 1000000 ))
[ "$TTFB" -lt 1000 ] && ok "Homepage TTFB: ${TTFB}ms" || warn "Homepage TTFB: ${TTFB}ms (slow)"

HOME_SIZE=$(curl -s "${SITE}/" 2>/dev/null | wc -c)
HOME_KB=$((HOME_SIZE / 1024))
[ "$HOME_KB" -lt 300 ] && ok "Homepage size: ${HOME_KB}KB" || warn "Homepage size: ${HOME_KB}KB (large)"

# 10. PWA
echo ""
echo "--- 9. PWA ---"
echo "$HTML" | grep -q 'manifest' && ok "Manifest: linked" || warn "Manifest: not linked"
SW_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "${SITE}/sw.js" 2>/dev/null)
[ "$SW_HTTP" = "200" ] && ok "Service Worker: HTTP 200" || warn "Service Worker: HTTP $SW_HTTP"

# Summary
echo ""
echo "============================================"
echo "  RESULTS: $PASS passed, $FAIL failed, $WARN warnings"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
  echo "❌ DEPLOY VERIFICATION FAILED"
  exit 1
else
  echo "✅ DEPLOY VERIFICATION PASSED"
  exit 0
fi
