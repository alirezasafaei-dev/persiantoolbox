# Incident Response Runbook — persiantoolbox.ir

**Last Updated**: 2026-07-09
**Severity Levels**: P1 (site down) · P2 (degraded) · P3 (degraded, non-critical) · P4 (minor)

---

## Contact Information

| Role | Host | SSH |
|------|------|-----|
| Production Server | VPS | `ssh ubuntu@193.93.169.32` |
| Automation Server | VPS | `ssh asdev@91.107.153.223` |

---

## 1. Site Down (HTTP 5xx)

**Severity**: P1 · **Response**: immediate

### Step 1 — Confirm the outage

```bash
curl -s -o /dev/null -w "%{http_code}" https://persiantoolbox.ir/api/health
curl -s -o /dev/null -w "%{http_code}" https://persiantoolbox.ir/
```

If both return 502/503/504 → site is down.

### Step 2 — Check PM2 status

```bash
ssh ubuntu@193.93.169.32 'pm2 status'
# Look for "online" on persiantoolbox (port 3000) or persiantoolbox-green (port 3003)
```

**If process is stopped/crashed:**
```bash
pm2 restart persiantoolbox
sleep 5
pm2 status
curl -s http://127.0.0.1:3000/api/health
```

**If PM2 shows 0 processes:**
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Step 3 — Check nginx status

```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -20 /var/log/nginx/error.log
```

**If nginx is down:**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

**If nginx config error:**
```bash
# Revert to last known good config
sudo cp /etc/nginx/sites-available/persian-tools.conf.bak /etc/nginx/sites-available/persian-tools.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Step 4 — Check SSL certificate

```bash
echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -dates
# If expired or <7 days:
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Step 5 — Check DNS resolution

```bash
dig +short persiantoolbox.ir
# Should resolve to 193.93.169.32
# If wrong, update DNS at registrar
```

### Step 6 — Check upstream config

```bash
cat /etc/nginx/conf.d/persiantoolbox-upstream.conf
# Should contain: server 127.0.0.1:3000; or server 127.0.0.1:3003;
```

### Step 7 — Rollback (blue-green)

If the current deploy broke the site, switch back to the previous slot:

```bash
# Current active port (check which is live):
grep -oE '127\.0\.0\.1:[0-9]+' /etc/nginx/conf.d/persiantoolbox-upstream.conf

# If blue (3000) is broken → switch to green (3003):
echo 'upstream persiantoolbox { server 127.0.0.1:3003; }' | sudo tee /etc/nginx/conf.d/persiantoolbox-upstream.conf
sudo nginx -t && sudo systemctl reload nginx

# Verify:
curl -s https://persiantoolbox.ir/api/health | grep '"status":"ok'
```

```bash
# If green (3003) is broken → switch to blue (3000):
echo 'upstream persiantoolbox { server 127.0.0.1:3000; }' | sudo tee /etc/nginx/conf.d/persiantoolbox-upstream.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Step 8 — If nothing works: cold restart

```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
sleep 5
pm2 status
curl -s https://persiantoolbox.ir/api/health
```

---

## 2. Performance Degradation

**Severity**: P2 · **Response**: < 30 minutes

### Step 1 — Check Core Web Vitals

```bash
# Check if pages load slow (from your local machine):
for page in "/" "/blog" "/tools" "/pricing"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" --max-time 30 "https://persiantoolbox.ir${page}")
  echo "${page}: ${CODE}"
done
# Any page > 5s is degraded; > 15s is critical
```

### Step 2 — Check server resources

```bash
ssh ubuntu@193.93.169.32
top -bn1 | head -20        # CPU load
free -h                     # Memory
df -h /                     # Disk
```

**Thresholds:**
| Resource | Warning | Critical |
|----------|---------|----------|
| CPU load | > 2.0 | > 4.0 |
| Memory | > 80% | > 90% |
| Disk | > 80% | > 90% |
| Swap | > 50% | > 70% |

**If memory high (>80%):**
```bash
pm2 restart persiantoolbox   # Clears memory
free -h                       # Verify drop
```

**If disk high (>80%):**
```bash
# Clean old logs
sudo find /var/log/nginx/ -name "*.gz" -mtime +30 -delete
pm2 flush
sudo journalctl --vacuum-time=7d

