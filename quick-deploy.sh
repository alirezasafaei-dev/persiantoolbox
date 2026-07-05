#!/bin/bash
# quick-deploy.sh — wrapper for the hardened production deploy pipeline.
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "quick-deploy now delegates to deploy-vps-auto.sh so QA, release isolation, rollback, cache purge, and public verification stay consistent."
exec bash "$SCRIPT_DIR/deploy-vps-auto.sh"
