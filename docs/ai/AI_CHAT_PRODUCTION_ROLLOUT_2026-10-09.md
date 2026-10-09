# PersianToolbox AI Chat — Controlled Production Rollout Gates (2026-10-09)

Canonical repository: https://github.com/alirezasafaei-dev/persiantoolbox
Source already merged from integration PR #213, main SHA c7d96483d211df46da200dc3c3af69c1930fbc27.

## Independent preflight observations

- Current live production SHA at 2026-10-09 08:56 UTC: 57729e23342c2090e744ab62d4ae53c138a8e2bd. Health and PostgreSQL healthy.
- Current protected production env (0600): DATABASE_URL is set; AI_CLOUDFLARE_ACCOUNT_ID, AI_CLOUDFLARE_TOKEN, AI_VISITOR_SECRET, FEATURE_AI_CHAT_ENABLED, and AI_CLOUDFLARE_FREE_PLAN_CONFIRMED are absent.
- Actual production database persian_tools: public.ai_chat_quota absent, verified read-only using its protected DATABASE_URL.
- Owner-provided local token: token verification HTTP 200 active; Cloudflare Account and Subscriptions/Billing read-only API queries HTTP 403. No provider billing tier independently verified.
- Five retained blue/green release directories; active and previous release remain protected after cleanup.

## Corrected migration gate

The previous canonical pnpm db:migrate script applied scripts/db/schema.sql only and did not apply db/migrations/20261008_ai_chat_quota.sql. The amended runner applies both SQL files transactionally with a 5-second lock timeout, explicit rollback on errors, and no changes to the existing migration trigger.

The production blue-green engine calls pnpm db:migrate only when run_migrations=true is explicitly authorized. This corrected runner therefore makes the AI table part of that existing approved migration gate; do not run an independent unreviewed production SQL path.

Nonproduction PostgreSQL 16 proof: canonical script ran successfully twice on an isolated temporary database; table present with the three expected columns; temporary DB and login were dropped afterward. No production schema changes.

## Required distinct owner gates (do not collapse)

1. Approve production backup, protected env installation and schema migration separately. Obtain a fresh validated PostgreSQL backup and maintain an independent rollback plan. Before migration, review the final exact main SHA and verify it includes the corrected migration.
2. Configure protected system-only AI account ID, the dedicated Workers AI token, a newly generated high-entropy AI_VISITOR_SECRET, FEATURE_AI_CHAT_ENABLED=false, and AI_CLOUDFLARE_FREE_PLAN_CONFIRMED only following fresh owner confirmation. Never print/copy tokens, or commit environment files.
3. Separately authorize the immutable SHA blue-green production deployment using only the canonical workflow with run_migrations=true, with chat OFF and strict asset and live browser verification. No force-push, in-place build, or bypass of deployment lock.
4. Immediately prior to any public activation, the owner must inspect the Cloudflare dashboard and reconfirm Workers Free, no billable AI Gateway and the least-privilege account token. API checks currently return HTTP 403; do not claim API_VERIFIED or ZERO_PAID_API_RISK_CONFIRMED.
5. Separately authorize the public feature activation, with real Persian response from Iran, signed-cookie and quota limits, browser/mobile accessibility, 429 behavior, monitoring, and a rollback path. A new canonical deploy may be needed for flag changes; never live-patch running slot env or restart PM2 outside the documented deployment process.

## No-go conditions

- No confirmed Workers Free or scope; paid account or AI Gateway usage.
- Public flag true before the protected token, visitor secret, database migration, and all owner approvals.
- Non-green exact-head CI, production health regression, backup verification failure, insufficient capacity, or a production lock conflict.
- Mixing unmerged PR branches or assuming documentation-only PR #214 changes the production application.

As of this document: migration wiring is corrected and locally verified, but production migration, protected env modification, deployment and public activation remain NOT_RUN. This branch is a proposal and cannot authorize production operations.
