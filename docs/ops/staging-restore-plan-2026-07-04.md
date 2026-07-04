# Staging Restore Plan — 2026-07-04

## Current Staging Status

- https://staging.persiantoolbox.ir is UNREACHABLE.
- curl to / returned SSL certificate error: "no alternative certificate subject name matches target host name 'staging.persiantoolbox.ir'".
- /api/health and /api/version also unreachable (timeout/SSL).

## Verified Evidence

- Live curl from local:
  - SSL cert mismatch for staging subdomain.
  - Production (persiantoolbox.ir) works fine with valid certs and returns 200 + metadata.
- deploy-staging.sh exists and is functional:
  - Rsync to /home/ubuntu/persiantoolbox-staging
  - Separate PM2 process "persiantoolbox-staging" on port 3001
  - Builds with NODE_OPTIONS=4096, copies static, PDF worker, creates .env.staging
  - Uses ecosystem.config.js
- health-monitor.sh is for production only.
- No evidence of current PM2 status on VPS for staging (no SSH access performed).
- nginx config likely proxies staging to port 3001 but SSL/TLS for staging subdomain not properly configured.

## Likely Failure Layer

- **Primary**: TLS/SSL certificate configuration for staging.persiantoolbox.ir (wrong or missing SAN).
- Possible secondary: staging PM2 process down, or nginx not serving the subdomain, or DNS.
- Server-side cause: **INSUFFICIENT EVIDENCE** (no SSH/VPS access; only client-side curl observed).

## Exact Manual Commands for Human / VPS Operator

1. SSH to VPS:
   ssh -i /path/to/id_ed25519 ubuntu@193.93.169.32

2. Check PM2 staging:
   pm2 list | grep staging
   pm2 logs persiantoolbox-staging --lines 50

3. Check if process running on 3001:
   ss -tlnp | grep 3001
   curl -I http://localhost:3001/api/health

4. Check nginx for staging:
   sudo cat /etc/nginx/sites-enabled/\* | grep -A 20 staging || sudo grep -r staging /etc/nginx/

5. Fix SSL (Let's Encrypt for staging):
   sudo certbot certonly --nginx -d staging.persiantoolbox.ir

   # Or manual if wildcard.

6. Restart nginx:
   sudo nginx -t && sudo systemctl reload nginx

7. Restart staging PM2 if needed:
   pm2 delete persiantoolbox-staging || true
   cd /home/ubuntu/persiantoolbox-staging
   PORT=3001 pm2 start ecosystem.config.js --name persiantoolbox-staging

8. Verify from outside:
   curl -I https://staging.persiantoolbox.ir/
   curl -s https://staging.persiantoolbox.ir/api/health
   curl -s https://staging.persiantoolbox.ir/api/version

## Verification Checklist (after fix)

- [ ] https://staging.persiantoolbox.ir/ returns 200
- [ ] /api/health returns {"status":"ok", ...}
- [ ] /api/version exposes commit/branch
- [ ] CSS loads (200)
- [ ] font loads (200)
- [ ] /loan returns 200
- [ ] PDF worker accessible if needed

## Rollback Plan

- If certbot breaks prod: sudo certbot delete --cert-name staging.persiantoolbox.ir
- Revert nginx changes from backup.
- pm2 delete persiantoolbox-staging if it interferes.

## Notes

- Use the same deploy-staging.sh once staging is reachable.
- Do not run production deploy scripts for staging.
- After restore, run full health sequence from deploy-staging.sh logic.
