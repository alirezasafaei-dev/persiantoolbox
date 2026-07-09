#!/bin/bash
# Run Lighthouse CI on key pages
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "Running Lighthouse CI..."
npx lhci autorun --config=lighthouserc.json
