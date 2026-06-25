# Backup & Recovery Guide — PersianToolbox

**Last Updated**: 2026-06-25
**Version**: v6.7.0

## Backup Location

### VPS (primary)

```
/home/ubuntu/backups/
```

### Local machine (copy)

```
/home/dev13/my-project/backups/persiantoolbox-20260625/
```

## Backup Contents

| File                            | Size | Content                                            |
| ------------------------------- | ---- | -------------------------------------------------- |
| `persian_tools_*.sql`           | 23K  | PostgreSQL database dump                           |
| `persiantoolbox_files_*.tar.gz` | 68M  | Project files (excludes node_modules, .next, .git) |
| `env_backup_*`                  | 835B | Environment variables                              |
| `nginx_projects_*`              | 4.5K | Nginx configuration                                |

## Backup Script

```bash
# Run on VPS
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. PostgreSQL dump
sudo -u postgres pg_dump persian_tools > $BACKUP_DIR/persian_tools_$DATE.sql

# 2. Project files
cd /home/ubuntu
tar czf $BACKUP_DIR/persiantoolbox_files_$DATE.tar.gz \
  --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='backups' \
  persiantoolbox/

# 3. Environment
cp /home/ubuntu/persiantoolbox/.env $BACKUP_DIR/env_backup_$DATE

# 4. Nginx config
sudo cp /etc/nginx/sites-enabled/projects $BACKUP_DIR/nginx_projects_$DATE

# 5. PM2 process list
pm2 save

# 6. SSL certificates
sudo tar czf $BACKUP_DIR/ssl_$DATE.tar.gz /etc/letsencrypt/live/persiantoolbox.ir/
```

## Recovery Steps

### 1. Restore database

```bash
sudo -u postgres dropdb persiantoolbox
sudo -u postgres createdb persiantoolbox
sudo -u postgres psql persian_tools < /home/ubuntu/backups/persian_tools_XXXXXXXX_XXXXXX.sql
```

### 2. Restore project files

```bash
cd /home/ubuntu
tar xzf backups/persiantoolbox_files_XXXXXXXX_XXXXXX.tar.gz
cd persiantoolbox
cp /home/ubuntu/backups/env_backup_XXXXXXXX_XXXXXX .env
```

### 3. Restore nginx

```bash
sudo cp /home/ubuntu/backups/nginx_projects_XXXXXXXX_XXXXXX /etc/nginx/sites-enabled/projects
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Rebuild and start

```bash
cd /home/ubuntu/persiantoolbox
pnpm install --no-frozen-lockfile
NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
cp -r public/* .next/standalone/public/
chmod -R o+rX .next/standalone/.next/static/ .next/standalone/public/
pm2 delete persiantoolbox 2>/dev/null || true
pm2 start ecosystem.config.js
rm -rf /var/cache/nginx/persiantoolbox/*
sudo systemctl reload nginx
```

### 5. Verify

```bash
curl https://persiantoolbox.ir/api/health
curl -o /dev/null -w "%{http_code}" https://persiantoolbox.ir/
```

## VPS Shutdown Checklist

Before hosting maintenance:

```bash
# 1. Create fresh backup
bash /path/to/backup-script.sh

# 2. Save PM2 state
pm2 save

# 3. Graceful stop
pm2 stop all

# 4. Stop PostgreSQL
sudo systemctl stop postgresql

# 5. Stop Redis
sudo systemctl stop redis-server

# 6. VPS can now be safely shut down
```

After maintenance:

```bash
# 1. Start services
sudo systemctl start redis-server
sudo systemctl start postgresql
pm2 resurrect  # Restores from pm2 save
pm2 start ecosystem.config.js  # Fallback if resurrect fails

# 2. Verify
curl https://persiantoolbox.ir/api/health
```