# Check backup size
du -sh /home/ubuntu/persiantoolbox/backups/
```

### Step 3 — Check PM2 process health

```bash
pm2 monit
# Or detailed:
pm2 show persiantoolbox
pm2 logs persiantoolbox --lines 50
```

Look for:
- High restart count → process is unstable
- Memory climbing toward 1G → will be OOM-killed
- Error lines in logs → check the error

### Step 4 — Check database queries

```bash
# PostgreSQL active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Long-running queries (>5s)
sudo -u postgres psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';"

# Connection pool (if using pgbouncer or similar)
sudo systemctl status pgbouncer 2>/dev/null
```

### Step 5 — Check external services

```bash
# Redis
redis-cli ping

# Google APIs (if analytics/GA4 calls slow)
curl -s -o /dev/null -w "%{http_code}:%{time_total}" https://www.google-analytics.com

# If using external CDN or font services
curl -s -o /dev/null -w "%{http_code}:%{time_total}" https://fonts.googleapis.com
```

### Step 6 — Check nginx metrics

```bash
# Active connections
sudo nginx -T | grep -i "worker_connections"

# Nginx cache hit rate
sudo grep -c "X-Cache-Status: HIT" /var/log/nginx/access.log 2>/dev/null
sudo grep -c "X-Cache-Status:" /var/log/nginx/access.log 2>/dev/null

# Slow request log (if configured)
sudo tail -50 /var/log/nginx/slow.log 2>/dev/null
```

---

## 3. Security Incident

**Severity**: P1 · **Response**: immediate · **Isolate first, then investigate**

### Step 1 — Isolate affected systems

```bash
# Block all inbound except SSH (emergency lockdown)
sudo ufw default deny incoming
sudo ufw allow from YOUR_IP to any port 22
sudo ufw enable

# Or block specific IPs
sudo ufw deny from ATTACKER_IP
```

### Step 2 — Preserve evidence

```bash
# Create forensic snapshot (do NOT reboot)
sudo cp -a /var/log/nginx /tmp/nginx-logs-$(date +%Y%m%d)
sudo cp -a /home/ubuntu/.pm2/logs /tmp/pm2-logs-$(date +%Y%m%d)
sudo cp -a /var/log/auth.log /tmp/auth-$(date +%Y%m%d)

# Full process snapshot
ps aux > /tmp/processes-$(date +%Y%m%d).txt
netstat -tlnp > /tmp/ports-$(date +%Y%m%d).txt

# Recent login attempts
sudo last -50 > /tmp/logins-$(date +%Y%m%d).txt
sudo journalctl --since "1 hour ago" -u ssh > /tmp/ssh-log-$(date +%Y%m%d).txt
```

### Step 3 — Notify stakeholders

```bash
# Send alert (adapt to your channel)
# Telegram:
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id="${TELEGRAM_CHAT_ID}" \
  -d text="⚠️ Security incident detected on persiantoolbox.ir — investigating now"
```

### Step 4 — Investigate

```bash
# Check for unauthorized SSH keys
cat ~/.ssh/authorized_keys

# Check for unusual processes
ps aux | grep -v '\[' | awk '{print $11}' | sort -u

# Check for modified system files
find /etc -mmin -60 -type f 2>/dev/null

# Check nginx for unusual access patterns
sudo grep -E "(POST|PUT|DELETE)" /var/log/nginx/access.log | tail -20

# Check for brute force
sudo grep "Failed password" /var/log/auth.log | tail -20
sudo grep "Invalid user" /var/log/auth.log | tail -20

# Check fail2ban status
sudo fail2ban-client status
```

### Step 5 — Remediation

| Finding | Action |
|---------|--------|
| Unauthorized SSH key | Remove from `~/.ssh/authorized_keys` |
| Suspicious process | `kill -9 PID` and investigate |
| Brute force | `sudo fail2ban-client set sshd banip ATTACKER_IP` |
| Compromised config | Restore from backup: `git checkout HEAD -- <file>` |
| Suspected DB access | Change DB password, check pg_stat_activity |
| Malware detected | Isolate → image disk → rebuild from clean backup |

### Step 6 — Restore access controls

```bash
# After investigation, restore normal UFW rules
sudo ufw delete deny from ATTACKER_IP
sudo ufw status
```

### Step 7 — Post-incident

- Document timeline in `docs/ops/incident-YYYY-MM-DD.md`
- Rotate all credentials if compromise confirmed
- Review and update security measures
- Update this runbook if new attack vector discovered

---

## 4. Data Loss

**Severity**: P1 · **Response**: immediate

### Step 1 — Assess the damage

```bash
# What data is affected?
# - User data in PostgreSQL?
# - Site content (Next.js build)?
# - Configuration (.env)?
# - Backups themselves?

