#!/usr/bin/env bash
set -euo pipefail

# Starts all MCP servers defined in mcp-config.toml (paths are hardcoded to avoid parsing TOML).
# Each server is backgrounded with a PID file and log file under .mcp-logs.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/.mcp-logs"
mkdir -p "$LOG_DIR"

start_server() {
  local name=$1; shift
  local cmd=("$@")
  local log="$LOG_DIR/$name.log"
  local pidfile="$LOG_DIR/$name.pid"

  # Stop existing if running
  if [[ -f "$pidfile" ]]; then
    local pid
    pid=$(cat "$pidfile")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping existing $name (pid $pid)..."
      kill "$pid" || true
      sleep 0.5
    fi
  fi

  echo "Starting $name -> ${cmd[*]}"
  nohup "${cmd[@]}" >"$log" 2>&1 &
  echo $! >"$pidfile"
}

# Environment that some servers rely on
export CODEX_WORKSPACE="$ROOT"
export MCP_LOG_LEVEL="${MCP_LOG_LEVEL:-INFO}"
export PROJECT_PATH="${PROJECT_PATH:-$ROOT}"
export LOCAL_BRANCH="${LOCAL_BRANCH:-master}"
export REMOTE_BRANCH="${REMOTE_BRANCH:-master}"

# Optional keys – leave empty if not set in env
export OPENAI_API_KEY="${OPENAI_API_KEY:-${CODEX_API_KEY_2026:-}}"

# Servers
start_server codex_integration "$ROOT/node_modules/.bin/mcp-server-everything"
start_server git_codex /usr/bin/mcp-server-git
start_server git /usr/bin/mcp-server-git
start_server playwright "$ROOT/node_modules/.bin/mcp-server-everything"
start_server postgres /usr/bin/mcp-server-postgres "postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools"
start_server filesystem /usr/bin/mcp-server-filesystem "$ROOT" "$HOME"
start_server shell "$ROOT/node_modules/.bin/codex-shell-tool-mcp"
start_server runtime "$ROOT/node_modules/.bin/mcp-server-everything"
start_server http "$ROOT/node_modules/.bin/mcp-server-everything"
start_server environment_manager "$ROOT/node_modules/.bin/mcp-server-everything"
start_server code_search "$ROOT/node_modules/.bin/mcp-server-everything"
start_server api_testing "$ROOT/node_modules/.bin/mcp-server-everything"

echo "All MCP servers attempted. Logs: $LOG_DIR"
