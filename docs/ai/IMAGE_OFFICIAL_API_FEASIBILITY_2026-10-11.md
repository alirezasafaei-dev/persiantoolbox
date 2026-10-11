# Image generation: official API feasibility spike — 2026-10-11

**State: RESEARCH/UNIT-TESTED ONLY. NOT SHIPPED. NO-GO for public enablement.**

## Decision and evidence

FlatAI's normal browser form returned `signup_required` (first-party HTTP 403) in the isolated Linux Playwright setup. A successful image was not obtained on the intended host. Its [Terms](https://flatai.org/flat-ai-inc-terms-of-service/) explicitly allow account registration requirements for certain features, but do not establish a public developer API or grant blanket permission for unattended multi-user browser automation. The owner elected **not to email FlatAI**; we must respect this and **must not** bypass sign-up, CAPTCHA, browser protections, quotas or restrictions.

A simpler independent candidate is the official [Cloudflare Workers AI REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) with fixed [FLUX.1 Schnell](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/). It is available via a documented server-to-server endpoint. PersianToolbox already has a separate, working Cloudflare Workers AI integration for chat; **reuse of its credentials or quotas is not authorized by this spike**.

[Cloudflare Workers AI pricing as of 2026-10-09](https://developers.cloudflare.com/workers-ai/platform/pricing/) documents 10,000 free Neurons **per account per day**. Workers Paid can charge usage beyond the free daily allocation. The allowance is shared across text and images. The current account plan and API token restrictions are **not independently verified**, and no budget or provider call has been executed in this spike. Do not label image generation unlimited or guaranteed free. User access and latency from Iran remain to be measured without bypassing regional restrictions.

## Code delivered in this spike

- `lib/ai/providers/cloudflare-image.ts` provides a **non-routed, non-public**, fixed-model API adapter. Requires explicit caller-provided `freePlanVerified`; has a separate credential input; immutable Cloudflare endpoint; fixed four-step request, bounded prompt/response/image sizes, sharp decode/re-encode, typed failures and one attempt only. It sends no browser-accessible token and retains no images.
- `lib/ai/providers/cloudflare-image.test.ts` uses an injected **mock fetch** and synthetic images. Tests verify fail-closed access gate, exact request contract, malicious response bounds, transport failures, sanitization and no retries.
- No image API route, public UI, database migration, host network or Cloudflare settings are changed. Existing chat and draft PR #229 remain untouched.

## Release gates (required, NOT_RUN)

1. Account owner verifies in Cloudflare Dashboard: Workers plan **Free**, no paid image-model requirement, appropriate token scope, billing/upgrade risks, model regional eligibility and daily usage. Record a timestamped non-secret attestation. Use a separate least-privilege image API token; do not print or store it in Git.
2. Calculate a **shared account-level** daily image budget that reserves headroom for existing chat usage. Enforce a durable atomic counter and IP/session controls before every inference, with queue/concurrency protection and fail-closed behavior on database failure. Local negative tests cover UTC midnight resets, concurrency, 429/403/5xx, timeouts and billing-upgrade safety. An application counter by itself cannot prove provider-plan safety.
3. Implement a separate, default-off API/UI with explicit external-AI consent, strict origin and body validation, no prompt/image persistence, 30–60s abort bound, no logging of prompt/image/credentials, safe download and privacy disclosure. Do not silently couple it to the existing chat quota or key.
4. After owner approval for a **bounded single inference**, verify an actual generated image/download and measured Neurons, latency, Persian prompt and backend reachability from the production network. Test 429/503 UX without draining free inference. Perform independent code and privacy/security review.
5. Run typecheck, lint, unit tests, production build, browser E2E, security/licensing/docs checks and a full guarded release gate. A separate explicit owner approval is mandatory before **any** production deployment.

## Architecture disposition

- Existing [draft PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229) implements a stronger isolated Playwright/FlatAI queue, but is **blocked** by provider access and requires a dedicated Docker 28+ Linux host plus networking acceptance; preserve it as draft, do not merge or weaken safeguards.
- On 2026-10-11 the connected production VPS was healthy at `f58ef7ad7937de8810df5de4dd3a09ffffdec0f4`; `nginx`/PostgreSQL active; `docker` executable absent and `docker` systemd unit inactive; root filesystem ~86% used. These observations are not authorization to install Docker or alter production configuration.
- The official REST provider requires **no headless browser or Docker**, but does require **separate account, cost, quota and data-processing acceptance**. This is a candidate path, not a certified release.

**Decision:** build and validate the API-first, fail-closed option separately; do not spend inference, merge, or deploy during this evidence-only spike.

## Phase B follow-up — 2026-10-11, default-off private HTTP API

The additive `/api/ai/image` POST endpoint and four namespaced counters were implemented on the **draft branch only**; no public UI, key, migrations, account changes or production release were made. The earlier Phase A text above is a historical checkpoint; this section supersedes its statement that no API route exists.

**Explicit server-side release gates (all must be `true`):**

- `FEATURE_AI_IMAGE_ENABLED` — **default absent/false**
- `AI_IMAGE_FREE_PLAN_CONFIRMED` — operator must inspect the real Cloudflare Workers **Free** account; a successful request is not proof of billing tier
- `AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED` — operator must verify this is a **dedicated account with no chat or other billed inference**, not just a dedicated API token
- `AI_IMAGE_CLOUDFLARE_ACCOUNT_ID` and `AI_IMAGE_CLOUDFLARE_TOKEN` — separate, least-privilege protected credentials; the account ID and token must differ from the chat credentials
- `AI_VISITOR_SECRET` and the existing `ai_chat_quota` PostgreSQL table must be available

The endpoint rejects anonymous requests without a same-origin `Origin`, rejects unapproved consent, caps the JSON body at 4 KiB and prompt at 2,048 characters, requires a signed HttpOnly visitor cookie, and returns a sanitized JPEG attachment with `no-store`. Only the consented prompt is sent to Cloudflare; no prompts or images are stored in the quota database or logged by this endpoint.

Atomic quotas use the **already-deployed** `ai_chat_quota` table, with **distinct `image:`-prefixed HMAC keys**. Every admission reserves all four in one transaction: 1 request/visitor/day, 1 request/visitor/minute, 5 requests/account/day and 1 request/account/minute. Daily buckets reset at midnight UTC, minute buckets at the start of each UTC minute. Rejected provider requests are **not refunded** to avoid retried billable submissions. Global account caps prevent a new visitor cookie from bypassing site-level limits. The counters measure local attempts, **not actual Neurons or external Cloudflare account usage**. External consumers or a later account upgrade invalidate the financial assumptions; a confirmed isolated **Workers Free** account and separate monitoring remain mandatory.

Tests cover feature gates and account isolation, mocked PostgreSQL atomic update/limit/outage/UTC buckets, strict Origin and consent handling, malformed bodies, upstream 429/503, binary response/cookie/cache and no unauthorized provider call. These are mock/focused tests, **not** an executed PostgreSQL concurrency proof or a live provider acceptance test.

**Still NO-GO:** Independent provider/account/billing attestation, disposable PostgreSQL parallel-race test, browser UI and explicit privacy copy, safety review, user consent journey, measured output/Neurons on the intended host, and explicit release approval. In particular the API-first path does **not** authorize using the same paid-enabled account as the active chat service. Public image links must remain hidden.

### Disposable PostgreSQL CI gate

The dedicated GitHub Actions workflow `.github/workflows/ai-image-quota-postgres.yml` runs the two real transaction/concurrency tests against an ephemeral `postgres:16-alpine` service with synthetic credentials and database `pt_image_test` on port 55439. The test rejects other database hosts, names or usernames. Outside this specially configured workflow, these tests intentionally skip rather than accidentally contacting an unknown database. This job is a local admission-integrity gate, not an account/Neurons, production database or provider availability test.
