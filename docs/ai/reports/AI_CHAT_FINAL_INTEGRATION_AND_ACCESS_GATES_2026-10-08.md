# AI Chat Final Integration and Access Gates — 2026-10-08

## Executive Summary

PersianToolbox AI Chat now has a repeatable full HTTP-to-database integration test. The verified chain is HTTP client → Next.js `POST /api/ai/chat` → signed visitor cookie → transactional quota service → isolated PostgreSQL 16 → loopback mock Cloudflare provider → Persian HTTP response. No production database, production service, Cloudflare inference, or paid endpoint was used in this follow-up.

The application candidate is technically validated but **not production-ready**. A dedicated least-privilege Cloudflare token and independent Billing API plan verification remain blocked by the accessible credential's permissions. Merge, migration, deployment, configuration, and public enablement still require separate owner approvals.

- `LIVE_CHAT_VERIFIED: YES` — retained from the bounded Iran-VPS live validation; not repeated here.
- `HTTP_DB_INTEGRATION_VERIFIED: YES`
- `DEDICATED_CLOUDFLARE_TOKEN: BLOCKED`
- `FREE_PLAN_STATUS: OWNER_CONFIRMED`
- `ZERO_PAID_API_RISK_CONFIRMED: NO`
- `PRODUCTION_READY: NO`

## Repository Evidence

