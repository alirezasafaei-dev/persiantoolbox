# PersianToolbox Image AI — Separate Cloudflare Free Account Runbook

**Decision:** On 2026-10-11 the owner chose a **separate Workers Free Cloudflare account for image generation**, instead of consuming the existing live chat account's shared Neuron allowance. This is an **account** isolation requirement, not simply a second API token or a second Worker.

**Current state:** DESIGN APPROVED; ACCOUNT CREATION **NOT VERIFIED / OWNER DASHBOARD ACTION REQUIRED**; separate image account ID **NOT VERIFIED**; image API token **NOT VERIFIED**; real FLUX inference **NOT_RUN**; production enablement **NO-GO**. Existing chat is unaffected. Source: draft [PR #239](https://github.com/alirezasafaei-dev/persiantoolbox/pull/239), tracker [#238](https://github.com/alirezasafaei-dev/persiantoolbox/issues/238).

## Step 1 — Create the dedicated Free account (owner Cloudflare dashboard)

Cloudflare supports creating additional standalone Free accounts within the **same Cloudflare user login**, without registering a second email identity (see [official create account docs](https://developers.cloudflare.com/fundamentals/account/create-account/), last updated Sep 17, 2026). Requirements: the Cloudflare user must be active for **at least seven days**, a **Super Administrator** on an existing account, and have fewer than **five additional Free accounts** created via this flow.

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/) using the current authorized user profile. Open **Accounts** (or the account switcher) and select **Create Account**.
2. Name the **new** account `PersianToolbox Image AI`. Confirm this is a new **standalone Free account**. Do **not** transfer the production domain or existing Workers/AI chat to it. Do **not** enable a Paid subscription or add payment information for this workflow.
3. Open the newly created account. Verify its selected plan is **Free**, and record its **Account ID** in protected operator secrets management (do not post the ID with any token publicly). Compare it securely to the chat account ID: they **must differ case-insensitively**.
4. Go to **Workers AI** within the **new account** and inspect the dashboard's usage / daily Neuron allocation. Workers Free has **10,000 Neurons per UTC day**, shared only by usage inside that new account. Capture a redacted operator attestation (account name, plan type, date, and usage; **no keys or full personal information**).

**Do not claim completion from this document.** Mark Step 1 PASS only after the owner/operator actually sees the new account in Cloudflare.

## Step 2 — Provision a token scoped only to image account

Use the official [Workers AI REST API token guide](https://developers.cloudflare.com/workers-ai/get-started/rest-api/) while the new image account is selected:

1. Go to **Workers AI → Use REST API → Create a Workers AI API Token**. Review the template before creating; alternatively, configure a custom user API token with **Account → Workers AI → Read and Edit** only.
2. Restrict **Account Resources** to the **specific new image account**, not all accounts. Reject any scope containing Account Settings Edit, Billing Edit, DNS Edit, Zone Edit, Workers Scripts Edit or all-account write permissions unless separately justified.
3. Use the official dashboard to copy the token **once directly into the approved protected secret store**. Never paste it into ChatGPT, GitHub issues/PRs, logs, URLs, a terminal command, shell history, or a tracked `.env` file.
4. Keep the original production chat account/token unchanged. Confirm the new token and new Account ID are different from chat's values without printing either value.

**Do not make an inference request** merely to check token creation. Step 2 PASS needs account-specific token scope evidence (redacted permission list) and protected storage.

## Step 3 — Fail-closed application admission

The existing application checks for each of these environment variables:

| Variable                                             | Meaning                                                                 | Preparation status                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| `AI_IMAGE_CLOUDFLARE_ACCOUNT_ID`                     | ID of **new account**, 32 hex characters                                | MISSING until Step 1                          |
| `AI_IMAGE_CLOUDFLARE_TOKEN`                          | Distinct token scoped to **new account**, server only                   | MISSING until Step 2                          |
| `AI_CLOUDFLARE_ACCOUNT_ID` and `AI_CLOUDFLARE_TOKEN` | Existing chat identity, for strict separation checks                    | Keep untouched                                |
| `AI_VISITOR_SECRET`                                  | Existing signing secret for pseudonymous quota keys                     | Keep protected                                |
| `AI_IMAGE_FREE_PLAN_CONFIRMED`                       | Owner verified **new** image account is Free                            | Must remain absent/false until Step 1         |
| `AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED`                | Owner compared **new** account to chat account and reviewed token scope | Must remain absent/false until Steps 1–2      |
| `FEATURE_AI_IMAGE_ENABLED`                           | Public image route/UI enablement                                        | **MUST remain false** until all release gates |

Never install production environment variables outside the canonical authorized immutable blue-green release process. A feature flag is **not** a verified billing lock: a later external Free→Paid upgrade requires immediate re-attestation and disabling the feature pending review.

**No separate database schema is required:** the draft uses atomic HMAC-hashed `image:` keys in the existing `ai_chat_quota` schema, separate from the production chat quotas.

## Step 4 — Bounded single-image acceptance, still not public

Perform only in an isolated approved test environment after Steps 1–2, separate test authorization, and explicit operator acknowledgement that **one inference consumes real Free Neurons**.

- Before: inspect Workers AI model eligibility, **Free** account plan and remaining daily Neurons in the **new** account dashboard; no AI Gateway or fallback.
- Inject credentials from the protected store into the test environment without displaying them. Check image/chat Account IDs differ and token scope is image-account only.
- Set `AI_IMAGE_SMOKE_AUTHORIZATION=authorize-single-inference` **only for this single test run**, with `AI_IMAGE_FREE_PLAN_CONFIRMED=true` and `AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED=true` after their evidence gates.
- Run from the isolated checkout: `pnpm exec tsx scripts/ai/image-one-shot.ts`. It sends exactly **one fixed harmless prompt** to the official fixed `@cf/black-forest-labs/flux-1-schnell` REST API. There is **no retry, no image saving, no prompt/image/token printing**. It reports only `PASS`, fixed model, width, height, JPEG size, elapsed milliseconds. A missing prerequisite returns `IMAGE_ONE_SHOT=NO_GO_OR_FAILED` with exit code 1 **before network use**.
- After: review new account's Workers AI usage and capture the actual Neuron delta if available. Compare it with the expected account-free allocation, check HTTP classification / Iranian egress if testing from authorized VPS, and document sanitized results.
- **Do not retry** on network/403/429 failure without revisiting plan/account gates. Running this script twice performs up to two inferences, not one globally.

Official pricing: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) (updated Oct 9, 2026). Workers Free allocation is 10,000 Neurons per UTC day; no paid overage on Free, further usage requires Paid upgrade. This documentation is **not** proof of actual dashboard tier or remaining balance.

## Step 5 — Separate release approval (not granted here)

Before merging or deploying PR #239, require: full exact-SHA CI, independent security/privacy review, documented trustworthy ingress/IP abuse protections, manual mobile + screen reader + literal browser 200% zoom, authorized Cloudflare account/token/inference/usage evidence, production backup and rollback gates, and **explicit owner approval for both merge and deployment** per [AGENTS.md](../../AGENTS.md) and [production safety contract](../ops/PRODUCTION_DEPLOY_SAFETY.md).

### Operator status checklist

- [ ] **P0 OWNER:** New `PersianToolbox Image AI` standalone Free account exists under authorized Cloudflare user.
- [ ] **P0 OWNER:** New account ID differs from chat; billing Free and no Paid/AI Gateway confirmed from dashboard.
- [ ] **P0 OWNER:** Workers AI Read/Edit token created with **only the new account** selected.
- [ ] **P0 OPERATOR:** Protected image secrets injected in isolated test environment, no credentials published.
- [ ] **P0 OPERATOR:** One authorized fixed-model inference PASS; actual account usage observed.
- [ ] **P1 SECURITY:** Trusted ingress/IP throttling and traffic abuse review PASS.
- [ ] **P1 QA:** Manual mobile, zoom 200%, screen reader and privacy checks PASS.
- [ ] **P0 OWNER:** Explicit merge and production release approval granted.

All items remain unchecked unless evidenced; **no new Cloudflare account or token has been created by ChatGPT in this session**.
