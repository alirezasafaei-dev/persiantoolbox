#!/bin/bash
# deploy.sh — One-command deploy with all safety checks
# Usage: bash scripts/automation/deploy.sh
set -e

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
USER="ubuntu"

echo "========================================="
echo "  PersianToolbox Deploy — v$(node -p "require('./package.json').version")"
echo "========================================="
echo ""

# Pre-deploy: backup
echo "=== Pre-deploy backup ==="
bash "$(dirname "$0")/backup.sh"
echo ""

# Deploy
echo "=== Deploying ==="
bash "$(dirname "$0")/../deploy-vps-auto.sh"
echo ""

# Post-deploy: verify
echo "=== Post-deploy verification ==="
bash "$(dirname "$0")/health-check.sh"
