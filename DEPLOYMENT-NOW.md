# 🚀 PersianToolbox VPS Deployment - Step by Step Guide

## Phase 1: Manual SSH Key Setup (One-time only)

### Step 1: Login to VPS

```bash
ssh ubuntu@193.93.169.247
# Password: ArAd@#!23662366
```

### Step 2: Setup SSH Key Directory

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### Step 3: Add Public Key

```bash
nano ~/.ssh/authorized_keys
```

Copy this public key:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDD9avbD5uIgMGmEB2GIb2LdIxas4+YzRv6xLX0w6+fCyCzhvduRq/BUj189qsQ2+4qGTsn3Qh3BN1zbFEM160lrmGKvKiOjN3FaLQXxdQU2gpUBrGbmRjQnwg3pHjU0Y6S+iANe8SvQOPDP9CEaAJaJuSPbbayn/gK2LM+cQm9+NjJ3xoCdKr3k15a+tKTmXXmH5gYzrbZrBPBSURxfRN/48hVtXSS6wF9sAc9zcF88sYxeU1SDOeoWYAwpXEJZvsjunyCXuJd0wlYB+MSPT0DvXgEKSoqiJrKWXCVoBzW2pyoJeh77R7dGpi4SH/NPlXAtdvXF6MnXwE7bsphTuaoMXD2dED1mRYR1vhy54k6hrk86i9bLiUZffCc1bWSOxxU0J075SwFpNbepc21MDjwUvChMsX73ELo89vR1/DmNhuo7KJH619/U/1oMKo5/KB6XU61XXbNvpUyyuN0SOM1ehnvlMBpHEzSrFRO5aWqI7VJ7d5CiC7GDzKbEgy8q6/TA1F9GW/6ct90NWfnaSV5Ws/GkNY9EX0oJ2FOppeWazjRVZznw346HM1ew+vphWvk1XLtKJZ9N1I1lgrbZRrHGc2fMhyytIFPjjLIdFH9qLS3IHi3fUBYSP+zjECtTV+9/TXM5YhOZ99KjtZQp1e1OOGD1jTvLlOiyfDJwJRVJQ== persiantoolbox@asdev
```

### Step 4: Set Permissions

```bash
chmod 600 ~/.ssh/authorized_keys
```

### Step 5: Exit VPS

```bash
exit
```

### Step 6: Test Passwordless SSH

```bash
ssh ubuntu@193.93.169.247
```

If successful, you won't be asked for password.

## Phase 2: Automated Deployment (Run from local machine)

After SSH key is setup, run the automated deployment:

```bash
./deploy-interactive.sh
```

This will automatically:

- ✅ Update VPS system
- ✅ Install Node.js, pnpm, PM2
- ✅ Copy project files
- ✅ Setup environment configuration
- ✅ Install dependencies
- ✅ Build production bundle
- ✅ Setup PM2 process manager
- ✅ Configure systemd auto-start
- ✅ Configure firewall
- ✅ Setup Nginx reverse proxy
- ✅ Test deployment

## Phase 3: DNS Configuration

After successful deployment, configure DNS:

1. Go to your DNS provider
2. Point `persiantoolbox.ir` → `193.93.169.247`
3. Point `www.persiantoolbox.ir` → `193.93.169.247`

## Phase 4: SSL Setup (Recommended)

```bash
# SSH to VPS
ssh ubuntu@193.93.169.247

# Setup SSL
sudo certbot --nginx -d persiantoolbox.ir -d www.persiantoolbox.ir
```

## Phase 5: Monitoring

```bash
# PM2 status
ssh ubuntu@193.93.169.247 'pm2 status'

# PM2 logs
ssh ubuntu@193.93.169.247 'pm2 logs persiantoolbox'

# PM2 monitor
ssh ubuntu@193.93.169.247 'pm2 monit'

# Restart application
ssh ubuntu@193.93.169.247 'pm2 restart persiantoolbox'

# Check Nginx status
ssh ubuntu@193.93.169.247 'sudo systemctl status nginx'

# Check systemd status
ssh ubuntu@193.93.169.247 'sudo systemctl status persiantoolbox'
```

## Quick Reference

### Access URLs

- **Direct:** http://193.93.169.247:3000
- **Nginx:** http://193.93.169.247
- **Production:** https://persiantoolbox.ir (after DNS + SSL)

### Important Commands

```bash
# SSH to VPS
ssh ubuntu@193.93.169.247

# Update application
ssh ubuntu@193.93.169.247 'cd ~/persiantoolbox && git pull && pnpm install && pnpm build && pm2 restart persiantoolbox'

# Check logs
ssh ubuntu@193.93.169.247 'pm2 logs persiantoolbox --lines 50'

# Backup database
ssh ubuntu@193.93.169.247 'cp ~/persiantoolbox/.data/persiantoolbox.db ~/backup_$(date +%Y%m%d).db'
```

## Troubleshooting

### SSH Connection Issues

```bash
# Check SSH key permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Application Not Starting

```bash
# Check PM2 logs
ssh ubuntu@193.93.169.247 'pm2 logs persiantoolbox'

# Check build errors
ssh ubuntu@193.93.169.247 'cd ~/persiantoolbox && pnpm build'

# Restart application
ssh ubuntu@193.93.169.247 'pm2 restart persiantoolbox'
```

### Nginx Issues

```bash
# Check Nginx status
ssh ubuntu@193.93.169.247 'sudo systemctl status nginx'

# Check Nginx error logs
ssh ubuntu@193.93.169.247 'sudo tail -f /var/log/nginx/error.log'

# Test Nginx config
ssh ubuntu@193.93.169.247 'sudo nginx -t'
```

### Firewall Issues

```bash
# Check firewall status
ssh ubuntu@193.93.169.247 'sudo ufw status'

# Allow specific port
ssh ubuntu@193.93.169.247 'sudo ufw allow 3000/tcp'
```

## Security Notes

1. ✅ SSH key authentication enabled
2. ✅ Firewall configured
3. ✅ PM2 auto-restart enabled
4. ✅ Systemd auto-start enabled
5. ⏳ SSL证书 (recommended)
6. ⏳ Password authentication disabled (after SSL is confirmed working)

## Backup Strategy

```bash
# Add to cron for daily backups (on VPS)
crontab -e

# Add this line:
0 2 * * * cp /home/ubuntu/persiantoolbox/.data/persiantoolbox.db /home/ubuntu/backup_$(date +\%Y\%m\%d).db
```

## Completion Checklist

- [ ] SSH key setup completed
- [ ] Automated deployment executed
- [ ] Application running (http://193.93.169.247)
- [ ] PM2 process active
- [ ] Systemd service enabled
- [ ] Firewall configured
- [ ] Nginx reverse proxy working
- [ ] DNS configured (persiantoolbox.ir → 193.93.169.247)
- [ ] SSL certificate installed (persiantoolbox.ir)
- [ ] Application accessible via https://persiantoolbox.ir
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

**Ready to deploy?**

1. **Phase 1:** Setup SSH key manually (one-time)
2. **Phase 2:** Run `./deploy-interactive.sh` (automated)
3. **Phase 3:** Configure DNS
4. **Phase 4:** Setup SSL
5. **Phase 5:** Monitor and maintain

**Estimated time:** 15-30 minutes for complete deployment
