#!/usr/bin/env bash
set -Eeuo pipefail

SITE_URL="${1:-https://persiantoolbox.ir}"
EXPECTED_COMMIT="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

exec bash "$SCRIPT_DIR/verify-release-assets.sh" "$SITE_URL" "$EXPECTED_COMMIT"
