# Staging Restore Runbook — 2026-07-04

## Pre-Checks (local or any machine)
curl -I https://staging.persiantoolbox.ir/
curl -s https://staging.persiantoolbox.ir/api/health
curl -s https://staging.persiantoolbox.ir/api/version
curl -I https://staging.persiantoolbox.ir/loan

## On VPS (ssh ubuntu@193.93.169.32)
# 1. PM2 status
pm2 list | grep -E 'persiantoolbox-staging|staging'
pm2 logs persiantoolbox-staging --lines 100 --nostream

# 2. Port
ss -tlnp | grep 3001
curl -I http://localhost:3001/api/health

# 3. nginx
sudo nginx -t
sudo cat /etc/nginx/sites-available/* | grep -A 30 -E 'staging|3001' || sudo grep -r 'staging' /etc/nginx/

# 4. Certs
sudo certbot certificates | grep -A 5 staging.persiantoolbox.ir || echo "No cert for staging"
ls -l /etc/letsencrypt/live/staging.persiantoolbox.ir/ 2>/dev/null || echo "No staging cert dir"

## Fix SSL (if cert mismatch)
sudo certbot certonly --nginx -d staging.persiantoolbox.ir --non-interactive || sudo certbot --nginx -d staging.persiantoolbox.ir

# Reload
sudo nginx -t && sudo systemctl reload nginx

## Restart staging
cd /home/ubuntu/persiantoolbox-staging
pm2 delete persiantoolbox-staging || true
PORT=3001 pm2 start ecosystem.config.js --name persiantoolbox-staging --cwd /home/ubuntu/persiantoolbox-staging

## Verify
sleep 5
curl -I https://staging.persiantoolbox.ir/
curl -s https://staging.persiantoolbox.ir/api/health
curl -s https://staging.persiantoolbox.ir/api/version
curl -I https://staging.persiantoolbox.ir/loan

# CSS
CSS_URL=$(curl -s https://staging.persiantoolbox.ir/ | grep -oP 'href="(/[^"]+\.css)"' | head -1 | tr -d '"')
curl -I "https://staging.persiantoolbox.ir$CSS_URL"

## Rollback
pm2 delete persiantoolbox-staging || true
sudo certbot delete --cert-name staging.persiantoolbox.ir || true
# Restore nginx from backup if needed

## Production Safety
- Never run on production paths.
- Use separate PM2 name and port.
- Verify health before considering done.
