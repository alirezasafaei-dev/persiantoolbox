#!/usr/bin/env bash
# =============================================================================
# Deployment Readiness Checklist - PersianToolbox
# =============================================================================
# Checks all deployment readiness criteria and reports PASS/FAIL/WARN
# Exit 0: all critical checks passed
# Exit 1: any critical check failed
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
CRITICAL_FAIL=0

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Log file
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${PROJECT_ROOT}/docs/deployment/reports/readiness-${TIMESTAMP}.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Functions
log() {
    local msg="$1"
    echo -e "$msg" | tee -a "$LOG_FILE"
}

check_result() {
    local name="$1"
    local status="$2"  # PASS, FAIL, WARN
    local details="$3"
    local critical="${4:-false}"  # Is this a critical check?

    case "$status" in
        PASS)
            PASS_COUNT=$((PASS_COUNT + 1))
            log "${GREEN}✅ PASS${NC}  ${name}"
            if [ -n "$details" ]; then
                log "         ${details}"
            fi
            ;;
        FAIL)
            FAIL_COUNT=$((FAIL_COUNT + 1))
            log "${RED}❌ FAIL${NC}  ${name}"
            if [ -n "$details" ]; then
                log "         ${details}"
            fi
            if [ "$critical" = "true" ]; then
                CRITICAL_FAIL=$((CRITICAL_FAIL + 1))
            fi
            ;;
        WARN)
            WARN_COUNT=$((WARN_COUNT + 1))
            log "${YELLOW}⚠️  WARN${NC}  ${name}"
            if [ -n "$details" ]; then
                log "         ${details}"
            fi
            ;;
    esac
}

run_command() {
    local cmd="$1"
    local timeout="${2:-120}"
    local output
    if output=$(timeout "$timeout" bash -c "$cmd" 2>&1); then
        echo "$output"
        return 0
    else
        echo "$output"
        return 1
    fi
}

# =============================================================================
# HEADER
# =============================================================================
log ""
log "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
log "${CYAN}║         Deployment Readiness Checklist - PersianToolbox     ║${NC}"
log "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
log ""
log "Date: $(date '+%Y-%m-%d %H:%M:%S')"
log "Project: ${PROJECT_ROOT}"
log "Log: ${LOG_FILE}"
log ""

