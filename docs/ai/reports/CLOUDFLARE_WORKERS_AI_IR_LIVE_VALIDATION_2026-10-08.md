# Cloudflare Workers AI Iran Live Validation — 2026-10-08

**LIVE_CHAT_VERIFIED: YES**

**ZERO_PAID_API_RISK_CONFIRMED: NO**

## 1. Executive Summary

The fixed Cloudflare-hosted model `@cf/zai-org/glm-4.7-flash` produced a valid Persian response through the official direct Workers AI REST endpoint from the identified Iran production VPS. The successful bounded request returned HTTP 200 in 3.552 seconds and reported 3.6814 Neurons. No AI Gateway or third-party paid-provider endpoint was used.

Cloudflare documents this model as available on Workers Free. Workers Free receives 10,000 Neurons per UTC day and cannot consume paid overage; excess operations fail unless the account is upgraded. The owner confirmed that this account is on Workers Free. The credential cannot read account subscriptions, so the plan classification is `OWNER_CONFIRMED`, not `API_VERIFIED`. The tested route has no paid fallback, but absolute zero paid risk is not confirmed because the application cannot detect a later external upgrade to Workers Paid.

The MVP remains disabled. This validation does not authorize merge, database migration, deployment, production configuration, service restart, or public feature enablement.

## 2. Repository and Commit SHA

