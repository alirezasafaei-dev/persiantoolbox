#!/usr/bin/env bash
set -Eeuo pipefail

echo "[deploy] deploy-vps-auto.sh is retired because it could replace production in place." >&2
echo "[deploy] delegating to the canonical atomic blue-green entrypoint." >&2

exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-blue-green.sh" "$@"