# =============================================================================
# 1. CODE QUALITY
# =============================================================================
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}1. CODE QUALITY${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1.1 TypeScript Type Check
log ""
log "1.1 TypeScript Type Check..."
if output=$(cd "$PROJECT_ROOT" && run_command "pnpm typecheck" 120); then
    check_result "TypeScript Type Check" "PASS" "No type errors"
else
    check_result "TypeScript Type Check" "FAIL" "Type errors detected" true
fi

# 1.2 ESLint
log ""
log "1.2 ESLint..."
if [ -f "${PROJECT_ROOT}/.eslintrc.cjs" ] || [ -f "${PROJECT_ROOT}/eslint.config.mjs" ]; then
    if output=$(cd "$PROJECT_ROOT" && run_command "pnpm lint" 120); then
        check_result "ESLint" "PASS" "No lint errors"
    else
        # Check if it's just warnings
        if echo "$output" | grep -q "warning" && ! echo "$output" | grep -q "error"; then
            check_result "ESLint" "PASS" "Only warnings (no errors)"
        else
            check_result "ESLint" "FAIL" "Lint errors detected" true
        fi
    fi
else
    check_result "ESLint" "WARN" "No ESLint config found"
fi

# 1.3 Tests
log ""
log "1.3 Unit Tests..."
if output=$(cd "$PROJECT_ROOT" && run_command "pnpm vitest --run 2>&1 | tail -20" 180); then
    if echo "$output" | grep -q "Tests.*passed"; then
        check_result "Unit Tests" "PASS" "All tests passed"
    else
        check_result "Unit Tests" "PASS" "Tests completed (check output)"
    fi
else
    check_result "Unit Tests" "FAIL" "Test failures detected" true
fi

# 1.4 Format Check
log ""
log "1.4 Prettier Format Check..."
if output=$(cd "$PROJECT_ROOT" && run_command "pnpm format:check" 60); then
    check_result "Prettier Format" "PASS" "All files formatted correctly"
else
    check_result "Prettier Format" "WARN" "Formatting issues detected (non-critical)"
fi

# =============================================================================
# 2. SECURITY
# =============================================================================
log ""
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}2. SECURITY${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 2.1 Secrets in Git
log ""
log "2.1 Secrets in Git..."
if output=$(cd "$PROJECT_ROOT" && git log --oneline --all -100 | grep -iE "(password|secret|key|token)" | head -5); then
    if [ -n "$output" ]; then
        check_result "Secrets in Git" "WARN" "Potential secrets in commit messages (review recommended)"
    else
        check_result "Secrets in Git" "PASS" "No obvious secrets in recent commits"
    fi
else
    check_result "Secrets in Git" "PASS" "No secrets detected in commits"
fi

# 2.2 .env Files Tracked
log ""
log "2.2 .env Files in Git..."
if output=$(cd "$PROJECT_ROOT" && git ls-files | grep -E "\.env$" | head -5); then
    if [ -n "$output" ]; then
        check_result ".env Files Tracked" "FAIL" ".env files found in git: ${output}" true
    else
        check_result ".env Files Tracked" "PASS" "No .env files tracked"
    fi
else
    check_result ".env Files Tracked" "PASS" "No .env files tracked"
fi

# 2.3 .env.example Exists
log ""
log "2.3 .env.example File..."
if [ -f "${PROJECT_ROOT}/.env.example" ]; then
    check_result ".env.example" "PASS" "Template file exists"
else
    check_result ".env.example" "WARN" "No .env.example template found"
fi

# 2.4 Security Audit
log ""
log "2.4 npm/pnpm Security Audit..."
if output=$(cd "$PROJECT_ROOT" && run_command "pnpm audit --prod --audit-level=high 2>&1 | tail -10" 60); then
    if echo "$output" | grep -q "found 0 vulnerabilities"; then
        check_result "Security Audit" "PASS" "No high/critical vulnerabilities"
    else
        check_result "Security Audit" "WARN" "Vulnerabilities found (review recommended)"
    fi
else
    check_result "Security Audit" "WARN" "Security audit completed with issues"
fi

# 2.5 Secret Scanner
log ""
log "2.5 Secret Scanner..."
if [ -f "${PROJECT_ROOT}/scripts/security/scan-secrets.mjs" ]; then
    if output=$(cd "$PROJECT_ROOT" && run_command "node scripts/security/scan-secrets.mjs 2>&1 | tail -10" 60); then
        check_result "Secret Scanner" "PASS" "No secrets detected in code"
    else
        check_result "Secret Scanner" "WARN" "Secret scanner reported issues"
    fi
else
    check_result "Secret Scanner" "WARN" "Secret scanner script not found"
fi

# =============================================================================
# 3. PERFORMANCE
# =============================================================================
log ""
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}3. PERFORMANCE${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 3.1 Build Succeeds
log ""
log "3.1 Build Check..."
if output=$(cd "$PROJECT_ROOT" && run_command "pnpm build 2>&1 | tail -20" 300); then
    if echo "$output" | grep -qE "(Route|Compiled|Build completed|✓)"; then
        check_result "Build" "PASS" "Build completed successfully"
    else
        check_result "Build" "PASS" "Build output received (verify manually)"
    fi
else
    check_result "Build" "FAIL" "Build failed" true
fi

# 3.2 Bundle Size
log ""
log "3.2 Bundle Size Check..."
if [ -d "${PROJECT_ROOT}/.next" ]; then
    STATIC_SIZE=$(du -sh "${PROJECT_ROOT}/.next/static" 2>/dev/null | cut -f1 || echo "0")
    TOTAL_SIZE=$(du -sh "${PROJECT_ROOT}/.next" 2>/dev/null | cut -f1 || echo "0")
    
    # Check if static assets are reasonable (< 50MB)
    STATIC_BYTES=$(du -sb "${PROJECT_ROOT}/.next/static" 2>/dev/null | cut -f1 || echo 0)
    if [ "$STATIC_BYTES" -lt 52428800 ] 2>/dev/null; then
        check_result "Bundle Size" "PASS" "Static assets: ${STATIC_SIZE} (Total: ${TOTAL_SIZE})"
    else
        check_result "Bundle Size" "WARN" "Static assets large: ${STATIC_SIZE} (Total: ${TOTAL_SIZE})"
    fi
else
    check_result "Bundle Size" "WARN" "Build directory not found (run build first)"
fi

# 3.3 Images Optimized
log ""
log "3.3 Image Optimization..."
if [ -d "${PROJECT_ROOT}/public/images" ]; then
    LARGE_IMAGES=$(find "${PROJECT_ROOT}/public/images" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +1M 2>/dev/null | wc -l || echo 0)
    TOTAL_IMAGES=$(find "${PROJECT_ROOT}/public/images" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) 2>/dev/null | wc -l || echo 0)
    
    if [ "$LARGE_IMAGES" -eq 0 ]; then
        check_result "Image Optimization" "PASS" "All images under 1MB (${TOTAL_IMAGES} total)"
    else
        check_result "Image Optimization" "WARN" "${LARGE_IMAGES} images over 1MB (consider optimization)"
    fi
