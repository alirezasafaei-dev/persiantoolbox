#!/usr/bin/env bash
# PersianToolbox Security Audit Script
# Checks for common security issues and reports severity levels.
# Exit 0: no HIGH issues found | Exit 1: one or more HIGH issues found

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

find_files() {
  find "$PROJECT_ROOT" \
    -type f \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.json' -o -name '*.md' -o -name '*.yml' -o -name '*.yaml' -o -name '*.sh' \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/.git/*' \
    -not -path '*/dist/*' \
    -not -path '*/pnpm-lock.yaml' \
    -not -path '*/coverage/*' \
    -not -path '*/.pnpm-store/*' \
    2>/dev/null || true
}

print_header() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}========================================${NC}"
}

print_finding() {
  local severity="$1"
  local file="$2"
  local detail="$3"

  case "$severity" in
    HIGH)
      echo -e "  ${RED}[HIGH]${NC} ${file}"
      echo -e "        ${detail}"
      HIGH_COUNT=$((HIGH_COUNT + 1))
      ;;
    MEDIUM)
      echo -e "  ${YELLOW}[MEDIUM]${NC} ${file}"
      echo -e "        ${detail}"
      MEDIUM_COUNT=$((MEDIUM_COUNT + 1))
      ;;
    LOW)
      echo -e "  ${GREEN}[LOW]${NC} ${file}"
      echo -e "        ${detail}"
      LOW_COUNT=$((LOW_COUNT + 1))
      ;;
  esac
}

# ── 1. Check .env files tracked in git ──────────────────────────────────────

print_header "1. Checking for .env files in git"

if command -v git >/dev/null 2>&1 && [ -d "$PROJECT_ROOT/.git" ]; then
  ENV_IN_GIT=$(git -C "$PROJECT_ROOT" ls-files 2>/dev/null | grep -E '\.env\b' | grep -v '\.example' | grep -v '\.env\.production\.example' || true)
  if [ -n "$ENV_IN_GIT" ]; then
    while IFS= read -r envfile; do
      print_finding "HIGH" "$envfile" ".env file is tracked in git — remove it from tracking"
    done <<< "$ENV_IN_GIT"
  else
    echo -e "  ${GREEN}OK${NC}: No .env files tracked in git"
  fi
else
  echo -e "  ${YELLOW}SKIP${NC}: Not a git repo"
fi

# ── 2. Check for hardcoded secrets ──────────────────────────────────────────

print_header "2. Checking for hardcoded secrets"

SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  'ghp_[0-9A-Za-z]{36}'
  'github_pat_[0-9A-Za-z_]{82,}'
  'AIza[0-9A-Za-z_-]{35}'
  'sk_live_[0-9A-Za-z]{16,}'
  'sk_test_[0-9A-Za-z]{16,}'
  'xox[baprs]-[0-9A-Za-z-]{10,}'
  '-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----'
)

SECRET_NAMES=(
  'AWS Access Key'
  'GitHub PAT'
  'GitHub fine-grained PAT'
  'Google API Key'
  'Stripe live key'
  'Stripe test key'
  'Slack token'
  'Private key block'
)