- Repository: `alirezasafaei-dev/persiantoolbox`
- Pull request: [#211](https://github.com/alirezasafaei-dev/persiantoolbox/pull/211)
- Issue: [#210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210)
- Branch: `feat/ai-online-free-chat-20261008`
- Starting head: `dc71620bd0c904599fc07ec78ad7a6cb1557e7b5`
- HTTP/DB implementation commit: `443211473106a4690e9d92a540892969162f3be9`

## Task Matrix

| Task | Status | Evidence |
| --- | --- | --- |
| Read current owner-gates handoff and compare with code/environment | DONE | Remote head, required docs, PR comments, issue comments, and current code inspected |
| Dedicated least-privilege Workers AI token | BLOCKED | Token verify HTTP 401; token permission-groups HTTP 403; no Token Edit authority or owner dashboard interaction |
| Official Billing/plan API verification | BLOCKED | Account HTTP 403 and Subscriptions HTTP 403 |
| Workers AI model access | DONE | Account model search HTTP 200; `@cf/zai-org/glm-4.7-flash` remains present |
| Owner Free-plan attestation | DONE | Recorded as `OWNER_CONFIRMED`, not `API_VERIFIED` |
| Full Next.js HTTP → PostgreSQL integration | DONE | Isolated PostgreSQL 16 and real Next.js route passed |
| Signed anonymous cookie creation and persistence | DONE | Valid `pt_ai_v` signature shape; second response did not renew valid cookie |
| Visitor 2/minute and 5/day quotas | DONE | HTTP 200 through cap, then HTTP 429; persisted counters exactly 2 and 5 |
| Global 5/minute and 40/day quotas | DONE | HTTP 200 through cap, then HTTP 429; persisted counters exactly 5 and 40 |
| Twenty concurrent HTTP requests | DONE | Exactly 5 accepted and 15 rejected |
| Transaction atomicity and rollback | DONE | Only five visitor rows and global counters of five remained after concurrent denials |
| Database outage and recovery | DONE | Connections disabled/terminated → HTTP 503; re-enabled DB → HTTP 200 |
| Feature-flag bypass prevention | DONE | Disabled server returned 503 before any mock-provider request |
| Secret/prompt disclosure checks | DONE | Test token and Persian prompt absent from captured Next.js stderr |
| Paid fallback prevention | DONE | Fixed direct Workers AI provider; no retry/model/gateway fallback; integration made 53 loopback calls and zero external calls |
| Mobile RTL/Axe enabled UI | DONE | Existing enabled-mode Playwright rerun passed on system Chromium |
| Image generation | NOT_APPLICABLE | Explicitly out of this PR; shared modality contract remains extensible |
| Production migration, merge, deploy, enablement | BLOCKED | Owner-only approvals; no production mutation authorized or performed |

## Isolated HTTP/PostgreSQL Environment

- PostgreSQL: version 16, dedicated `ptaihttp` cluster on port 55432.
- Database: dedicated `pt_ai_http_test`; production database was never addressed.
- Runtime: local Next.js development server on loopback.
- Provider: local loopback HTTP mock selected through `AI_CLOUDFLARE_TEST_BASE_URL`.
- Safety control: the override is accepted only outside `NODE_ENV=production`, only with plain HTTP loopback hosts, no URL credentials, and root pathname. Production or non-loopback values are ignored and the official Cloudflare endpoint remains fixed.
- Migration: `db/migrations/20261008_ai_chat_quota.sql` applied only to the isolated database.
- Provider calls: 53 loopback mock requests, zero external provider requests.

The integration harness is available as `pnpm test:ai:http-db` and refuses any database URL that does not name `pt_ai_http_test`.

## HTTP/Database Results

| Behavior | Result |
| --- | --- |
| Signed visitor cookie | PASS |
| Visitor identity persistence | PASS |
| Two requests per visitor/minute | PASS |
| Five requests per visitor/day | PASS |
| Five global requests/minute | PASS |
| Forty global requests/day | PASS |
| Twenty concurrent requests | PASS: 5 HTTP 200, 15 HTTP 429 |
| Atomic quota rollback | PASS |
| Quota-exhaustion response | PASS: HTTP 429 |
| Database outage | PASS: HTTP 503 with generic Persian error |
| Database recovery | PASS: subsequent HTTP 200 |
| Prompt/token disclosure | PASS |
| Feature disabled | PASS: HTTP 503 and zero provider calls |
| Paid/external provider execution | PASS: zero external calls |

## Cloudflare Credential and Billing Status

Only `CF_ACCOUNT_ID` and `CF_API_KEY` were read from the existing protected env file, in memory. Values were never printed, copied, persisted, placed in command arguments, or sent to GitHub.

| Read-only check | Result |
| --- | --- |
| Account identifier | Present; 32-character format |
| Existing credential | Present |
| Workers AI model search | HTTP 200 |
| Token verification endpoint | HTTP 401 |
| Token permission-groups endpoint | HTTP 403 |
| Account endpoint | HTTP 403 |
| Subscriptions/Billing endpoint | HTTP 403 |

Cloudflare's official token documentation says an initial dashboard-created token with API-token edit authority is required before creating additional tokens through the API. The accessible credential does not have that authority, so no token-creation mutation was attempted and no permission boundary was bypassed.

The owner confirms Workers Free. Cloudflare currently documents 10,000 free Neurons/day and no paid overage on Workers Free; `@cf/zai-org/glm-4.7-flash` remains listed as Free-eligible. However, Billing cannot be API-verified and application code cannot prevent a later external upgrade to Workers Paid. Therefore `ZERO_PAID_API_RISK_CONFIRMED` remains `NO`.

Official references:

- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [GLM-4.7-Flash model](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)
- [Free-plan model eligibility](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/)
- [Create API tokens through the API](https://developers.cloudflare.com/fundamentals/api/how-to/create-via-api/)

## Code Changes

- Added a reusable full HTTP/PostgreSQL integration harness.
- Added `pnpm test:ai:http-db`.
- Added a non-production, loopback-only provider endpoint override for deterministic integration tests.
- Added provider security tests proving production and non-loopback overrides are ignored.
- Preserved the single fixed Free-eligible model, direct Workers AI REST path, no retries, and no paid fallback.

## Final Test Results

| Command/check | Status | Exit/evidence |
| --- | --- | --- |
| `pnpm test:ai:http-db` with isolated DB | PASS | Exit 0; all 15 required HTTP/DB assertions passed |
| Focused AI/unit suite | PASS | Exit 0; 24/24 tests |
| `pnpm ci:quick` | PASS | Exit 0; 231 files, 1,785 tests |
| `pnpm ci:contracts` | PASS | Exit 0 |
| `pnpm build` | PASS | Exit 0; Next.js 16.3.8; 658 pages |
| Literal `pnpm predeploy:smoke` on PowerShell | FAIL | Exit 1; POSIX inline environment syntax is not valid in `cmd.exe` |
| Initial Bash shim attempt | FAIL | Exit 127; WSL had no Linux Node runtime |
| Bash smoke with Windows Node executable | PASS | Exit 0; 11 standalone checks |
| Enabled-mode Playwright first attempt | NOT_RUN | Browser launch failed before test because the wrong executable env key was supplied |
| Enabled-mode Playwright with configured system Chromium | PASS | Exit 0; 1/1, mobile RTL and Axe coverage |
| `pnpm security:secrets` | PASS | Exit 0; no high-risk secret patterns |
| `pnpm security:scan` | PASS | Exit 0; no known vulnerabilities |
| `git diff --check` | PASS | Exit 0 |

Pre-existing non-fatal output remains: Edge runtime deprecation, dynamic filesystem tracing in the admin ops log route, Sentry client-config deprecation, and Playwright service-worker mock warnings. None originated in this AI integration change.

## Security Assessment

- No production or Novax credential/configuration was changed.
- No secret value appears in source, report, terminal evidence, or GitHub content.
- No actual Cloudflare inference was repeated during high-volume testing.
- The test endpoint override cannot redirect production traffic and cannot target a non-loopback host.
- The feature remains fail-closed behind both rollout flags.
- Database failure returns a generic Persian 503 and recovers without process restart.
- Quota state is PostgreSQL-backed and atomic across concurrent requests.
- Conversation text remains absent from application database storage and captured server logs.

## Remaining Blockers and Owner Actions

1. Use an authenticated Cloudflare owner dashboard session to create an account-scoped token limited to Workers AI read/inference. Store it only in the approved protected secret store.
2. Reconfirm Workers Free in the dashboard immediately before any enablement. Billing remains `BLOCKED` for API verification.
3. Separately approve PR merge.
4. Separately approve protected environment configuration and controlled production migration with backup.
5. Separately approve blue-green deployment.
6. Separately approve `FEATURE_AI_CHAT_ENABLED=true` only after deployed disabled-state verification.

## Readiness Decision

**TECHNICALLY VALIDATED; NOT PRODUCTION-READY AND NOT AUTHORIZED FOR RELEASE.**

The native HTTP/database integration blocker is closed. The remaining blockers are Cloudflare owner-access/token administration, unavailable Billing API evidence, and explicit owner decisions for merge/migration/deploy/enablement. No merge, deployment, production migration, restart, or public activation occurred.
