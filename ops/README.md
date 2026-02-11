# VPS Operations Pack

This folder contains deploy assets for Ubuntu 22.04 with Node.js + PM2 + Nginx.

## Files

- `ops/deploy/deploy.sh`: release deploy script (staging/production).
- `ops/deploy/rollback.sh`: rollback script to previous or target release.
- `ops/nginx/persian-tools.conf`: sample Nginx vhost for staging + production.
- `ops/systemd/persian-tools-staging.service`: PM2 runtime service for staging.
- `ops/systemd/persian-tools-production.service`: PM2 runtime service for production.
- `scripts/deploy/bootstrap-ubuntu-vps.sh`: bootstrap اولیه Ubuntu 22.04.
- `scripts/deploy/encode-env-file.sh`: تبدیل امن فایل env به base64 برای GitHub Secrets.
- `scripts/deploy/generate-post-deploy-report.mjs`: تولید گزارش post-deploy.

## Server Layout

- `/var/www/persian-tools/releases/<env>/<release_id>`
- `/var/www/persian-tools/current/<env>` (symlink)
- `/var/www/persian-tools/shared/env/<env>.env`
- `/var/www/persian-tools/shared/logs/`

## Deploy Example

```bash
bash ops/deploy/deploy.sh \
  --env staging \
  --base-dir /var/www/persian-tools \
  --source-dir /var/www/persian-tools/tmp/release-20260211 \
  --release-id staging-20260211T120000Z \
  --keep-releases 3
```

## Rollback Example

```bash
bash ops/deploy/rollback.sh --env production --base-dir /var/www/persian-tools
```