secret_found=0
for i in "${!SECRET_PATTERNS[@]}"; do
  pattern="${SECRET_PATTERNS[$i]}"
  name="${SECRET_NAMES[$i]}"
  matches=$(find_files | xargs grep -lE "$pattern" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    while IFS= read -r matchfile; do
      print_finding "HIGH" "$matchfile" "Hardcoded secret: ${name}"
      secret_found=1
    done <<< "$matches"
  fi
done

if [ "$secret_found" -eq 0 ]; then
  echo -e "  ${GREEN}OK${NC}: No hardcoded secrets detected"
fi

# ── 3. Check for TODO/FIXME/HACK comments ───────────────────────────────────

print_header "3. Checking for TODO/FIXME/HACK comments"

TODO_FOUND=0
todo_matches=$(find_files | grep -v 'pdf\.worker\.min\.mjs' | grep -v 'scripts/' | grep -v 'tests/' | grep -v 'examples/' | xargs grep -rnE '(TODO|FIXME|HACK|XXX|WORKAROUND)\b' 2>/dev/null || true)
if [ -n "$todo_matches" ]; then
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    detail=$(echo "$line" | cut -d: -f2-)
    if echo "$detail" | grep -qiE '(secur|password|token|auth|secret|bypass|skip)'; then
      print_finding "HIGH" "$file" "Security-related TODO: ${detail}"
    else
      print_finding "LOW" "$file" "${detail}"
    fi
    TODO_FOUND=1
  done <<< "$todo_matches"
fi

if [ "$TODO_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}OK${NC}: No TODO/FIXME/HACK comments found"
fi

# ── 4. Check for console.log statements ─────────────────────────────────────

print_header "4. Checking for console.log statements"

CONSOLE_FOUND=0
# Only check source files, not config/logs
console_matches=$(find_files | grep -E '\.(ts|tsx|js|jsx|mjs)$' | grep -v 'public/' | grep -v '\.min\.' | xargs grep -rnE '\bconsole\.(log|debug|info)\b' 2>/dev/null || true)
if [ -n "$console_matches" ]; then
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    lineno=$(echo "$line" | cut -d: -f2)
    detail=$(echo "$line" | cut -d: -f3-)
    if echo "$detail" | grep -qiE '(password|token|secret|key|credential|auth|cookie|session)'; then
      print_finding "HIGH" "${file}:${lineno}" "console.log may leak sensitive data: ${detail}"
    else
      print_finding "LOW" "${file}:${lineno}" "${detail}"
    fi
    CONSOLE_FOUND=1
  done <<< "$console_matches"
fi

if [ "$CONSOLE_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}OK${NC}: No console.log/debug/info in source files"
fi

# ── 5. Check for eval() usage ───────────────────────────────────────────────

print_header "5. Checking for eval() usage"

EVAL_FOUND=0
eval_matches=$(find_files | grep -E '\.(ts|tsx|js|jsx|mjs)$' | grep -v 'public/' | grep -v '\.min\.' | grep -v 'node_modules' | grep -v 'test' | xargs grep -rnE '\beval\s*\(' 2>/dev/null || true)
if [ -n "$eval_matches" ]; then
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    lineno=$(echo "$line" | cut -d: -f2)
    detail=$(echo "$line" | cut -d: -f3-)
    print_finding "HIGH" "${file}:${lineno}" "eval() usage — potential code injection: ${detail}"
    EVAL_FOUND=1
  done <<< "$eval_matches"
fi

if [ "$EVAL_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}OK${NC}: No eval() usage found"
fi

# ── 6. Check for dangerous HTML manipulation ────────────────────────────────

print_header "6. Checking for dangerous HTML (innerHTML, dangerouslySetInnerHTML)"

DANGEROUS_FOUND=0
dangerous_matches=$(find_files | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -rnE '(innerHTML|dangerouslySetInnerHTML)' 2>/dev/null || true)
if [ -n "$dangerous_matches" ]; then
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    lineno=$(echo "$line" | cut -d: -f2)
    detail=$(echo "$line" | cut -d: -f3-)
    print_finding "MEDIUM" "${file}:${lineno}" "Dangerous HTML manipulation — ensure input is sanitized: ${detail}"
    DANGEROUS_FOUND=1
  done <<< "$dangerous_matches"
fi

if [ "$DANGEROUS_FOUND" -eq 0 ]; then
  echo -e "  ${GREEN}OK${NC}: No dangerous HTML manipulation found"
fi

# ── 7. Additional checks ───────────────────────────────────────────────────

print_header "7. Additional security checks"

# Check for process.env exposure in client components
ENV_CLIENT=$(find_files | grep -E '\.(tsx|jsx)$' | xargs grep -rnE "'use client'" -l 2>/dev/null || true)
if [ -n "$ENV_CLIENT" ]; then
  client_with_env=""
  while IFS= read -r clientfile; do
    if grep -qE 'process\.env\.' "$clientfile" 2>/dev/null; then
      client_with_env="${client_with_env}${clientfile}\n"
    fi
  done <<< "$ENV_CLIENT"
  if [ -n "$client_with_env" ]; then
    while IFS= read -r cfile; do
      [ -z "$cfile" ] && continue
      print_finding "MEDIUM" "$cfile" "Client component uses process.env — ensure only NEXT_PUBLIC_ vars"
    done <<< "$(echo -e "$client_with_env")"
  fi
fi

# Check for disabled security headers
DISABLE_XFO=$(find_files | xargs grep -lE 'X-Frame-Options.*DENY|frame-ancestors' 2>/dev/null | head -1 || true)
if [ -z "$DISABLE_XFO" ]; then
  # Not necessarily a problem — headers may be set in proxy/middleware
  echo -e "  ${YELLOW}NOTE${NC}: X-Frame-Options / CSP frame-ancestors not found in source (may be set in proxy)"
fi

# Check for exposed source maps in build
if [ -d "$PROJECT_ROOT/.next" ]; then
  MAPS_IN_BUILD=$(find "$PROJECT_ROOT/.next" -name '*.js.map' 2>/dev/null | head -5 || true)
  if [ -n "$MAPS_IN_BUILD" ]; then
    print_finding "LOW" ".next/" "Source maps found in build output — ensure they are not served in production"
  fi
fi

echo ""

# ── Summary ─────────────────────────────────────────────────────────────────

print_header "Security Audit Summary"

TOTAL=$((HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT))

echo -e "  ${RED}HIGH:   ${HIGH_COUNT}${NC}"
echo -e "  ${YELLOW}MEDIUM: ${MEDIUM_COUNT}${NC}"
echo -e "  ${GREEN}LOW:    ${LOW_COUNT}${NC}"
echo -e "  Total:  ${TOTAL}"
echo ""

if [ "$HIGH_COUNT" -gt 0 ]; then
  echo -e "  ${RED}RESULT: FAIL — ${HIGH_COUNT} HIGH severity issue(s) found${NC}"
  echo ""
  exit 1
else
  echo -e "  ${GREEN}RESULT: PASS — No HIGH severity issues${NC}"
  echo ""
  exit 0
fi
