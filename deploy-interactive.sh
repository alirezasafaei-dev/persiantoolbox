#!/usr/bin/env bash
set -Eeuo pipefail

echo "[deploy] deploy-interactive.sh is retired; it exposed password-based and in-place deployment paths." >&2
echo "[deploy] delegating to the canonical atomic blue-green entrypoint." >&2

exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-blue-green.sh" "$@"
