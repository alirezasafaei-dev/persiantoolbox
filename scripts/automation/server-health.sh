#!/bin/bash
# server-health.sh — Run on VPS to check local services
# Usage: ssh VPS "bash /home/ubuntu/persiantoolbox/scripts/automation/server-health.sh"
set -e

echo "=== VPS Health Check ==="
echo "Time: $(date)"
echo ""

# PM2
echo "--- PM2 ---"
pm2 list 2>/dev/null | grep -E "name|persiantoolbox|alirezasafaei|auditsystems"

# PostgreSQL
echo ""
echo "--- PostgreSQL ---"
pg_isready 2>/dev/null && echo "✅ PostgreSQL: accepting connections" || echo "❌ PostgreSQL: not ready"

# Redis
echo ""
echo "--- Redis ---"
redis-cli ping 2>/dev/null | grep -q PONG && echo "✅ Redis: PONG" || echo "❌ Redis: not responding"

# Disk
echo ""
echo "--- Disk ---"
df -h / | tail -1 | awk '{print "Usage: "$5" ("$3" used / "$2" total)"}'

# Memory
echo ""
echo "--- Memory ---"
free -h | awk '/^Mem:/{print "Usage: "$3" used / "$2" total ("$3/$2*100"% used)"}'

# Uptime
echo ""
echo "--- Uptime ---"
uptime

# fail2ban
echo ""
echo "--- fail2ban ---"
sudo fail2ban-client status sshd 2>/dev/null | grep -E "Currently|Total|Banned" || echo "fail2ban not running"

# Nginx
echo ""
echo "--- Nginx ---"
sudo nginx -t 2>&1 | tail -1

# Health endpoint
echo ""
echo "--- Health Endpoint ---"
curl -s http://localhost:3000/api/health 2>/dev/null | head -1 || echo "❌ App not responding"

echo ""
echo "=== Check complete ==="
