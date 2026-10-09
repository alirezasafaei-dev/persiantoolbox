# PersianToolbox AI Chat — Controlled Production Rollout Gates (2026-10-09)

> **CURRENT RELEASE STATUS — as observed 2026-10-09 19:57 UTC:** Production deployment and real Persian chat acceptance **PASSED WITH WARNINGS** on SHA `cf370c54afc31e7ececc9f384f572e907a08443b`, active Blue:3000, retained Green:3004. This later outcome **supersedes the preflight-only, OFF/not-deployed observations below**; those are retained as historical rollout evidence. See [the 19:57 UTC live-verification report](../reports/live-verification/20261009-1957-persiantoolbox.md) and [successful GitHub workflow attempt 3](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/37962079002).

## Verified final rollout (2026-10-09 19:57 UTC)

- **PRODUCTION_DEPLOYED: YES.** `/api/version` returned `cf370c54afc31e7ececc9f384f572e907a08443b`; `/api/health` reported ready; `persiantoolbox-blue` active on port 3000; previous `persiantoolbox-green` and old SHA `07adf70d448656e83e226b7784d0cfb64de64694` retained for rollback.
- **PUBLIC_AI_CHAT_ENABLED: YES.** Protected flags `FEATURE_AI_CHAT_ENABLED=true` and `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true` were present with environment permissions `0600`. Browser-origin repair is PR [#218](https://github.com/alirezasafaei-dev/persiantoolbox/pull/218).
- **REAL_BROWSER_CHAT_VERIFIED: YES.** Fully hydrated public Chrome `/ai/chat` sent a Persian prompt, received a real `POST /api/ai/chat` HTTP 200 with a Persian `reply` field, and displayed the reply in the conversation. Desktop + simulated mobile viewport passed key smoke tests.
- **ORIGIN_SECURITY: PASS.** Legitimate Origin and an intentionally non-JSON body returned 415 (not 403); untrusted external Origin returned 403. This non-inference negative test was separate from the real Persian chat test.
- **DATABASE_MIGRATIONS_THIS_RELEASE: NO.** The quota migration was applied in the earlier owner-authorized rollout, **not repeated** in this hotfix. Canonical deploy used `RUN_MIGRATIONS=false`; fresh compressed backup exists and passes `gzip -t`; the exact new backup was **not restored in an isolated rehearsal during this verification**.
- **BILLING_RISK: NOT API-VERIFIED.** Workers Free is operator attested; Cloudflare Billing API permissions remain insufficient for independent account-plan confirmation. No paid fallback has been configured, but externally upgrading the Cloudflare account could change billing exposure.
- **OPEN: INTERMITTENT VPS DNS.** Resolution timeouts occurred even though final strict `sw.js` audits passed; root cause still unknown. Follow the [DNS runbook](../ops/PRODUCTION_DNS_RESOLVER_DIAGNOSTICS.md); do not disable the strict check or change resolver ad hoc.
- **PENDING/NOT_RUN:** Post-release live 429 quota stress; exhaustive on-device/mobile, footer/dropdown, OCR accuracy, address transliteration, image transformation and contract exports. Distinguish this from successful core chat acceptance.

## Historical preflight and approvals — preserved for audit

Canonical repository: https://github.com/alirezasafaei-dev/persiantoolbox
Source already merged from integration PR #213, main SHA c7d96483d211df46da200dc3c3af69c1930fbc27.

## Earlier independent preflight observations (08:56 UTC, superseded)

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

At the **08:56 UTC preflight checkpoint only**, migration wiring was corrected and locally verified, while production migration, protected env modification, deployment and public activation remained NOT_RUN. **This statement is historical and has been superseded by the verified later rollout above.** This document never independently authorizes future production operations.
