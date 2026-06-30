#!/bin/bash
# ssl-monitor.sh — Check SSL certificate expiry and alert
# Run daily via cron: 0 9 * * * /home/ubuntu/persiantoolbox/ssl-monitor.sh
# Also checkable from local: bash scripts/automation/ssl-monitor.sh

set -e

SITE="persiantoolbox.ir"
LOG="${HOME}/.pm2/logs/ssl-monitor.log"
ALERT_LOG="${HOME}/.pm2/logs/health-alerts.log"
mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
EXIT_CODE=0

check_ssl() {
  local host="$1"
  local port="${2:-443}"

  SSL_INFO=$(echo | openssl s_client -connect "${host}:${port}" -servername "$host" 2>/dev/null)
  SSL_EXPIRY=$(echo "$SSL_INFO" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  SSL_ISSUER=$(echo "$SSL_INFO" | openssl x509 -noout -issuer 2>/dev/null | sed 's/issuer=//')
  SSL_SUBJECT=$(echo "$SSL_INFO" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//')

  if [ -z "$SSL_EXPIRY" ]; then
    echo "[$TIMESTAMP] 🔴 SSL: Could not check certificate for $host" >> "$LOG"
    echo "[$TIMESTAMP] 🔴 SSL: Could not check certificate for $host" >> "$ALERT_LOG"
    EXIT_CODE=1
    return
  fi

  EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

  if [ "$DAYS_LEFT" -lt 7 ]; then
    echo "[$TIMESTAMP] 🔴 CRITICAL: SSL expires in $DAYS_LEFT days ($SSL_EXPIRY) for $host" >> "$LOG"
    echo "[$TIMESTAMP] 🔴 CRITICAL: SSL expires in $DAYS_LEFT days ($SSL_EXPIRY) for $host" >> "$ALERT_LOG"
    EXIT_CODE=1
  elif [ "$DAYS_LEFT" -lt 30 ]; then
    echo "[$TIMESTAMP] ⚠️  WARNING: SSL expires in $DAYS_LEFT days ($SSL_EXPIRY) for $host" >> "$LOG"
    echo "[$TIMESTAMP] ⚠️  WARNING: SSL expires in $DAYS_LEFT days ($SSL_EXPIRY) for $host" >> "$ALERT_LOG"
  else
    echo "[$TIMESTAMP] ✅ SSL: $DAYS_LEFT days remaining (expires $SSL_EXPIRY) — $host" >> "$LOG"
  fi
}

# Check main site
check_ssl "$SITE"

# Also verify certificate chain
VERIFY=$(echo | openssl s_client -connect "${SITE}:443" -servername "$SITE" 2>/dev/null | grep "Verify return code")
if echo "$VERIFY" | grep -q "0 (ok)"; then
  echo "[$TIMESTAMP] ✅ SSL chain: verified" >> "$LOG"
else
  echo "[$TIMESTAMP] ⚠️  SSL chain: $VERIFY" >> "$LOG"
fi

# Check HTTP → HTTPS redirect
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://${SITE}/" 2>/dev/null)
if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "[$TIMESTAMP] ✅ HTTP→HTTPS redirect: HTTP $HTTP_CODE" >> "$LOG"
else
  echo "[$TIMESTAMP] ⚠️  HTTP→HTTPS redirect: HTTP $HTTP_CODE (expected 301/302)" >> "$LOG"
fi

exit $EXIT_CODE