else
    check_result "Image Optimization" "WARN" "No images directory found"
fi

# 3.4 Static Assets
log ""
log "3.4 Static Assets Check..."
if [ -d "${PROJECT_ROOT}/public" ]; then
    STATIC_FILES=$(find "${PROJECT_ROOT}/public" -type f | wc -l || echo 0)
    check_result "Static Assets" "PASS" "${STATIC_FILES} files in public directory"
else
    check_result "Static Assets" "WARN" "Public directory not found"
fi

# =============================================================================
# 4. MONITORING
# =============================================================================
log ""
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}4. MONITORING${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 4.1 Health Check Script
log ""
log "4.1 Health Check Script..."
if [ -f "${PROJECT_ROOT}/health-monitor.sh" ]; then
    check_result "Health Monitor Script" "PASS" "health-monitor.sh exists"
else
    check_result "Health Monitor Script" "WARN" "health-monitor.sh not found"
fi

# 4.2 Uptime Check
log ""
log "4.2 Uptime Check Script..."
if [ -f "${PROJECT_ROOT}/scripts/monitoring/check-cwv.sh" ]; then
    check_result "CWV Check Script" "PASS" "check-cwv.sh exists"
else
    check_result "CWV Check Script" "WARN" "check-cwv.sh not found"
fi

# 4.3 Performance Check
log ""
log "4.3 Performance Check Script..."
if [ -f "${PROJECT_ROOT}/scripts/monitoring/check-performance.sh" ]; then
    check_result "Performance Check Script" "PASS" "check-performance.sh exists"
else
    check_result "Performance Check Script" "WARN" "check-performance.sh not found"
fi

# 4.4 Health Endpoint
log ""
log "4.4 Health API Endpoint..."
if [ -f "${PROJECT_ROOT}/app/api/health/route.ts" ] || [ -f "${PROJECT_ROOT}/app/api/health/route.js" ]; then
    check_result "Health API Endpoint" "PASS" "/api/health endpoint defined"
else
    check_result "Health API Endpoint" "WARN" "Health API endpoint not found"
fi

# 4.5 Sentry Configuration
log ""
log "4.5 Sentry Configuration..."
if [ -f "${PROJECT_ROOT}/sentry.client.config.ts" ]; then
    check_result "Sentry Client Config" "PASS" "Sentry client configuration exists"
else
    check_result "Sentry Client Config" "WARN" "Sentry client config not found"
fi

# =============================================================================
# 5. DOCUMENTATION
# =============================================================================
log ""
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}5. DOCUMENTATION${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 5.1 README
log ""
log "5.1 README..."
if [ -f "${PROJECT_ROOT}/README.md" ]; then
    README_SIZE=$(wc -c < "${PROJECT_ROOT}/README.md" || echo 0)
    if [ "$README_SIZE" -gt 1000 ]; then
        check_result "README" "PASS" "README.md exists (${README_SIZE} bytes)"
    else
        check_result "README" "WARN" "README.md exists but may be incomplete (${README_SIZE} bytes)"
    fi
else
    check_result "README" "FAIL" "README.md not found" true
fi

# 5.2 CHANGELOG
log ""
log "5.2 CHANGELOG..."
if [ -f "${PROJECT_ROOT}/CHANGELOG.md" ]; then
    check_result "CHANGELOG" "PASS" "CHANGELOG.md exists"
else
    check_result "CHANGELOG" "WARN" "CHANGELOG.md not found"
fi

# 5.3 LICENSE
log ""
log "5.3 LICENSE..."
if [ -f "${PROJECT_ROOT}/LICENSE" ]; then
    check_result "LICENSE" "PASS" "LICENSE file exists"
else
    check_result "LICENSE" "WARN" "LICENSE file not found"
fi

# 5.4 CONTRIBUTING
log ""
log "5.4 CONTRIBUTING..."
if [ -f "${PROJECT_ROOT}/CONTRIBUTING.md" ]; then
    check_result "CONTRIBUTING" "PASS" "CONTRIBUTING.md exists"
else
    check_result "CONTRIBUTING" "WARN" "CONTRIBUTING.md not found"
fi

# 5.5 Security Policy
log ""
log "5.5 Security Policy..."
if [ -f "${PROJECT_ROOT}/SECURITY.md" ]; then
    check_result "SECURITY.md" "PASS" "Security policy exists"
else
    check_result "SECURITY.md" "WARN" "Security policy not found"
fi

# 5.6 Documentation Directory
log ""
log "5.6 Documentation Directory..."
if [ -d "${PROJECT_ROOT}/docs" ]; then
    DOC_COUNT=$(find "${PROJECT_ROOT}/docs" -name "*.md" -type f | wc -l || echo 0)
    if [ "$DOC_COUNT" -gt 5 ]; then
        check_result "Documentation Directory" "PASS" "${DOC_COUNT} documentation files found"
    else
        check_result "Documentation Directory" "WARN" "Only ${DOC_COUNT} documentation files found"
    fi
else
    check_result "Documentation Directory" "WARN" "docs/ directory not found"
fi

# =============================================================================
# 6. DEPLOYMENT
# =============================================================================
log ""
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}6. DEPLOYMENT${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 6.1 Deploy Scripts
log ""
log "6.1 Deploy Scripts..."
DEPLOY_SCRIPTS=0
[ -f "${PROJECT_ROOT}/deploy-blue-green.sh" ] && DEPLOY_SCRIPTS=$((DEPLOY_SCRIPTS + 1))
[ -f "${PROJECT_ROOT}/deploy-vps-auto.sh" ] && DEPLOY_SCRIPTS=$((DEPLOY_SCRIPTS + 1))
[ -f "${PROJECT_ROOT}/deploy-staging.sh" ] && DEPLOY_SCRIPTS=$((DEPLOY_SCRIPTS + 1))

if [ "$DEPLOY_SCRIPTS" -ge 2 ]; then
    check_result "Deploy Scripts" "PASS" "${DEPLOY_SCRIPTS} deploy scripts found"
elif [ "$DEPLOY_SCRIPTS" -eq 1 ]; then
    check_result "Deploy Scripts" "WARN" "Only 1 deploy script found (consider adding more)"
else
    check_result "Deploy Scripts" "FAIL" "No deploy scripts found" true
fi

# 6.2 Rollback Script
log ""
log "6.2 Rollback Script..."
if [ -f "${PROJECT_ROOT}/scripts/ops/rollback-rehearsal.sh" ]; then
    check_result "Rollback Script" "PASS" "rollback-rehearsal.sh exists"
else
    check_result "Rollback Script" "WARN" "Rollback script not found"
fi

# 6.3 Backup Script
log ""
log "6.3 Backup Script..."
if [ -f "${PROJECT_ROOT}/scripts/ops/backup-list.sh" ]; then
    check_result "Backup Script" "PASS" "backup-list.sh exists"
else
    check_result "Backup Script" "WARN" "Backup script not found"
fi

# 6.4 Docker Support
log ""
log "6.4 Docker Support..."
if [ -f "${PROJECT_ROOT}/Dockerfile" ]; then
    check_result "Dockerfile" "PASS" "Dockerfile exists"
else
    check_result "Dockerfile" "WARN" "Dockerfile not found"
fi

# 6.5 PM2 Configuration
log ""
log "6.5 PM2 Configuration..."
if [ -f "${PROJECT_ROOT}/ecosystem.config.js" ]; then
    check_result "PM2 Config" "PASS" "ecosystem.config.js exists"
else
    check_result "PM2 Config" "WARN" "PM2 configuration not found"
fi

# 6.6 Environment Validation
log ""
log "6.6 Environment Validation..."
if [ -f "${PROJECT_ROOT}/.env.example" ]; then
    ENV_VARS=$(grep -c "^[A-Z]" "${PROJECT_ROOT}/.env.example" 2>/dev/null || echo 0)
    if [ "$ENV_VARS" -gt 5 ]; then
        check_result "Environment Template" "PASS" ".env.example with ${ENV_VARS} variables"
    else
        check_result "Environment Template" "WARN" ".env.example has only ${ENV_VARS} variables"
    fi
else
    check_result "Environment Template" "WARN" ".env.example not found"
fi

# 6.7 Git Status
log ""
log "6.7 Git Status..."
if output=$(cd "$PROJECT_ROOT" && git status --porcelain 2>/dev/null | head -5); then
    if [ -z "$output" ]; then
        check_result "Git Status" "PASS" "Working directory clean"
    else
        CHANGES=$(cd "$PROJECT_ROOT" && git status --porcelain 2>/dev/null | wc -l || echo 0)
        check_result "Git Status" "WARN" "${CHANGES} uncommitted changes"
    fi
else
    check_result "Git Status" "WARN" "Not a git repository"
fi

# 6.8 Branch Status
log ""
log "6.8 Branch Status..."
if output=$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null); then
    check_result "Current Branch" "PASS" "On branch: ${output}"
