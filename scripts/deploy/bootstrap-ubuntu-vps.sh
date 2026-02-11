#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "[bootstrap] run as root: sudo bash scripts/deploy/bootstrap-ubuntu-vps.sh" >&2
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
BASE_DIR="${BASE_DIR:-/var/www/persian-tools}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "[bootstrap] updating apt index"
apt update

echo "[bootstrap] installing base packages"
apt install -y nginx postgresql postgresql-contrib curl git rsync ufw fail2ban ca-certificates gnupg

echo "[bootstrap] installing Node.js ${NODE_MAJOR}.x"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt install -y nodejs

echo "[bootstrap] enabling corepack"
corepack enable || true
corepack prepare pnpm@9.15.0 --activate || true

echo "[bootstrap] installing pm2"
npm install -g pm2

if ! id -u "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "[bootstrap] creating user ${DEPLOY_USER}"
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi

echo "[bootstrap] creating app directories"
mkdir -p "${BASE_DIR}/releases" "${BASE_DIR}/current" "${BASE_DIR}/shared/env" "${BASE_DIR}/shared/logs" "${BASE_DIR}/tmp"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${BASE_DIR}"

echo "[bootstrap] hardening firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "[bootstrap] enabling services"
systemctl enable nginx
systemctl enable postgresql
systemctl enable fail2ban

cat <<INFO
[bootstrap] completed.

Next steps:
1. Configure DNS for persian-tools.ir and staging.persian-tools.ir.
2. Copy Nginx config from ops/nginx/persian-tools.conf and reload nginx.
3. Run certbot for TLS certificates.
4. Create Postgres users/databases for staging and production.
5. Add GitHub deploy secrets and trigger deploy-staging workflow.
INFO
