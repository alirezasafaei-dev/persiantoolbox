# PersianToolbox AI Chat — Independent Follow-up Review (2026-10-08)

**Repository:** [alirezasafaei-dev/persiantoolbox](https://github.com/alirezasafaei-dev/persiantoolbox)  
**PR:** [#211](https://github.com/alirezasafaei-dev/persiantoolbox/pull/211) (DRAFT)  
**Upstream live validation:** [Cloudflare from Iran report](CLOUDFLARE_WORKERS_AI_IR_LIVE_VALIDATION_2026-10-08.md)  
**Scope:** local code/test improvements only; no API token disclosure, no production service changes, no merge/deploy.

## Executive decision

- `LIVE_CHAT_VERIFIED: YES` — independently reported by the earlier Codex Iran-VPS Cloudflare inference; this follow-up did **not** rerun billable-risk remote inference.
- `LOCAL_QUOTA_POSTGRES_SQL_VERIFIED: YES` — the **actual quota SQL extracted from the current TypeScript source** passed an isolated PostgreSQL 16 transaction test.
- `ENABLED_BROWSER_MOCK_VERIFIED: YES` — Chromium/Playwright interaction test passed using an intercepted/mock chat API, no live provider credentials.
- `ZERO_PAID_API_RISK_CONFIRMED: NO` — owner confirmed Workers Free but Billing/Subscriptions API returned 403; a future external plan upgrade cannot be prevented by application code.
- `READY_TO_MERGE_OR_DEPLOY: NO` — do not infer authorization from this review.

## Real isolated PostgreSQL validation

The reviewer installed PostgreSQL 16 in the owner's authorized **Windows WSL Ubuntu 24.04**, provisioned a distinct isolated cluster (port 55432, not production), and created the isolated `pt_ai_quota_test` database. The source migration `db/migrations/20261008_ai_chat_quota.sql` was applied **only there**. Python psycopg2 used a Unix domain socket and dynamically extracted the exact `INSERT ... ON CONFLICT DO UPDATE ... WHERE ... RETURNING hits` SQL expression from `lib/ai/quota.ts`; transactions and four counter scopes mirrored the app's order and caps.

| Test | Result | Evidence |
| --- | --- | --- |
| Schema/migration | PASS | `POSTGRES_MIGRATION=PASS` |
| Single visitor, 24 truly concurrent transactions | PASS | Exactly 2 accepted; denied attempts rolled back visitor/day + global/day increments |
| Global minute, 20 distinct concurrent visitors | PASS | Exactly 5 accepted; global/day counter == 5 |
| Global day, 40 accepted across eight minute buckets | PASS | 41st attempt denied; global/day remains 40 |
| Failed request rollback | PASS | None of the earlier increment operations persisted on denied attempt |

**Boundary:** These are genuine PostgreSQL semantics and SQL-parity tests, **not a complete Next.js HTTP → withTransaction → PostgreSQL integration test**. The Windows-to-WSL TCP path was not accessible, so the latter still needs an authorized staging/runtime test. No production DB or schema was changed. After tests the isolated WSL cluster and test database were removed, the temporary log was deleted, and the newly installed WSL PostgreSQL main service was stopped. The PostgreSQL package remains locally installed for optional future authorized tests.

## Frontend enabled-mode verification

Ran Playwright Chromium at **375×667** with `FEATURE_AI_CHAT_ENABLED=true` and `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true` **only in a throwaway local dev test process**, without AI credentials. All `/api/ai/chat` requests were intercepted and returned fixture responses. No actual Cloudflare inference occurred in this test.

Passed:
- Persian input submission and visible Persian assistant response;
- second-turn context with alternating `user / assistant / user` history;
- HTTP 429 localized error and restoration of draft;
- reset/new conversation;
- narrow viewport horizontal overflow guard;
- no serious/critical Axe accessibility violations.

An initial test attempted input before React hydration and another used an ambiguous `role=alert` locator that also matched Next.js route announcer. Waiting for `networkidle` and using `form [role=alert]` corrected **test synchronization/selector behavior**, not provider-side model behavior. The final run returned `ENABLED_BROWSER_EXIT=0`.

Playwright blocked PWA service worker registration and logged pre-existing development warnings unrelated to this AI feature.

## Product/SEO/privacy improvements

- `lib/ai/chat-history.ts` bounds all but the current prompt and keeps only the most recent two exchanges; protects the existing 16 KB API body cap for multi-turn conversations.
- Unit tests verify Persian/emoji UTF-8 raw body sizes and valid turn roles.
- `app/trust/page.tsx` and `components/features/monetization/PrivacyPolicyPage.tsx` differentiate on-device file-processing tools from cloud AI chat, clarify outbound processing to Cloudflare and nonpersistence of transcript in app DB. Never claim Cloudflare itself retains nothing; users are warned about provider policies.
- `app/sitemap.ts` lists only active AI routes after BOTH safety flags; image generation remains absent.
- `app/writing-tools/page.tsx` adds a relevant internal link to AI chat only when enabled.
- `tests/unit/ai-sitemap-gating.test.ts` proves gating and excludes unimplemented `/ai/image`.
- `tests/e2e/ai-chat-enabled.spec.ts` is gated by `AI_E2E_ENABLED_MOCK=true` to avoid default CI accidentally activating real model traffic.

## Quality gate results

| Gate | Status |
| --- | --- |
| Targeted new history + sitemap + existing SEO tests | PASS (30 + 4 focused tests over successive runs) |
| Local TypeScript after explicit typed test fixtures | PASS (`TYPECHECK_EXIT=0`) |
| Targeted ESLint / formatting / `git diff --check` | PASS |
| Enabled-mode Playwright mock browser | PASS (1/1, 375×667 + Axe) |
| Real isolated PostgreSQL SQL/transaction/concurrency | PASS |
| `pnpm ci:contracts` (before this follow-up report was created) | PASS (exit 0) |
| `pnpm ci:quick` on final candidate | PASS (exit 0; 231 test files / 1,782 tests; lint, typecheck and local-first all passed) |
| `pnpm build` on final candidate | PASS (exit 0; Next.js 16.3.8, 658 pages; /ai, /ai/chat and /api/ai/chat compiled) |
| Full app HTTP → local PostgreSQL integration | NOT_RUN |
| New dedicated Workers AI token | BLOCKED: insufficient Token Edit privileges |
| Cloudflare account Billing API tier verification | BLOCKED: 403 |
| Production DB migration, merge, deploy, feature enablement | NOT_AUTHORIZED |

**Safe handoff:** [Remaining owner/token gates](../CODEX_REMAINING_OWNER_GATES_2026-10-08.md). Codex should only handle blockers requiring different permissions, not repeat the completed local tests.

## Release security conditions

Do not enable or publish until account remains Workers Free, least-privilege token is provisioned, full protected-environment HTTP/DB integration passes, and owner separately approves merge, staging/production migration, blue-green deployment, and final feature enablement. No paid fallback, no local inference, no image-generation activation. Keep secrets out of all diffs and reports.
