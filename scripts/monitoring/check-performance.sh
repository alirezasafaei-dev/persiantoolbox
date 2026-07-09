#!/bin/bash
# Performance Optimization Checklist Script
# Checks build output, assets, images, CSS, and JS optimization
# Exit 0: all good, Exit 1: any issues found

set -uo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

ISSUE_COUNT=0

check_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
}

check_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
}

check_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
}

human_size() {
    local bytes=$1
    if [ "$bytes" -ge 1048576 ]; then
        echo "$(( bytes / 1048576 ))MB"
    elif [ "$bytes" -ge 1024 ]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
    fi
}

# --- 1. Build Output Size (.next/) ---
echo "=========================================="
echo "Performance Optimization Checklist"
echo "=========================================="
echo ""
echo "1. Build Output Size (.next/)"
echo "------------------------------------------"

if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sb .next/ | cut -f1)
    NEXT_HUMAN=$(human_size "$NEXT_SIZE")
    NEXT_MB=$((NEXT_SIZE / 1048576))

    if [ "$NEXT_MB" -le 300 ]; then
        check_pass ".next/ size: $NEXT_HUMAN (≤300MB threshold)"
    elif [ "$NEXT_MB" -le 500 ]; then
        check_warn ".next/ size: $NEXT_HUMAN (between 300-500MB, consider pruning)"
    else
        check_fail ".next/ size: $NEXT_HUMAN (>500MB, significant bloat — run rm -rf .next && rebuild)"
    fi

    # Check standalone directory
    if [ -d ".next/standalone" ]; then
        STANDALONE_SIZE=$(du -sb .next/standalone/ | cut -f1)
        STANDALONE_HUMAN=$(human_size "$STANDALONE_SIZE")
        check_pass "Standalone output present ($STANDALONE_HUMAN)"
    else
        check_warn "Standalone output missing — required for production deploy"
    fi
else
    check_warn ".next/ directory not found — run pnpm build first"
fi

# --- 2. Static Assets Size (public/) ---
echo ""
echo "2. Static Assets Size (public/)"
echo "------------------------------------------"

if [ -d "public" ]; then
    PUBLIC_SIZE=$(du -sb public/ | cut -f1)
    PUBLIC_HUMAN=$(human_size "$PUBLIC_SIZE")
    PUBLIC_MB=$((PUBLIC_SIZE / 1048576))

    if [ "$PUBLIC_MB" -le 20 ]; then
        check_pass "public/ size: $PUBLIC_HUMAN (≤20MB threshold)"
    elif [ "$PUBLIC_MB" -le 50 ]; then
        check_warn "public/ size: $PUBLIC_HUMAN (between 20-50MB, audit large files)"
    else
        check_fail "public/ size: $PUBLIC_HUMAN (>50MB, too large — remove or compress assets)"
    fi

    # Find largest files in public/
    echo "  Top 5 largest files:"
    find public/ -type f -printf '%s %p\n' 2>/dev/null | sort -rn | head -5 | while read -r size path; do
        echo "    $(human_size "$size") — $path"
    done
else
    check_warn "public/ directory not found"
fi

# --- 3. Number of Pages Generated ---
echo ""
echo "3. Pages Generated"
echo "------------------------------------------"

if [ -f ".next/prerender-manifest.json" ]; then
    PAGE_COUNT=$(grep -c '"srcRoute"' .next/prerender-manifest.json 2>/dev/null || true)
    PAGE_COUNT=${PAGE_COUNT:-0}

    if [ "$PAGE_COUNT" -ge 50 ]; then
        check_pass "Generated pages: $PAGE_COUNT (good coverage)"
    elif [ "$PAGE_COUNT" -ge 20 ]; then
        check_warn "Generated pages: $PAGE_COUNT (consider more pre-rendered routes for SEO)"
    else
        check_fail "Generated pages: $PAGE_COUNT (too few pre-rendered pages)"
    fi
else
    check_warn "prerender-manifest.json not found — run pnpm build first"
fi

# Check build manifest for page routes
if [ -f ".next/build-manifest.json" ]; then
    ROUTE_COUNT=$(grep -o '"/' .next/build-manifest.json 2>/dev/null | wc -l || true)
    check_pass "Build manifest present with $ROUTE_COUNT route entries"
