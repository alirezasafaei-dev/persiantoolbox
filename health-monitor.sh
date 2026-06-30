#!/bin/bash
# health-monitor.sh — Run via cron to monitor site health
# Checks: PM2, health endpoint, CSS, SSL, disk, memory, restarts if needed
# Add to crontab: */5 * * * * /home/ubuntu/persiantoolbox/health-monitor.sh >> /home/ubuntu/.pm2/logs/health-monitor.log 2>&1

LOG="/home/ubuntu/.pm2/logs/health-monitor.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ALERT_FILE="/home/ubuntu/.pm2/logs/health-alerts.log"
ISSUES=0

log_ok() { echo "[$TIMESTAMP] ✅ $1" >> "$LOG"; }
log_warn() { echo "[$TIMESTAMP] ⚠️  $1" >> "$LOG"; ISSUES=$((ISSUES + 1)); }
log_alert() { echo "[$TIMESTAMP] 🔴 $1" >> "$ALERT_FILE"; echo "[$TIMESTAMP] 🔴 $1" >> "$LOG"; ISSUES=$((ISSUES + 1)); }

# 1. PM2 process status
STATUS=$(pm2 show persiantoolbox 2>/dev/null | grep "status" | awk '{print $4}')
UPTIME=$(pm2 show persiantoolbox 2>/dev/null | grep "uptime" | awk '{print $4}')
MEM=$(pm2 show persiantoolbox 2>/dev/null | grep "memory" | awk '{print $4}')

if [ "$STATUS" != "online" ]; then
  log_alert "PM2 status: $STATUS — restarting..."
  pm2 restart persiantoolbox 2>/dev/null
  sleep 5
  NEW_STATUS=$(pm2 show persiantoolbox 2>/dev/null | grep "status" | awk '{print $4}')
  if [ "$NEW_STATUS" = "online" ]; then
    log_ok "PM2 restart successful"
  else
    log_alert "PM2 restart FAILED — status still: $NEW_STATUS"
  fi
else
  log_ok "PM2: status=$STATUS uptime=${UPTIME}s mem=$MEM"
fi

# 2. Health endpoint
HEALTH=$(curl -s --connect-timeout 5 --max-time 10 http://127.0.0.1:3000/api/health 2>/dev/null)
if [ -z "$HEALTH" ] || ! echo "$HEALTH" | grep -q '"status":"ok"'; then
  log_alert "Health endpoint failed — restarting PM2..."
  pm2 restart persiantoolbox 2>/dev/null
  sleep 5
else
  VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('version','?'))" 2>/dev/null || echo "?")
  UPTIME_S=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('uptime',0))" 2>/dev/null || echo "0")
  log_ok "Health: v${VERSION}, uptime=${UPTIME_S}s"
fi

# 3. CSS served correctly
CSS_FILE=$(curl -s --connect-timeout 5 http://127.0.0.1:3000/ 2>/dev/null | grep -oP 'href="/_next/static/chunks/[^"]*\.css"' | head -1 | grep -oP '/_next/[^"]+')
if [ -n "$CSS_FILE" ]; then
  CSS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:3000${CSS_FILE}" 2>/dev/null)
  if [ "$CSS_HTTP" = "200" ]; then
    log_ok "CSS: HTTP 200"
  else
    log_alert "CSS: HTTP $CSS_HTTP — site may load without styles!"
  fi
else
  log_warn "CSS: not found in HTML"
fi

# 4. PDF worker served
WORKER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://127.0.0.1:3000/pdf.worker.min.mjs 2>/dev/null)
if [ "$WORKER_HTTP" = "200" ]; then
  log_ok "PDF worker: HTTP 200"
else
  log_warn "PDF worker: HTTP $WORKER_HTTP"
fi

# 5. Disk usage
DISK_PCT=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_PCT" -gt 90 ]; then
  log_alert "Disk usage critical: ${DISK_PCT}%"
elif [ "$DISK_PCT" -gt 80 ]; then
  log_warn "Disk usage high: ${DISK_PCT}%"
else
  log_ok "Disk: ${DISK_PCT}% used"
fi

# 6. Memory usage
MEM_PCT=$(free | awk '/^Mem:/{printf "%.0f", $3/$2*100}')
if [ "${MEM_PCT:-0}" -gt 90 ]; then
  log_alert "Memory usage critical: ${MEM_PCT}%"
elif [ "${MEM_PCT:-0}" -gt 80 ]; then
  log_warn "Memory usage high: ${MEM_PCT}%"
else
  log_ok "Memory: ${MEM_PCT}% used"
fi

# 7. Swap usage
SWAP_PCT=$(free | awk '/^Swap:/{if($2>0) printf "%.0f",$3/$2*100; else print "0"}')
if [ "${SWAP_PCT:-0}" -gt 50 ]; then
  log_warn "Swap usage high: ${SWAP_PCT}%"
else
  log_ok "Swap: ${SWAP_PCT}% used"
fi

# 8. SSL certificate expiry (check daily — only at minute 0)
MINUTE=$(date +%M)
if [ "$MINUTE" = "00" ]; then
  SSL_EXPIRY=$(echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -n "$SSL_EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -lt 7 ]; then
      log_alert "SSL expires in $DAYS_LEFT days: $SSL_EXPIRY"
    elif [ "$DAYS_LEFT" -lt 30 ]; then
      log_warn "SSL expires in $DAYS_LEFT days: $SSL_EXPIRY"
    else
      log_ok "SSL: $DAYS_LEFT days remaining"
    fi
  else
    log_warn "SSL: could not check expiry"
  fi
fi

# 9. PostgreSQL
pg_isready 2>/dev/null >/dev/null && log_ok "PostgreSQL: accepting connections" || log_warn "PostgreSQL: not ready"

# 10. Redis
redis-cli ping 2>/dev/null | grep -q PONG && log_ok "Redis: PONG" || log_warn "Redis: not responding"

# Summary
if [ "$ISSUES" -gt 0 ]; then
  log_warn "Monitor complete — $ISSUES issue(s) found"
else
  log_ok "Monitor complete — all clear"
fi
