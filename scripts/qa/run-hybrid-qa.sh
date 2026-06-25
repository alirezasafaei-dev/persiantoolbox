#!/bin/bash
# run-hybrid-qa.sh — Runs both TypeScript and Python QA tests
# Usage: bash scripts/qa/run-hybrid-qa.sh [--local]
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "============================================"
echo "🔍 PersianToolbox Hybrid QA Pipeline"
echo "============================================"

# Parse args
LOCAL_FLAG=""
if [ "$1" = "--local" ]; then
  LOCAL_FLAG="QA_LOCAL=1"
  echo "   Mode: LOCAL (http://localhost:3100)"
else
  echo "   Mode: PRODUCTION (https://persiantoolbox.ir)"
fi

FAILED=0

# Step 1: TypeScript tests
echo ""
echo "━━━ Step 1: TypeScript Playwright Tests ━━━"
if cd "$PROJECT_ROOT" && npx playwright test --project=chromium --reporter=list 2>&1; then
  echo "✅ TypeScript tests passed"
else
  echo "❌ TypeScript tests FAILED"
  FAILED=1
fi

# Step 2: Python hybrid QA
echo ""
echo "━━━ Step 2: Python Hybrid QA ━━━"
cd "$SCRIPT_DIR"
if $LOCAL_FLAG uv run python hybrid_manager.py 2>&1; then
  echo "✅ Python QA passed"
else
  echo "❌ Python QA FAILED"
  FAILED=1
fi

# Step 3: CSS verification (critical)
echo ""
echo "━━━ Step 3: CSS Verification ━━━"
if [ -n "$LOCAL_FLAG" ]; then
  TARGET="http://localhost:3100"
else
  TARGET="https://persiantoolbox.ir"
fi

CSS_FILE=$(curl -s "$TARGET/" | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET$CSS_FILE")
  if [ "$CSS_HTTP" = "200" ]; then
    echo "✅ CSS served correctly (HTTP $CSS_HTTP)"
  else
    echo "❌ CSS returns HTTP $CSS_HTTP — site will load WITHOUT STYLES!"
    FAILED=1
  fi
else
  echo "❌ No CSS file found in HTML!"
  FAILED=1
fi

# Final summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
  echo "✅ ALL QA CHECKS PASSED"
  exit 0
else
  echo "❌ SOME QA CHECKS FAILED"
  exit 1
fi