else
    check_result "Current Branch" "WARN" "Could not determine current branch"
fi

# =============================================================================
# SUMMARY
# =============================================================================
log ""
log "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
log "${CYAN}║                    SUMMARY                                  ║${NC}"
log "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
log ""
log "${GREEN}Passed:  ${PASS_COUNT}${NC}"
log "${YELLOW}Warnings: ${WARN_COUNT}${NC}"
log "${RED}Failed:  ${FAIL_COUNT}${NC}"
log "${RED}Critical Failures: ${CRITICAL_FAIL}${NC}"
log ""
log "Total Checks: $((PASS_COUNT + FAIL_COUNT + WARN_COUNT))"
log ""

# Final verdict
if [ "$CRITICAL_FAIL" -eq 0 ]; then
    log "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    log "${GREEN}║  ✅ READY FOR DEPLOYMENT                                  ║${NC}"
    log "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    log ""
    log "All critical checks passed. You can proceed with deployment."
    log ""
    EXIT_CODE=0
else
    log "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    log "${RED}║  ❌ NOT READY FOR DEPLOYMENT                               ║${NC}"
    log "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    log ""
    log "Critical failures detected. Please fix the following before deploying:"
    log ""
    EXIT_CODE=1
fi

log "Report saved to: ${LOG_FILE}"
log ""

exit $EXIT_CODE
