#!/bin/bash
# security-audit.sh — Run security checks on VPS
# Usage: bash scripts/automation/security-audit.sh
set -e

SSH_KEY="/home/dev13/.ssh/id_ed25519"
VPS="193.93.169.32"
USER="ubuntu"

echo "=== Security Audit ==="
echo "Time: $(date)"
echo ""

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$VPS" bash -s <<REMOTE
echo "1. SSH Config"
echo "   Password auth: \$(sudo sshd -T 2>/dev/null | grep passwordauthentication | awk '{print \$2}')"
echo "   Pubkey auth: \$(sudo sshd -T 2>/dev/null | grep pubkeyauthentication | awk '{print \$2}')"
echo "   MaxAuthTries: \$(sudo sshd -T 2>/dev/null | grep maxauthtries | awk '{print \$2}')"
echo "   X11: \$(sudo sshd -T 2>/dev/null | grep x11forwarding | awk '{print \$2}')"

echo ""
echo "2. fail2ban"
sudo fail2ban-client status sshd 2>/dev/null | grep -E "Currently|Total|Banned" || echo "   Not running"

echo ""
echo "3. UFW Firewall"
sudo ufw status | grep -E "22|80|443"

echo ""
echo "4. Open ports (external)"
ss -tlnp 2>/dev/null | grep -v '127.0.0' | awk '{print "   "\$4" "\$6}'

echo ""
echo "5. Failed SSH attempts (24h)"
sudo journalctl -u ssh --since '24 hours ago' 2>/dev/null | grep -c 'Failed' | xargs -I{} echo "   {} failed attempts"

echo ""
echo "6. SSL Certificate"
echo | openssl s_client -connect persiantoolbox.ir:443 -servername persiantoolbox.ir 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | sed 's/^/   /'

echo ""
echo "7. Disk usage"
df -h / | tail -1 | awk '{print "   "$5" used ("$3" / "$2")"}'

echo ""
echo "8. Unattended upgrades"
systemctl is-active unattended-upgrades 2>/dev/null | sed 's/^/   Status: /'
REMOTE

echo ""
echo "=== Audit complete ==="
