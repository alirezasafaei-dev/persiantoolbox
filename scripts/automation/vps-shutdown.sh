#!/bin/bash
# vps-shutdown.sh — Graceful VPS shutdown for maintenance
# Usage: bash scripts/automation/vps-shutdown.sh
set -e

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
USER="ubuntu"

echo "=== VPS Graceful Shutdown ==="
echo "This will:"
echo "  1. Create fresh backup"
echo "  2. Stop all services"
echo "  3. Ready for shutdown"
echo ""

# 1. Backup first
echo "Step 1: Creating backup..."
bash "$(dirname "$0")/backup.sh"
echo ""

# 2. Stop services
echo "Step 2: Stopping services..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$VPS" bash -s <<REMOTE
set -e
echo "Saving PM2 state..."
pm2 save

echo "Stopping PM2 processes..."
pm2 stop all

echo "Stopping PostgreSQL..."
sudo systemctl stop postgresql

echo "Stopping Redis..."
sudo systemctl stop redis-server

echo "All services stopped."
echo "VPS is ready for shutdown."
REMOTE

echo ""
echo "=== VPS ready for shutdown ==="
echo "After maintenance, run: bash scripts/automation/vps-startup.sh"
