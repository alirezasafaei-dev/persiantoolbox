#!/bin/bash
# backup.sh — Full backup: DB + files + env + nginx + SSL
# Usage: bash scripts/automation/backup.sh
set -e

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
USER="ubuntu"
LOCAL_BACKUP="/home/dev13/my-project/backups/persiantoolbox"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOCAL_BACKUP"

echo "=== Step 1: Create backup on VPS ==="
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$VPS" bash -s <<REMOTE
set -e
BACKUP_DIR="/home/ubuntu/backups"
DATE=$DATE

echo "PostgreSQL dump..."
sudo -u postgres pg_dump persian_tools > \$BACKUP_DIR/persian_tools_\$DATE.sql

echo "Project files..."
cd /home/ubuntu
tar czf \$BACKUP_DIR/persiantoolbox_files_\$DATE.tar.gz \
  --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='backups' \
  persiantoolbox/

echo "Environment..."
cp /home/ubuntu/persiantoolbox/.env \$BACKUP_DIR/env_backup_\$DATE

echo "Nginx config..."
sudo cp /etc/nginx/sites-enabled/projects \$BACKUP_DIR/nginx_projects_\$DATE

echo "SSL certificates..."
sudo tar czf \$BACKUP_DIR/ssl_\$DATE.tar.gz /etc/letsencrypt/live/persiantoolbox.ir/ 2>/dev/null || true

echo "PM2 state..."
pm2 save

echo "Backup on VPS: OK"
ls -lh \$BACKUP_DIR/*_\$DATE*
REMOTE

echo "=== Step 2: Download to local ==="
rsync -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$USER@$VPS:/home/ubuntu/backups/persian_tools_${DATE}.sql" "$LOCAL_BACKUP/"
rsync -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$USER@$VPS:/home/ubuntu/backups/persiantoolbox_files_${DATE}.tar.gz" "$LOCAL_BACKUP/"
rsync -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$USER@$VPS:/home/ubuntu/backups/env_backup_${DATE}" "$LOCAL_BACKUP/"
rsync -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$USER@$VPS:/home/ubuntu/backups/nginx_projects_${DATE}" "$LOCAL_BACKUP/"

echo "=== Step 3: Cleanup old backups (keep 7 days) ==="
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$VPS" \
  "find /home/ubuntu/backups -name '*.sql' -mtime +7 -delete 2>/dev/null; find /home/ubuntu/backups -name '*.tar.gz' -mtime +7 -delete 2>/dev/null; find /home/ubuntu/backups -name 'env_backup_*' -mtime +7 -delete 2>/dev/null; echo 'Cleanup done'"

echo "=== Done ==="
ls -lh "$LOCAL_BACKUP/"
