# Hardening Checklist Report (2026-02-16)

## Scope
- Script review: `scripts/deploy/bootstrap-ubuntu-vps.sh`
- Runtime config review: `ops/nginx/persian-tools.conf`, `ops/systemd/persian-tools-production.service`, `ops/systemd/persian-tools-staging.service`

## Findings
- [x] Firewall hardening commands present (`ufw allow OpenSSH`, `ufw allow Nginx Full`, `ufw --force enable`)
- [x] `fail2ban` install and enable present
- [x] Nginx and PostgreSQL service enablement present
- [x] Dedicated deploy user flow present (`DEPLOY_USER`, `chown` on app base dir)
- [x] PM2 runtime + systemd units exist for production/staging
- [x] Nginx upstream split exists for production/staging ports

## Risks / Gaps
- [ ] TLS issuance/check automation is documented but not codified in bootstrap (manual step remains)
- [ ] Production-grade secret provisioning still external to bootstrap (expected)

## Decision
- Status: `pass-with-manual-followups`
