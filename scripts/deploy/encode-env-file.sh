#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $(basename "$0") <env-file-path>" >&2
  exit 1
fi

ENV_FILE="$1"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[encode-env] file not found: $ENV_FILE" >&2
  exit 1
fi

if command -v base64 >/dev/null 2>&1; then
  base64 -w 0 "$ENV_FILE" 2>/dev/null || base64 "$ENV_FILE" | tr -d '\n'
else
  echo "[encode-env] base64 command not found" >&2
  exit 1
fi

echo