fi

# --- 4. Image Optimization (WebP/AVIF) ---
echo ""
echo "4. Image Optimization (WebP/AVIF)"
echo "------------------------------------------"

if [ -d ".next/static" ]; then
    WEBP_COUNT=$(find .next/static/ -name "*.webp" 2>/dev/null | wc -l)
    WEBP_COUNT=${WEBP_COUNT:-0}
    AVIF_COUNT=$(find .next/static/ -name "*.avif" 2>/dev/null | wc -l)
    AVIF_COUNT=${AVIF_COUNT:-0}
    PNG_COUNT=$(find .next/static/ -name "*.png" 2>/dev/null | wc -l)
    PNG_COUNT=${PNG_COUNT:-0}
    JPG_COUNT=$(find .next/static/ -name "*.jpg" 2>/dev/null | wc -l)
    JPG_COUNT=${JPG_COUNT:-0}
    GIF_COUNT=$(find .next/static/ -name "*.gif" 2>/dev/null | wc -l)
    GIF_COUNT=${GIF_COUNT:-0}

    TOTAL_STATIC_IMG=$((WEBP_COUNT + AVIF_COUNT + PNG_COUNT + JPG_COUNT + GIF_COUNT))

    if [ "$TOTAL_STATIC_IMG" -eq 0 ]; then
        check_pass "No static images in .next/static/ (likely server-rendered or external)"
    else
        OPTIMIZED=$((WEBP_COUNT + AVIF_COUNT))
        OPT_PERCENT=$((OPTIMIZED * 100 / TOTAL_STATIC_IMG))

        if [ "$OPT_PERCENT" -ge 80 ]; then
            check_pass "Image optimization: $OPTIMIZED/$TOTAL_STATIC_IMG ($OPT_PERCENT%) WebP/AVIF"
        elif [ "$OPT_PERCENT" -ge 50 ]; then
            check_warn "Image optimization: $OPTIMIZED/$TOTAL_STATIC_IMG ($OPT_PERCENT%) WebP/AVIF — ${PNG_COUNT} PNG, ${JPG_COUNT} JPG, ${GIF_COUNT} GIF unoptimized"
        else
            check_fail "Image optimization: $OPTIMIZED/$TOTAL_STATIC_IMG ($OPT_PERCENT%) WebP/AVIF — convert PNG/JPG/GIF to modern formats"
        fi
    fi
else
    check_warn ".next/static/ not found — run pnpm build first"
fi