# Check if PostgreSQL is accessible
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -d persiantoolbox -c "\dt"  # List tables
```

### Step 2 — Check available backups

```bash
# Local backups
ls -lt /home/ubuntu/persiantoolbox/backups/
# Backups are created daily at 3 AM via cron

# Remote backups (if configured)
ls -lt /home/ubuntu/persiantoolbox/backups/remote/ 2>/dev/null
```

### Step 3 — Restore from backup

**Database restore:**
```bash
# List backup files
ls -lt /home/ubuntu/persiantoolbox/backups/*.sql.gz

# Restore specific backup
LATEST_BACKUP=$(ls -t /home/ubuntu/persiantoolbox/backups/*.sql.gz | head -1)
gunzip -c "$LATEST_BACKUP" | sudo -u postgres psql -d persiantoolbox
```

**Full file restore:**
```bash
# Find latest backup
ls -lt /home/ubuntu/persiantoolbox/backups/

# Restore files
BACKUP_DIR=$(ls -d /home/ubuntu/persiantoolbox/backups/persiantoolbox-backup-* | head -1)
sudo cp -a "$BACKUP_DIR"/* /home/ubuntu/persiantoolbox/

# Rebuild
cd /home/ubuntu/persiantoolbox
pnpm install
pnpm build
pm2 restart persiantoolbox
```

### Step 4 — Verify restoration

```bash
# Health check
curl -s https://persiantoolbox.ir/api/health

# Database check
sudo -u postgres psql -d persiantoolbox -c "SELECT count(*) FROM users;"
sudo -u postgres psql -d persiantoolbox -c "SELECT count(*) FROM sessions;"

# Spot-check key pages
for page in "/" "/blog" "/tools"; do
  curl -s -o /dev/null -w "${page}: %{http_code}\n" "https://persiantoolbox.ir${page}"
done
```

### Step 5 — Prevent recurrence

```bash
# Verify cron backup job is active
crontab -l | grep backup

# Verify backup integrity (check file sizes are reasonable)
ls -lh /home/ubuntu/persiantoolbox/backups/*.sql.gz
```

---

## 5. Quick Reference — Common Commands

```bash
# PM2
pm2 status                          # Process list
pm2 restart persiantoolbox          # Restart production
pm2 logs persiantoolbox --lines 50  # Recent logs
pm2 monit                           # Live monitoring
pm2 save                            # Save process list

# Nginx
sudo nginx -t                       # Test config
sudo systemctl reload nginx         # Reload config
sudo systemctl restart nginx        # Full restart
sudo tail -f /var/log/nginx/error.log  # Watch errors

# Database
sudo -u postgres psql -d persiantoolbox  # Connect to DB
sudo systemctl restart postgresql        # Restart PG

# SSL
sudo certbot renew --force-renewal       # Force SSL renewal
sudo certbot certificates                # Check cert status

# Health
curl -s https://persiantoolbox.ir/api/health
bash health-monitor.sh                   # Run full health check

# Logs
pm2 logs persiantoolbox --err --lines 100   # Error logs
sudo journalctl -u nginx --since "1 hour ago"  # Nginx journal
```

---

## 6. Escalation Matrix

| Severity | Condition | Action |
|----------|-----------|--------|
| P1 | Site completely down | Immediate SSH, all steps above |
| P1 | Data breach detected | Isolate + preserve + notify |
| P2 | Pages slow (>5s) | Check resources, restart PM2 |
| P2 | API errors increasing | Check logs, restart if needed |
| P3 | Minor CSS/asset 404 | Purge nginx cache |
| P3 | Non-critical feature broken | Schedule fix, document |

---

## 7. Post-Incident Checklist

- [ ] Incident timeline documented in `docs/ops/incident-YYYY-MM-DD.md`
- [ ] Root cause identified
- [ ] Fix applied and verified
- [ ] Runbook updated if new scenario discovered
- [ ] Stakeholders notified of resolution
- [ ] Backups verified as intact
- [ ] Monitoring thresholds reviewed
