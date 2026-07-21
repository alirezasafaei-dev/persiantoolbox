#!/usr/bin/env bash
set -Eeuo pipefail

echo "[deploy] auto-deploy.sh is retired; password-based in-place production deploys are forbidden." >&2
echo "[deploy] delegating to the canonical atomic blue-green entrypoint." >&2

exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-blue-green.sh" "$@"