# Check if next.config has image optimization configured
if [ -f "next.config.ts" ] || [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    CONFIG_FILE=$(ls next.config.ts next.config.js next.config.mjs 2>/dev/null | head -1)
    if grep -q 'images' "$CONFIG_FILE" 2>/dev/null; then
        check_pass "Image optimization configured in $CONFIG_FILE"
    else
        check_warn "No images config in $CONFIG_FILE — consider adding formats: ['image/avif', 'image/webp']"
    fi
fi

# --- 5. CSS Purging (Tailwind) ---
echo ""
echo "5. CSS Purging (Tailwind)"
echo "------------------------------------------"

if [ -d ".next/static" ]; then
    CSS_FILES=$(find .next/static/ -name "*.css" 2>/dev/null | wc -l)
    CSS_FILES=${CSS_FILES:-0}
    TOTAL_CSS_SIZE=0
    while IFS= read -r f; do
        s=$(stat -c%s "$f" 2>/dev/null || echo 0)
        TOTAL_CSS_SIZE=$((TOTAL_CSS_SIZE + s))
    done < <(find .next/static/ -name "*.css" 2>/dev/null)
    CSS_HUMAN=$(human_size "$TOTAL_CSS_SIZE")

    if [ "$CSS_FILES" -eq 0 ]; then
        check_warn "No CSS files found in .next/static/"
    else
        CSS_KB=$((TOTAL_CSS_SIZE / 1024))
        if [ "$CSS_KB" -le 100 ]; then
            check_pass "CSS size: $CSS_HUMAN across $CSS_FILES file(s) — well purged"
        elif [ "$CSS_KB" -le 300 ]; then
            check_warn "CSS size: $CSS_HUMAN across $CSS_FILES file(s) — review Tailwind purge config"
        else
            check_fail "CSS size: $CSS_HUMAN across $CSS_FILES file(s) — CSS not purged, check tailwind.config content paths"
        fi
    fi
else
    check_warn ".next/static/ not found — run pnpm build first"
fi

# Verify tailwind.config has content paths
if [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.js" ]; then
    TAILWIND_CONFIG=$(ls tailwind.config.ts tailwind.config.js 2>/dev/null | head -1)
    if grep -q 'content' "$TAILWIND_CONFIG" 2>/dev/null; then
        check_pass "Tailwind content paths configured in $TAILWIND_CONFIG"
    else
        check_fail "No content paths in $TAILWIND_CONFIG — Tailwind classes won't be purged"
    fi
fi

# --- 6. JS Code Splitting ---
echo ""
echo "6. JavaScript Code Splitting"
echo "------------------------------------------"

if [ -d ".next/static/chunks" ]; then
    CHUNK_COUNT=$(find .next/static/chunks/ -name "*.js" 2>/dev/null | wc -l)
    CHUNK_COUNT=${CHUNK_COUNT:-0}
    TOTAL_JS_SIZE=0
    while IFS= read -r f; do
        s=$(stat -c%s "$f" 2>/dev/null || echo 0)
        TOTAL_JS_SIZE=$((TOTAL_JS_SIZE + s))
    done < <(find .next/static/chunks/ -name "*.js" 2>/dev/null)
    JS_HUMAN=$(human_size "$TOTAL_JS_SIZE")

    if [ "$CHUNK_COUNT" -eq 0 ]; then
        check_warn "No JS chunks found in .next/static/chunks/"
    else
        # Check for code splitting — multiple chunks means splitting is working
        if [ "$CHUNK_COUNT" -ge 10 ]; then
            check_pass "JS code splitting: $CHUNK_COUNT chunks ($JS_HUMAN) — good chunk granularity"
        elif [ "$CHUNK_COUNT" -ge 5 ]; then
            check_warn "JS code splitting: $CHUNK_COUNT chunks ($JS_HUMAN) — consider dynamic imports for route splitting"
        else
            check_fail "JS code splitting: $CHUNK_COUNT chunks ($JS_HUMAN) — insufficient splitting, use next/dynamic"
        fi

        # Check for large individual chunks
        LARGE_CHUNKS=$(find .next/static/chunks/ -name "*.js" -size +200k 2>/dev/null | wc -l)
        LARGE_CHUNKS=${LARGE_CHUNKS:-0}
        if [ "$LARGE_CHUNKS" -eq 0 ]; then
            check_pass "No chunks >200KB"
        else
            check_warn "$LARGE_CHUNKS chunk(s) exceed 200KB — consider lazy loading or splitting"
            find .next/static/chunks/ -name "*.js" -size +200k -printf '  %s %p\n' 2>/dev/null | sort -rn | head -3 | while read -r size path; do
                echo "    $(human_size "$size") — $path"
            done
        fi
    fi

    # Check for shared chunks (vendor splitting)
    VENDOR_COUNT=0
    while IFS= read -r f; do
        if grep -q "node_modules" "$f" 2>/dev/null; then
            VENDOR_COUNT=$((VENDOR_COUNT + 1))
        fi
    done < <(find .next/static/chunks/ -name "*.js" 2>/dev/null)
    if [ "$VENDOR_COUNT" -gt 0 ]; then
        check_pass "Vendor chunks detected ($VENDOR_COUNT) — node_modules properly split"
    fi
else
    check_warn ".next/static/chunks/ not found — run pnpm build first"
fi

# --- 7. Report Summary ---
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ "$ISSUE_COUNT" -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Build is well-optimized.${NC}"
    echo "Issues found: 0"
    exit 0
else
    echo -e "${RED}$ISSUE_COUNT issue(s) found. Review recommendations above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Large .next/ → rm -rf .next && pnpm build"
    echo "  • Large public/ → audit and remove unused assets"
    echo "  • Unoptimized images → use next/image with format='webp'"
    echo "  • Large CSS → verify tailwind.config content paths"
    echo "  • Few JS chunks → use next/dynamic for code splitting"
    exit 1
fi
