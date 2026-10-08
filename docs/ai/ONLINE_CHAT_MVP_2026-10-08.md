# PersianToolbox AI — Online-only free chat MVP (image-ready)

Issue: [#210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210).

## Scope

The user wants a **real, fully online Persian chatbot**, built into PersianToolbox, with zero provider API charges for the operator and no required user registration or VPN. Model weights must **not** run on Iranian VPS, a German server, or in users' browsers. Future **real image generation** must fit the same modular architecture but is not part of this release.

### Explicit rollout gates

- **OFF by default:** `FEATURE_AI_CHAT_ENABLED` must be set to `true` by an authorized operator only after the checks below.
- `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true` means an operator **manually verified** Workers **Free** and excluded billing-enabled AI Gateway configurations. This is an attestation, not an API-derived or automated billing check.
- Cloudflare is the only callable provider in this PR. Fixed model `@cf/zai-org/glm-4.7-flash` is documented as Free-eligible on 2026-10-08. Other models including `glm-5.2` require Paid and **must not be added**.
- Free plan daily allowance: 10,000 Neurons. On Workers **Paid**, usage over the allowance can be charged; therefore **do not enable** on Paid accounts. The app does not and cannot technically prevent bills on an externally upgraded Cloudflare account.
- Real inference from the Iran VPS passed on 2026-10-08. The successful reasoning-disabled request returned HTTP 200, valid Persian content in 3.552 seconds and 3.6814 Neurons. See [the live validation report](reports/CLOUDFLARE_WORKERS_AI_IR_LIVE_VALIDATION_2026-10-08.md).
- The account tier remains `OWNER_CONFIRMED`, not `API_VERIFIED`: model listing and inference permissions passed, while the scoped credential received HTTP 403 from Account/Billing endpoints.
- Existing local .env at the awesome-free-llm-apis-ir repository has a CF account ID and key and other provider credentials. These **MUST NOT** be copied to this repository, chat, CI logs or public output. Use a dedicated limited-scope Cloudflare Workers AI token instead of reusing high-privilege access.
- Public traffic must remain disabled until a **successful actual Iranian-VPS-to-provider inference** with Persian answer is observed, along with contract/region checks and no unexpected charges.

## Secrets (production system environment only)

- `AI_CLOUDFLARE_ACCOUNT_ID` — Cloudflare 32-character account ID.
- `AI_CLOUDFLARE_TOKEN` — a dedicated **limited scope** Workers AI token.
- `AI_VISITOR_SECRET` — at least 32 random characters for signing pseudonymous anonymous visitors.
- `FEATURE_AI_CHAT_ENABLED=false` — default disabled, flip only after proofs.
- `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=false` — default disabled.
- `DATABASE_URL` — existing protected production PostgreSQL connection; do not expose.

## Database preparation

`db/migrations/20261008_ai_chat_quota.sql` is **NOT** applied by GitHub commits. The database schema must be reviewed and migrated through the authorized deployment process. The quota system is transaction-backed by PostgreSQL and **fails closed** if migration/database is unavailable. This avoids dependence on currently unconfigured application Redis, and avoids in-memory counters failing under blue/green or multi-process setups.

Initial conservative quotas are:

- 5 messages per signed anonymous visitor per UTC day;
- 2 per signed visitor per UTC minute;
- 40 across the entire site per UTC day;
- 5 across the entire site per UTC minute.

The global guard preserves free capacity even if users clear cookies, but this is not full abuse protection. There is no IP collection by default. Add challenge/abuse defenses before wider public release; do not publish provider API tokens to browser. Quota is consumed **before** inference; failed provider requests can consume a slot, an intentional conservative choice.

## API and user-facing routes

- `/ai` SSR hub, presently **noindex** until feature flag is on.
- `/ai/chat` Persian RTL chat, disabled until both gates are active; currently **noindex** while inactive.
- `POST /api/ai/chat` — JSON `{ messages: [{ role:'user'|'assistant', content:string }] }`, returns `{reply:string}` or localized `{error:string}`.
- Fixed server-side Cloudflare endpoint, no user-selectable model/URL.
- Request body capped at 16 KB, per-turn limits and alternating roles, one non-stream response with a 25-second abort signal. SSE streaming may be added after basic inference is proven.
- Chat transcript lives in React state only; no DB conversation content retention. Browser-to-app traffic uses same-origin cookie. External AI provider necessarily receives the text and brief conversation history. Preserve truthful route-specific privacy disclosure.
- HTTP 429 = exhausted local quota or free upstream pool, no automatic paid retries. HTTP 503 = provider unavailable, disabled or database unavailable. Never echo upstream tokens/errors.
- The selected reasoning model must receive `chat_template_kwargs.enable_thinking=false`. Live tests proved that thinking mode can consume 100–250 completion tokens without producing user-visible `content`; the disabled-thinking request completed normally.

## Future image capability

`lib/ai/contracts.ts` defines `AiModality = 'chat' | 'image'`. A future provider must explicitly implement image generation and have independently verified free quotas, image processing terms, abuse controls, media safety rules and storage lifecycle. The hub shows this honestly as future work, **not** a functional generator.

## Acceptance / remaining work

- [x] Correct canonical repository: `alirezasafaei-dev/persiantoolbox`.
- [x] Server-only provider adapter and locked Free model in source.
- [x] Shared chat/image modality contract.
- [x] PostgreSQL atomic quota design and migration **file**.
- [x] Persian page and JSON chat route implementation on isolated branch.
- [x] Run `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, focused AI tests, standalone smoke, plus Playwright/a11y. The literal Windows `pnpm predeploy:smoke` wrapper is POSIX-only; its equivalent standalone command passed 11 checks.
- [x] Verify owner-confirmed Workers Free, official model eligibility, direct non-Gateway routing and absence of any paid fallback. Dedicated least-privilege token creation remains blocked on owner-authorized Token Edit access.
- [x] Test authorized Persian inference from **Iran VPS**, response shape/TTFT, status codes and reported Neurons.
- [x] Test browser layout on mobile, RTL, keyboard behavior and accessibility. Long-answer visual review remains covered only by wrapping styles, not a separate screenshot baseline.
- [ ] Apply migration in appropriately authorized staging environment first.
- [ ] Check privacy/trust copy, internal navigation, sitemap and actual site SEO performance before enabling indexing.
- [ ] Explicit owner approval to merge and deploy (none granted by this document).

## 2026-10-08 validation decision

- `LIVE_CHAT_VERIFIED: YES` — direct Workers AI inference from the Iran VPS produced a valid Persian reply.
- `HTTP_DB_INTEGRATION_VERIFIED: YES` — the native Next.js chat route passed against isolated PostgreSQL 16 with a loopback mock provider, including concurrent caps, rollback, outage and recovery. See [the final integration report](reports/AI_CHAT_FINAL_INTEGRATION_AND_ACCESS_GATES_2026-10-08.md).
- `ZERO_PAID_API_RISK_CONFIRMED: NO` — the tested direct route has no paid fallback and the owner attests Workers Free, but Billing API verification was unavailable and code cannot detect a later external Workers Paid upgrade.
- Production enablement: **NO** — the dedicated token, merge approval, production migration/configuration approval, deploy approval and final owner enablement are still required.

## Governance

Follow `AGENTS.md`, `docs/HANDOFF.md`, `DCO.md`, and `docs/ops/PRODUCTION_DEPLOY_SAFETY.md`. Do not merge or deploy on a plan alone. Keep logs and PR evidence credential-free.
