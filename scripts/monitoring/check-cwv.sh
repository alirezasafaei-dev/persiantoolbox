#!/bin/bash
# Core Web Vitals (CWV) Monitoring Script
# Checks page performance metrics for persiantoolbox.ir
# Exit 0: all metrics good, Exit 1: any POOR metric

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="${SITE_URL:-https://persiantoolbox.ir}"
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Counters for exit code
POOR_COUNT=0

# Print with severity color
print_result() {
    local severity="$1"
    local metric="$2"
    local value="$3"
    local detail="$4"
    
    case "$severity" in
        GOOD)
            echo -e "${GREEN}✓ GOOD${NC}: $metric = $value"
            ;;
        NEEDS_IMPROVEMENT)
            echo -e "${YELLOW}⚠ NEEDS_IMPROVEMENT${NC}: $metric = $value"
            ;;
        POOR)
            echo -e "${RED}✗ POOR${NC}: $metric = $value"
            POOR_COUNT=$((POOR_COUNT + 1))
            ;;
    esac
    [[ -n "$detail" ]] && echo "  → $detail"
}

# Fetch homepage HTML
echo "=========================================="
echo "Core Web Vitals Check: $SITE_URL"
echo "=========================================="
echo ""

curl -sL --max-time 30 -o "$TEMP_FILE" "$SITE_URL" || {
    echo -e "${RED}ERROR: Failed to fetch $SITE_URL${NC}"
    exit 1
}

# Check if file has content
if [ ! -s "$TEMP_FILE" ]; then
    echo -e "${RED}ERROR: Empty response from $SITE_URL${NC}"
    exit 1
fi

# Get file size in bytes
FILE_SIZE=$(wc -c < "$TEMP_FILE" | tr -d ' ')
echo "Page Size Check:"
echo "------------------------------------------"

# Page size thresholds (in KB)
SIZE_KB=$((FILE_SIZE / 1024))
if [ "$SIZE_KB" -le 100 ]; then
    print_result "GOOD" "HTML Size" "${SIZE_KB}KB" "Under 100KB threshold"
elif [ "$SIZE_KB" -le 200 ]; then
    print_result "NEEDS_IMPROVEMENT" "HTML Size" "${SIZE_KB}KB" "Between 100-200KB, consider optimization"
else
    print_result "POOR" "HTML Size" "${SIZE_KB}KB" "Over 200KB, significant optimization needed"
fi

echo ""
echo "Render-Blocking Resources:"
echo "------------------------------------------"

# Count CSS links in head
CSS_COUNT=$(grep -c 'rel="stylesheet"' "$TEMP_FILE" 2>/dev/null || true)
CSS_COUNT=${CSS_COUNT:-0}
if [ "$CSS_COUNT" -le 3 ]; then
    print_result "GOOD" "Stylesheets" "$CSS_COUNT" "Minimal render-blocking CSS"
elif [ "$CSS_COUNT" -le 5 ]; then
    print_result "NEEDS_IMPROVEMENT" "Stylesheets" "$CSS_COUNT" "Consider inlining or bundling"
else
    print_result "POOR" "Stylesheets" "$CSS_COUNT" "Too many render-blocking stylesheets"
fi

# Count script tags in head
# Extract head section first
HEAD_CONTENT=$(sed -n '/<head/,/<\/head>/p' "$TEMP_FILE")
SCRIPT_IN_HEAD=$(echo "$HEAD_CONTENT" | grep -c '<script' 2>/dev/null || true)
SCRIPT_IN_HEAD=${SCRIPT_IN_HEAD:-0}

# Subtract scripts with async, defer, or type="application/ld+json"
ASYNC_DEFER=$(echo "$HEAD_CONTENT" | grep -c 'async\|defer\|application/ld+json' 2>/dev/null || true)
ASYNC_DEFER=${ASYNC_DEFER:-0}

SCRIPT_IN_HEAD=$((SCRIPT_IN_HEAD - ASYNC_DEFER))

if [ "$SCRIPT_IN_HEAD" -le 2 ]; then
    print_result "GOOD" "Scripts in Head" "$SCRIPT_IN_HEAD" "Minimal render-blocking scripts"
elif [ "$SCRIPT_IN_HEAD" -le 4 ]; then
    print_result "NEEDS_IMPROVEMENT" "Scripts in Head" "$SCRIPT_IN_HEAD" "Consider async/defer attributes"
else
    print_result "POOR" "Scripts in Head" "$SCRIPT_IN_HEAD" "Too many blocking scripts, add async/defer"
fi

echo ""
echo "Image Optimization:"
echo "------------------------------------------"

# Count total images
TOTAL_IMAGES=$(grep -c '<img' "$TEMP_FILE" 2>/dev/null || true)
TOTAL_IMAGES=${TOTAL_IMAGES:-0}

# Count images with alt attribute
IMAGES_WITH_ALT=$(grep -c 'alt="[^"]*"' "$TEMP_FILE" 2>/dev/null || true)
IMAGES_WITH_ALT=${IMAGES_WITH_ALT:-0}

