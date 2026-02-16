# Env Contract Audit (2026-02-16)

## Required Keys (Production Contract)
- `NEXT_PUBLIC_SITE_URL`: production=yes, staging=yes
- `DATABASE_URL`: production=yes, staging=yes
- `SESSION_TTL_DAYS`: production=yes, staging=yes
- `SUBSCRIPTION_WEBHOOK_SECRET`: production=yes, staging=yes
- `ADMIN_EMAIL_ALLOWLIST`: production=yes, staging=yes

## Notes
- Source contract: `docs/deployment-readiness-gates.json`
- Checked files: `.env.production.real`, `.env.staging.real`
- Audit scope is key presence only (value strength and secret management are out of scope here).
