#!/usr/bin/env bash
# post-deploy-verify.sh — Run after every deployment to catch static asset issues
# Exit 0: all checks pass | Exit 1: critical issues found
set -euo pipefail

SITE_URL="${1:-https://persiantoolbox.ir}"
ERRORS=0

echo "=== Post-Deploy Verification ==="
echo "URL: $SITE_URL"
echo ""

# 1. Check homepage loads
echo "1. Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$SITE_URL/" 2>/dev/null)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ Homepage: $STATUS"
else
  echo "   ❌ Homepage: $STATUS"
  ERRORS=$((ERRORS + 1))
fi

# 2. Check CSS file loads
echo "2. CSS assets..."
CSS_URL=$(curl -s --max-time 10 "$SITE_URL/" 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_URL" ]; then
  CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL$CSS_URL" 2>/dev/null)
  if [ "$CSS_STATUS" = "200" ]; then
    echo "   ✅ CSS: $CSS_STATUS ($CSS_URL)"
  else
    echo "   ❌ CSS: $CSS_STATUS ($CSS_URL)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "   ❌ CSS: No CSS link found in HTML"
  ERRORS=$((ERRORS + 1))
fi

# 3. Check JS chunks load
echo "3. JS chunks..."
JS_URLS=$(curl -s --max-time 10 "$SITE_URL/" 2>/dev/null | grep -oP 'src="/_next/static/chunks/[^"]*\.js"' | head -5 | grep -oP '/_next/[^"]+')
JS_OK=0
JS_FAIL=0
for url in $JS_URLS; do
  JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL$url" 2>/dev/null)
  if [ "$JS_STATUS" = "200" ]; then
    JS_OK=$((JS_OK + 1))
  else
    JS_FAIL=$((JS_FAIL + 1))
    echo "   ❌ JS: $JS_STATUS ($url)"
  fi
done
if [ "$JS_FAIL" -eq 0 ] && [ "$JS_OK" -gt 0 ]; then
  echo "   ✅ JS chunks: $JS_OK/$JS_OK loaded"
else
  echo "   ❌ JS chunks: $JS_FAIL failed"
  ERRORS=$((ERRORS + 1))
fi

# 4. Check API health
echo "4. API health..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL/api/ready" 2>/dev/null)
if [ "$API_STATUS" = "200" ]; then
  echo "   ✅ API: $API_STATUS"
else
  echo "   ❌ API: $API_STATUS"
  ERRORS=$((ERRORS + 1))
fi

# 5. Check fonts
echo "5. Fonts..."
FONT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL/fonts/Vazirmatn-Bold.woff2" 2>/dev/null)
if [ "$FONT_STATUS" = "200" ]; then
  echo "   ✅ Fonts: $FONT_STATUS"
else
  echo "   ❌ Fonts: $FONT_STATUS"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Results ==="
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ All checks passed"
  exit 0
else
  echo "❌ $ERRORS check(s) failed"
  exit 1
fi
