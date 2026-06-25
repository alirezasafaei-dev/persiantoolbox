#!/bin/bash
# vps-startup.sh — Start services after maintenance
# Usage: bash scripts/automation/vps-startup.sh
set -e

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
USER="ubuntu"

echo "=== VPS Startup ==="

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$VPS" bash -s <<REMOTE
set -e
echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting PostgreSQL..."
sudo systemctl start postgresql

echo "Starting PM2 processes..."
pm2 resurrect 2>/dev/null || pm2 start ecosystem.config.js

echo "Waiting for app to start..."
sleep 5

echo "Verifying..."
curl -s http://localhost:3000/api/health | head -1
REMOTE

echo ""
echo "=== Running full health check ==="
bash "$(dirname "$0")/health-check.sh"