- Canonical repository: `https://github.com/alirezasafaei-dev/persiantoolbox`
- Pull request: [#211](https://github.com/alirezasafaei-dev/persiantoolbox/pull/211)
- Issue: [#210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210)
- Branch: `feat/ai-online-free-chat-20261008`
- Validated implementation commit: `61333c2b79a59614979410e4b3f05a67a4ede35f`
- Validation base before fixes: `0c2d0d14f91f334ddc4d746d84fe206d61047c56`

## 3. Cloudflare Free Plan Verification

- Status: `OWNER_CONFIRMED`.
- Account identifier format: valid 32-character identifier; model-search request succeeded for the account.
- Official model search: HTTP 200; the selected model was present and not requested as experimental or deprecated.
- Official eligibility: Cloudflare explicitly lists `@cf/zai-org/glm-4.7-flash` among models remaining available on Workers Free.
- Free allowance: 10,000 Neurons per UTC day; Workers Free has no paid overage and further operations fail after the allocation is exhausted.
- Paid-only exclusions: Cloudflare separately identifies models requiring Workers Paid or prepaid AI Gateway credits. None are configured by this MVP.
- Billing API: HTTP 403 with the scoped credential. Subscription tier could not be independently read through the API.

Official evidence:

- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [GLM-4.7-Flash model page](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)
- [Workers Free model eligibility change](https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/)
- [Workers AI run API and accepted permissions](https://developers.cloudflare.com/api/resources/ai/methods/run/)

## 4. Credential and Permission Status

- Existing source file was read only for the two required variable names; it was not copied to the repository.
- Account ID: present and valid format.
- Existing Cloudflare credential: present.
- Workers AI model-list permission: verified by HTTP 200 locally and from the Iran VPS.
- Inference permission: verified by successful HTTP 200 inference.
- Account Settings/Billing read permission: not granted (HTTP 403).
- Dedicated least-privilege token creation: `BLOCKED`; the existing credential does not provide Token Edit authority, and no interactive owner login was used or bypassed.
- Secret exposure: no credential values were printed, committed, added to URLs, written to temporary files, or included in GitHub evidence.

## 5. Iran VPS Connectivity Results

- SSH target identity and role: verified against the configured production target and canonical PersianToolbox production layout marker; operational identifiers are intentionally omitted.
- Production mutation: none.
- Cloudflare API TLS probe: HTTP 400 at API root as expected for an incomplete API request; connect 0.060 seconds, TLS 0.127 seconds, total 0.536 seconds.
- Authenticated model search from VPS: HTTP 200.
- Selected model found from VPS: yes.

## 6. Real Persian Inference Result

| Field | Result |
| --- | --- |
| Model | `@cf/zai-org/glm-4.7-flash` |
| Endpoint | Direct `api.cloudflare.com/client/v4/accounts/.../ai/run/...` |
| HTTP status | 200 |
| Connect time | 0.164 seconds |
| TLS time | 0.237 seconds |
| Time to first byte | 3.552 seconds |
| Total time | 3.552 seconds |
| Response shape | Cloudflare envelope → `result.choices[0].message.content` |
| Finish reason | `stop` |
| Persian language | PASS; fluent, relevant, two short paragraphs |
| Usage | 34 prompt tokens, 96 completion tokens, 130 total tokens, 3.6814 Neurons |
| Cost status | `OWNER_CONFIRMED` Free account; direct Free-eligible model path |

Two diagnostic requests established the compatibility defect before the successful request:

- 100 completion tokens with model thinking enabled: HTTP 200, `finish_reason=length`, 3.827 Neurons, no user-visible content.
- 250 completion tokens with model thinking enabled: HTTP 200, `finish_reason=length`, 9.287 Neurons, no user-visible content.
- 100 completion tokens with `chat_template_kwargs.enable_thinking=false`: HTTP 200, `finish_reason=stop`, valid Persian content, 3.6814 Neurons.

Total measured validation consumption was 16.7954 Neurons, approximately 0.168% of the documented daily Free allocation.

## 7. Model and API Compatibility

The real REST response uses the OpenAI-compatible choice shape, not the legacy `result.response` shape. The existing parser already accepts both. The defect was request-side: reasoning consumed the entire bounded completion budget before visible content was produced.

The provider now:

- fixes the only model to `@cf/zai-org/glm-4.7-flash`;
- sends `chat_template_kwargs.enable_thinking=false`;
- uses `max_completion_tokens=400` and `stream=false`;
- performs no retry, model switch, paid fallback, or AI Gateway routing;
- treats only HTTP 429 as Free-capacity throttling;
- treats 401, 403, 5xx, network failure, timeout, invalid JSON, and missing text as unavailable/invalid responses without exposing upstream details.

## 8. Zero-Cost Assessment

The tested direct path has no paid fallback at validation time because:

1. the owner confirmed Workers Free;
2. Cloudflare documents no paid overage on Workers Free;
3. the fixed model is explicitly Free-eligible;
4. the code uses the direct Workers AI account endpoint, not AI Gateway;
5. there is no alternate provider, retry, model fallback, or billable upgrade action;
6. local daily and minute caps are consumed atomically before inference.

`ZERO_PAID_API_RISK_CONFIRMED: NO` because this is not a permanent guarantee after an external account-plan change and the Billing API was unavailable to the scoped credential. Enabling remains gated by the explicit `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true` owner attestation. Any future Workers Paid upgrade requires revalidation before keeping the feature enabled.

## 9. Security Findings

- PASS: feature disabled unless both rollout flags are exactly `true`.
- PASS: provider token remains server-only and is never placed in request JSON or browser code.
- PASS: same-origin request check, JSON content-type enforcement, 16 KB body cap, bounded alternating history, per-turn limits, and no conversation persistence.
- PASS: signed pseudonymous visitor cookie; raw visitor ID is not stored in quota keys.
- PASS: static/unit contract verifies all four quota increments are issued through one `withTransaction` callback and application errors fail closed.
- PASS: repository secret scan found no high-risk patterns.
- PASS: production dependency audit reports no known vulnerabilities after updating Next.js 16.3.8, Sharp 0.35.5, Sentry 10.69.0, DOMPurify 3.4.16, and vulnerable transitive overrides.
- BLOCKED: dedicated least-privilege Workers AI token requires owner-authorized Cloudflare token administration.
- BLOCKED: migration behavior against PostgreSQL could not be integration-tested because no isolated `DATABASE_URL` or Docker engine was available. Production database was not touched.

## 10. Code Changes

- Disabled model reasoning for bounded chat replies.
- Reduced the provider surface to one fixed Free-eligible model.
- Corrected 503 classification so only 429 reports capacity exhaustion.
- Added Provider error/secret/request-contract tests.
- Added quota gate, signed-cookie, transaction, cap, and database-failure tests.
- Added Persian keyboard submit, copy toast, reset, disabled-state, RTL/mobile, overflow, and accessibility tests.
- Updated security-sensitive dependencies and stale vulnerable overrides required by the repository commit gate.

## 11. Test Results

| Check | Status | Evidence |
| --- | --- | --- |
| Real Iran VPS TLS connectivity | PASS | Direct API TLS established; timing captured above |
| Authenticated model search from Iran | PASS | HTTP 200; selected model found |
| Real Persian inference from Iran | PASS | HTTP 200; Persian content; 3.6814 Neurons |
| AI unit/component tests | PASS | 19 tests across contracts, provider, quota, and chat workspace |
| Provider error cases | PASS | 401, 403, 429, 500, 502, 503, invalid/blank response coverage |
| Quota unit contract | PASS | SQL shape/caps and fail-closed propagation covered with mocked transaction boundary |
| Secret scan | PASS | No high-risk secret patterns detected |
| Dependency security audit | PASS | No known vulnerabilities after hosted-gate remediation |
| `pnpm ci:quick` | PASS | 229 files, 1,778 tests passed; lint/typecheck/local-first passed |
| `pnpm ci:contracts` | PASS | All repository contract and licensing gates passed |
| `pnpm build` | PASS | Next.js 16.3.8 production build; 658 static pages generated |
| Mobile RTL and accessibility Playwright | PASS | Chromium, 375×667, no horizontal overflow, 0 serious/critical Axe findings |
| Standalone smoke | PASS | 11 checks via PowerShell-equivalent `SMOKE_HOST`/`SMOKE_PORT` process env |
| Literal `pnpm predeploy:smoke` on Windows | FAIL | Package script uses POSIX inline env syntax unsupported by `cmd.exe`; equivalent command passed |
| Isolated PostgreSQL migration/integration | BLOCKED | No isolated database or Docker; production DB prohibited |
| Real PostgreSQL concurrency/rollback | BLOCKED | No isolated PostgreSQL environment; mocks do not prove database locking or rollback |
| Enabled-browser API integration | NOT_RUN | Stable Playwright coverage is disabled-state only; keyboard/response behavior is covered in jsdom |
| Dedicated least-privilege token creation | BLOCKED | No Token Edit authority / no interactive owner approval |
| Production regression smoke | NOT_RUN | No deploy or production mutation authorized |

Build warnings predate this AI scope: Edge runtime deprecation and dynamic filesystem tracing in `app/api/admin/ops/logs/route.ts`. They did not fail the build and were not changed in this PR.

Exact local commands and final exit codes:

| Command | Exit code |
| --- | ---: |
| `pnpm vitest --run lib/ai/providers/cloudflare.test.ts lib/ai/quota.test.ts lib/ai/contracts.test.ts` | 0 |
| `pnpm vitest --run components/ai/ChatWorkspace.test.tsx` | 0 |
| `pnpm ci:quick` | 0 |
| `pnpm ci:contracts` | 0 |
| `pnpm build` | 0 |
| `pnpm exec playwright test tests/e2e/ai-chat.spec.ts --project=chromium --reporter=list` with system Chrome path and feature disabled | 0 |
| `pnpm security:secrets` | 0 |
| `pnpm security:scan` | 0 |
| PowerShell process env equivalent of `SMOKE_HOST=127.0.0.1 SMOKE_PORT=3100 pnpm smoke:local` | 0 |
| Literal `pnpm predeploy:smoke` on PowerShell | 1 |

## 12. Remaining Blockers

1. Owner creates a dedicated account-scoped token limited to Workers AI inference/read and stores it only in the protected production secret store.
2. An authorized isolated/staging PostgreSQL environment applies `db/migrations/20261008_ai_chat_quota.sql` and runs concurrent quota integration tests.
3. Owner reviews the account plan immediately before enablement and records a fresh Free attestation.
4. Owner separately approves merge, deployment, production environment configuration, and eventual enablement. None are authorized by this report.

## 13. Production Readiness Decision

**Decision: TECHNICALLY VALIDATED, NOT READY TO ENABLE IN PRODUCTION.**

The provider, Persian response, Iran reachability, no-paid-fallback direct path, application build, unit contracts, and disabled-state UI are verified. Public enablement remains blocked by dedicated credential provisioning, isolated database migration/integration evidence, enabled-browser integration, and explicit owner approvals for merge/deploy/configuration/enablement.

## 14. Exact Next Actions

1. In Cloudflare, create a dedicated token scoped only to this account and Workers AI inference/read; do not reuse the existing multi-service credential.
2. Store `AI_CLOUDFLARE_ACCOUNT_ID`, `AI_CLOUDFLARE_TOKEN`, and a new 32+ character `AI_VISITOR_SECRET` in the protected target environment without printing values.
3. Keep `FEATURE_AI_CHAT_ENABLED=false` and `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=false`.
4. Apply the quota migration to an authorized isolated/staging PostgreSQL database and run concurrent cap tests.
5. Obtain owner merge approval; merge without deployment only after exact-head CI is green.
6. Obtain separate deployment approval and deploy with the canonical production process, migrations explicitly controlled.
7. Reconfirm Workers Free immediately before setting the attestation flag, then enable only after post-deploy same-origin chat verification.
