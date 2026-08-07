# Production Runbook — PersianToolbox Growth

**Version**: 1.0  
**Created**: 2026-08-08

---

## Quick Reference

| Task | Command |
|------|---------|
| Health check | `curl -s https://persiantoolbox.ir/api/health` |
| Deploy (blue-green) | `bash deploy-blue-green.sh` |
| Deploy (staging) | `bash deploy-staging.sh` |
| Run tests | `pnpm vitest --run` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| Full QA | `pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build` |

---

## Pre-Deploy Checklist

Before any production deploy:

- [ ] `git status --short` is clean (or only intended changes)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm vitest --run` passes
- [ ] `pnpm build` succeeds
- [ ] Review `git diff` for unintended changes
- [ ] Verify no secrets are exposed
- [ ] User approval obtained (NEVER auto-deploy)

---

## Deploy Process (Blue-Green)

### Step 1: Local QA

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
```

### Step 2: Deploy

```bash
bash deploy-blue-green.sh
```

This script will:
1. Detect current slot (blue/green)
2. Rsync source to VPS
3. Build on VPS
4. Start new process on alternate port
5. Health check new process
6. Switch nginx upstream
7. Verify production
8. Stop old process

### Step 3: Verify Production

```bash
# Health endpoint
curl -s https://persiantoolbox.ir/api/health | grep '"status":"ok'

# Test 10 key pages
for page in "/" "/blog" "/about" "/contact" "/pricing" "/tools" "/contract-tools" "/contract-tools/salon-contract" "/contract-tools/vehicle-sale" "/writing-tools/persian-writing-studio"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://persiantoolbox.ir${page}")
  echo "${page}: HTTP ${CODE}"
  [ "$CODE" != "200" ] && echo "FAILED: ${page}" && exit 1
done
```

---

## Rollback Process

If regression is detected:

### Option 1: Switch nginx upstream back

```bash
# On VPS
sudo nano /etc/nginx/sites-available/projects
# Change upstream back to previous slot
sudo nginx -t && sudo systemctl reload nginx
```

### Option 2: Redeploy previous commit

```bash
git checkout <previous-commit>
bash deploy-blue-green.sh
git checkout main
```

---

## Staging Deploy

```bash
bash deploy-staging.sh
```

Staging is at: `https://staging.persiantoolbox.ir` (port 3001)

---

## Monitoring

### Health Monitor

- Runs every 5 minutes via cron
- Checks PM2 status + health endpoint
- Auto-restarts if site is down
- Log: `/home/ubuntu/.pm2/logs/health-monitor.log`

### Manual Health Check

```bash
# SSH to VPS
ssh -i /home/dev13/.ssh/id_ed25519 ubuntu@193.93.169.32

# Check PM2 status
pm2 status

# Check logs
pm2 logs persiantoolbox --lines 50

# Check nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## Common Issues

### Issue: Buttons/links broken after deploy

**Cause**: Stale nginx cache serves old HTML referencing old chunks

**Fix**:
```bash
# On VPS
sudo -u www-data find /var/cache/nginx -type f -delete
```

### Issue: CSS 404 after deploy

**Cause**: nginx cache purge silently fails (no sudo)

**Fix**:
```bash
# On VPS (must use sudo)
sudo find /var/cache/nginx/ -type f -delete
```

### Issue: Pages 502 after deploy

**Cause**: `.next/standalone` missing or incomplete build

**Fix**:
```bash
# On VPS
cd /home/ubuntu/persiantoolbox
rm -rf .next
pnpm install
NODE_OPTIONS=4096 next build
cp -r .next/static .next/standalone/.next/static
pm2 restart persiantoolbox
```

### Issue: PM2 "stopping" status

**Cause**: Old process being replaced

**Fix**: Wait for health check loop (up to 15s). If persists:
```bash
pm2 delete persiantoolbox
pm2 start ecosystem.config.js
```

---

## VPS Access

### SSH

```bash
ssh -i /home/dev13/.ssh/id_ed25519 ubuntu@193.93.169.32
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `/home/ubuntu/persiantoolbox` | Application root |
| `/home/ubuntu/persiantoolbox/.next/standalone` | Production build |
| `/home/ubuntu/.pm2/logs` | PM2 logs |
| `/var/cache/nginx` | nginx cache |
| `/etc/nginx/sites-available` | nginx config |

### PM2 Commands

```bash
pm2 status                    # Show all processes
pm2 logs persiantoolbox       # Show logs
pm2 restart persiantoolbox    # Restart process
pm2 stop persiantoolbox       # Stop process
pm2 delete persiantoolbox     # Delete process
```

---

## Database

### PostgreSQL

```bash
# Connect
psql -U postgres -d persiantoolbox

# Backup
pg_dump -U postgres persiantoolbox > backup.sql

# Restore
psql -U postgres persiantoolbox < backup.sql
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `analytics_summary` | Total event counts |
| `analytics_counters` | Event/path counters |
| `analytics_daily` | Daily aggregates |
| `usage_tracking` | User tool usage |
| `users` | User accounts |
| `sessions` | User sessions |
| `subscriptions` | Subscription data |
| `payments` | Payment records |

---

## Secrets Management

### Environment Variables

Stored in `.env` on VPS (not in git):

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir
PAYMENT_BASE_URL=https://pay.persiantoolbox.ir
SENTRY_AUTH_TOKEN=...
```

### Never

- Commit `.env` files
- Print secrets in terminal
- Share secrets in chat
- Store secrets in documentation

---

## Backup

### Automated

- Daily at 3 AM via cron
- Full backup: DB + files + env
- Location: `/home/ubuntu/backups/`

### Manual

```bash
# On VPS
cd /home/ubuntu
bash backup.sh
```

---

## Emergency Procedures

### Site Down

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs persiantoolbox --lines 100`
3. Restart if needed: `pm2 restart persiantoolbox`
4. Check nginx: `sudo nginx -t && sudo systemctl status nginx`
5. Check database: `pg_isready`

### Data Loss

1. Stop writes: Take app offline
2. Restore from backup: `psql -U postgres persiantoolbox < backup.sql`
3. Verify data integrity
4. Bring app online

### Security Incident

1. Change all secrets
2. Review access logs
3. Check for unauthorized changes
4. Update firewall rules
5. Notify users if needed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial production runbook |
