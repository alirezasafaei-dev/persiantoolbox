#!/bin/bash
# health-monitor.sh — Run via cron to monitor site health
# Checks: PM2 process, health endpoint, restarts if needed
# Add to crontab: */5 * * * * /home/ubuntu/persiantoolbox/health-monitor.sh >> /home/ubuntu/.pm2/logs/health-monitor.log 2>&1

LOG="/home/ubuntu/.pm2/logs/health-monitor.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Check PM2 process status
STATUS=$(pm2 show persiantoolbox 2>/dev/null | grep "status" | awk '{print $4}')
UPTIME=$(pm2 show persiantoolbox 2>/dev/null | grep "uptime" | awk '{print $4}')

# Check health endpoint
HEALTH=$(curl -s --connect-timeout 5 --max-time 10 http://127.0.0.1:3000/api/health 2>/dev/null)

if [ "$STATUS" != "online" ]; then
  echo "[$TIMESTAMP] ⚠️  PM2 status: $STATUS — restarting..." >> "$LOG"
  pm2 restart persiantoolbox 2>/dev/null
  exit 1
fi

if [ -z "$HEALTH" ] || ! echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "[$TIMESTAMP] ⚠️  Health check failed — restarting PM2..." >> "$LOG"
  pm2 restart persiantoolbox 2>/dev/null
  exit 1
fi

# Check memory usage
MEM=$(pm2 show persiantoolbox 2>/dev/null | grep "memory" | awk '{print $4}')
echo "[$TIMESTAMP] ✅ OK — status=$STATUS uptime=${UPTIME}s mem=$MEM" >> "$LOG"
