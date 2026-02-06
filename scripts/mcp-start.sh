#!/usr/bin/env bash
set -euo pipefail

# MCP stdio servers are launched on-demand by the MCP client (Codex/CLI).
# This script prepares the environment and runs a fast smoke-check.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/.mcp-logs"
mkdir -p "$LOG_DIR"
mkdir -p "$HOME/.codex/memory"

# Shared environment
export CODEX_WORKSPACE="$ROOT"
export MCP_LOG_LEVEL="${MCP_LOG_LEVEL:-INFO}"
export PROJECT_PATH="${PROJECT_PATH:-$ROOT}"
export LOCAL_BRANCH="${LOCAL_BRANCH:-$(git -C "$ROOT" branch --show-current 2>/dev/null || echo main)}"
export REMOTE_BRANCH="${REMOTE_BRANCH:-$LOCAL_BRANCH}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-${CODEX_API_KEY_2026:-}}"
export DATABASE_URL="${DATABASE_URL:-}"
export MCP_POSTGRES_URL="${MCP_POSTGRES_URL:-${DATABASE_URL:-}}"
export MEMORY_FILE_PATH="${MEMORY_FILE_PATH:-$HOME/.codex/memory/persian-tools-memory.jsonl}"

ok=0
warn=0
fail=0

check_server() {
  local name=$1
  shift
  local log="$LOG_DIR/$name.log"

  if timeout 4s "$@" </dev/null >"$log" 2>&1; then
    echo "[OK]   $name"
    ok=$((ok + 1))
  else
    local code=$?
    echo "[FAIL] $name (exit=$code)"
    echo "       log: $log"
    fail=$((fail + 1))
  fi
}

skip_server() {
  local name=$1
  local reason=$2
  echo "[SKIP] $name - $reason"
  warn=$((warn + 1))
}

check_server codex_integration "$ROOT/node_modules/.bin/mcp-server-everything" stdio
check_server filesystem "$ROOT/node_modules/.bin/mcp-server-filesystem" "$ROOT" "$HOME/.codex"
check_server git /usr/bin/mcp-server-git
# shell MCP requires handshake; --help is a reliable availability check.
check_server shell "$ROOT/node_modules/.bin/codex-shell-tool-mcp" --help

if [[ -n "$MCP_POSTGRES_URL" ]]; then
  check_server postgres "$ROOT/node_modules/.bin/mcp-server-postgres" "$MCP_POSTGRES_URL"
else
  skip_server postgres "DATABASE_URL / MCP_POSTGRES_URL is not set"
fi

check_server memory "$ROOT/node_modules/.bin/mcp-server-memory"
check_server sequential_thinking "$ROOT/node_modules/.bin/mcp-server-sequential-thinking"
check_server playwright "$ROOT/node_modules/.bin/mcp-server-everything" stdio

# GitHub server can run without token for public data, but private repo operations need PAT.
check_server github "$ROOT/node_modules/.bin/mcp-server-github"

printf '\nSummary: ok=%d skip=%d fail=%d\n' "$ok" "$warn" "$fail"
if [[ $fail -gt 0 ]]; then
  exit 1
fi

cat <<MSG
MCP smoke-check completed.
Enabled servers are configured in mcp-config.toml and will be launched on-demand by the MCP client.
MSG