# Count images with lazy loading
IMAGES_WITH_LAZY=$(grep -c 'loading="lazy"' "$TEMP_FILE" 2>/dev/null || true)
IMAGES_WITH_LAZY=${IMAGES_WITH_LAZY:-0}

if [ "$TOTAL_IMAGES" -eq 0 ]; then
    print_result "GOOD" "Images" "0" "No images to check"
else
    # Check alt attributes
    ALT_PERCENTAGE=$((IMAGES_WITH_ALT * 100 / TOTAL_IMAGES))
    if [ "$ALT_PERCENTAGE" -ge 90 ]; then
        print_result "GOOD" "Alt Attributes" "$IMAGES_WITH_ALT/$TOTAL_IMAGES ($ALT_PERCENTAGE%)" "Good accessibility"
    elif [ "$ALT_PERCENTAGE" -ge 70 ]; then
        print_result "NEEDS_IMPROVEMENT" "Alt Attributes" "$IMAGES_WITH_ALT/$TOTAL_IMAGES ($ALT_PERCENTAGE%)" "Some images missing alt text"
    else
        print_result "POOR" "Alt Attributes" "$IMAGES_WITH_ALT/$TOTAL_IMAGES ($ALT_PERCENTAGE%)" "Many images missing alt text"
    fi
    
    # Check lazy loading (for below-the-fold images)
    if [ "$TOTAL_IMAGES" -le 3 ]; then
        print_result "GOOD" "Lazy Loading" "N/A" "Few images, lazy loading optional"
    elif [ "$IMAGES_WITH_LAZY" -ge $((TOTAL_IMAGES * 70 / 100)) ]; then
        print_result "GOOD" "Lazy Loading" "$IMAGES_WITH_LAZY/$TOTAL_IMAGES" "Good lazy loading coverage"
    elif [ "$IMAGES_WITH_LAZY" -ge $((TOTAL_IMAGES * 50 / 100)) ]; then
        print_result "NEEDS_IMPROVEMENT" "Lazy Loading" "$IMAGES_WITH_LAZY/$TOTAL_IMAGES" "Consider adding loading='lazy' to more images"
    else
        print_result "POOR" "Lazy Loading" "$IMAGES_WITH_LAZY/$TOTAL_IMAGES" "Missing lazy loading on most images"
    fi
fi

echo ""
echo "Font Loading Strategy:"
echo "------------------------------------------"

# Check for font-display in inline styles or linked CSS
FONT_DISPLAY_SWAP=$(grep -c 'font-display:\s*swap' "$TEMP_FILE" 2>/dev/null || true)
FONT_DISPLAY_SWAP=${FONT_DISPLAY_SWAP:-0}

FONT_DISPLAY_OTHER=$(grep -c 'font-display:\s*\(block\|swap\|fallback\|auto\)' "$TEMP_FILE" 2>/dev/null || true)
FONT_DISPLAY_OTHER=${FONT_DISPLAY_OTHER:-0}

# Check for Google Fonts or font preloading
GOOGLE_FONTS=$(grep -c 'fonts\.googleapis\.com' "$TEMP_FILE" 2>/dev/null || true)
GOOGLE_FONTS=${GOOGLE_FONTS:-0}

FONT_PRELOAD=$(grep -c 'rel="preload"[^>]*font' "$TEMP_FILE" 2>/dev/null || true)
FONT_PRELOAD=${FONT_PRELOAD:-0}

# Check if there are any font-face declarations in inline styles
FONT_FACE_INLINE=$(grep -c '@font-face' "$TEMP_FILE" 2>/dev/null || true)
FONT_FACE_INLINE=${FONT_FACE_INLINE:-0}

if [ "$GOOGLE_FONTS" -gt 0 ]; then
    if [ "$FONT_DISPLAY_SWAP" -gt 0 ]; then
        print_result "GOOD" "Font Loading" "Google Fonts with font-display:swap" "Optimal font loading strategy"
    else
        print_result "NEEDS_IMPROVEMENT" "Font Loading" "Google Fonts without font-display:swap" "Add font-display:swap parameter"
    fi
elif [ "$FONT_FACE_INLINE" -gt 0 ]; then
    if [ "$FONT_DISPLAY_SWAP" -gt 0 ]; then
        print_result "GOOD" "Font Loading" "Custom fonts with font-display:swap" "Optimal font loading strategy"
    elif [ "$FONT_DISPLAY_OTHER" -gt 0 ]; then
        print_result "NEEDS_IMPROVEMENT" "Font Loading" "Custom fonts without font-display:swap" "Consider using font-display:swap"
    else
        print_result "POOR" "Font Loading" "Custom fonts without font-display" "Add font-display:swap for better UX"
    fi
elif [ "$FONT_PRELOAD" -gt 0 ]; then
    print_result "GOOD" "Font Loading" "Fonts preloaded" "Good font loading optimization"
else
    print_result "GOOD" "Font Loading" "No custom fonts detected" "Using system fonts"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ "$POOR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}All metrics passed! Site is well-optimized.${NC}"
    echo "Total poor metrics: 0"
    exit 0
else
    echo -e "${RED}$POOR_COUNT metric(s) need attention.${NC}"
    echo "Review the issues above and optimize accordingly."
    exit 1
fi
