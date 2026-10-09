# PersianToolbox — production live-verification report (2026-10-09 19:57 UTC)

**Scope:** 2026-10-09 browser-Origin hotfix / free online Persian AI chat.  
**Public URL:** https://persiantoolbox.ir  
**Canonical code:** [PR #218](https://github.com/alirezasafaei-dev/persiantoolbox/pull/218), merged `cf370c54afc31e7ececc9f384f572e907a08443b`.  
**Canonical release:** [deploy-production workflow, run 37962079002, attempt 3](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/37962079002) — **completed/success**. [Strict post-deploy artifact](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/37962079002/artifacts/11642001094), artifact ID `11642001094`.  
**Recorded field evidence:** [Issue #210 final verification](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210#issuecomment-6088275528).  
**Contract:** [Post-deploy live-verification policy](../../ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md).

## 1. Release identity, deployment, database and rollback

| Item | Observed, 2026-10-09 UTC |
| --- | --- |
| SHA active in public `/api/version` | `cf370c54afc31e7ececc9f384f572e907a08443b` |
| Active slot | `blue`, local `127.0.0.1:3000`, PM2 `persiantoolbox-blue` |
| Preserved rollback slot | `green`, `127.0.0.1:3004`, old SHA `07adf70d448656e83e226b7784d0cfb64de64694` |
| Canonical deployment | `deploy-blue-green.sh` → `ops/deploy/deploy-production-blue-green.sh`; release `production-manual-20261009T193235Z-cf370c54afc3` |
| Schema migrations this release | `RUN_MIGRATIONS=false`; **none run** |
| Fresh PostgreSQL backup | `/home/ubuntu/backups/persian_tools_predeploy_20261009T193235Z.sql.gz`, `0600`, compressed-file integrity **PASS** (`gzip -t`) |
| Independent restored-backup rehearsal for that exact new archive | **NOT_RUN**; do not confuse `gzip -t` with a restore test |
| Protected environment | `/home/ubuntu/persiantoolbox-blue-green/shared/env/production.env`, permissions `0600` |
| AI feature gates | `FEATURE_AI_CHAT_ENABLED=true`; `AI_CLOUDFLARE_FREE_PLAN_CONFIRMED=true` |
| Deployment lock after run | Unheld |
| Production disk free at final check | Approximately 7.9 GiB (84% filesystem utilization) |

Both local slots returned `/api/health` with `status=ok`, `ready=true`, database dependency healthy and distinct expected commit identity. The existing Green release remains the rollback target. No in-place rebuild of active Green was performed; nginx/PM2 slot selection was changed only by the canonical deploy engine. GitHub log contained both `PRODUCTION_SAFETY_AUDIT=pass` and `[production-deploy] success release=cf370c54afc3 slot=blue port=3000 rollback=green:3004`.

**Historical failure preserved for root-cause analysis:** Earlier workflow attempt 2 rolled back after strict `sw.js` public-header verification encountered intermittent DNS timeout from the VPS. Its retry was canceled before another traffic switch. The final run, attempt 3, passed all strict audits. Previous failure/cancellation is **not** proof of application unavailability or a permanently resolved DNS condition.

## 2. Security and actual Persian chat acceptance

Tests used **real Google Chrome desktop via Playwright on Windows**, plus a mobile viewport (390×844), against the **public HTTPS URL after switching**:

- Hydrated `/ai/chat` (not merely `DOMContentLoaded`), typed and submitted an ordinary Persian prompt using the actual Send button; API `POST /api/ai/chat` returned **HTTP 200**, JSON contained a **Persian `reply`**, and the **same reply rendered in the chat conversation**. No chat-specific request failure or browser page error was observed. Transcript and visitor tokens were not stored in this public report.
- Mobile Chrome viewport: `/ai/chat` HTTP 200; textarea visible; navigation menu opened and exposed navigable links. Full physical mobile-device testing was **NOT_RUN**.
- Reverse-proxy Origin regression test, deliberately invalid `text/plain` body to avoid provider inference: `Origin: https://persiantoolbox.ir` returned **415** (past failure was **403**); foreign `Origin: https://other.example` returned **403**. No relaxation of the foreign-origin gate.
- HTTP 429 quota exhaustion was **NOT_RUN live after this release**; schema and provider limits had been validated during the earlier AI chat implementation. Do not claim fresh live 429/anti-abuse acceptance from this smoke.
- Cloudflare Workers Free status is **owner/operator-attested**, not Billing-API-verified; no billing entitlement API proof. No paid fallback is configured in the released implementation. Provider billing risk cannot be declared mathematically zero should the account be changed externally.

## 3. HTTP and real-browser regression coverage

**Domain/SEO:** `https://persiantoolbox.ir/`, `/robots.txt`, `/sitemap.xml` each 200; `https://www.persiantoolbox.ir` → canonical non-www (301); HTTP apex → HTTPS (301); HTTP www → HTTPS www (301, then canonical). No synthetic URL guesses were counted as passing routes.

**Core routes:** **9 of 9 tested** returned 200: `/`, `/ai`, `/ai/chat`, `/blog`, `/about`, `/tools`, `/guides`, `/market`, `/topics`. **10 of 10 real blog posts** from the current sitemap returned 200 with an `h1`; a total of 19 distinct core/blog routes. Additional tools pages were probed separately. **Broken core/blog URLs observed:** none in tested set. No failed `/_next/static` responses or page errors recorded during the desktop regression.

**Navigation:** Homepage visible `/blog` anchor clicked; with `waitForURL` navigation resolved to `https://persiantoolbox.ir/blog` (**PASS**). Mobile menu opened (**PASS**). Full footer, every dropdown and all navigation targets were **NOT_RUN**, so do not imply exhaustive sitewide click coverage.

**Functional tool samples (no user data):**

| Tool | Browser finding | Evidence level |
| --- | --- | --- |
| `/tools/json-formatter` | Accepted sample JSON; Format produced formatted JSON | **PASS sample interaction** |
| `/tools/base64-tool` | Encoded `asdev` to visibly displayed `YXNkZXY=` | **PASS sample interaction** |
| `/loan` | Accepted sample amount/rate/term; Calculate changed result | **PASS sample interaction**; financial formula accuracy not independently audited |
| `/salary` | Sample numeric input accepted; form visible | **PARTIAL**; calculation output not separately asserted |
| `/tools/check-penalty` | Sample principal accepted and year selectors present | **PARTIAL** |
| `/text-tools/address-fa-to-en` | Address fields populated; Latin transliteration result **not conclusively verified** | **PARTIAL** |
| `/tools/persian-ocr` | Safe synthetic PNG accepted by file input | **PARTIAL**; OCR text accuracy **NOT_RUN** |
| `/image-tools/resize-image` | Safe synthetic PNG accepted | **PARTIAL**; transformed output **NOT_RUN** |
| `/contract-tools/rental-lease` | Next-step click produced form change/validation | **PARTIAL**; final generated contract **NOT_RUN** |

The original initial Playwright attempts contained test-harness mistakes (a pre-hydration Send click, checking a wrong field and selecting a disabled button). They were **not logged as site failures**; targeted hydrated tests and visible output checks superseded them. Screenshots/traces for P0/P1 failure: **none captured because no P0/P1 failure was observed in this tested set**. Test scripts were temporary and deleted after verification.

## 4. Residual risks and unresolved checks

1. **DNS operational warning — OPEN:** `curl` executed *inside the VPS* intermittently timed out during name resolution (bounded 3–5-second lookups) even though external requests, local application health and later VPS lookups passed. `systemd-resolved` listens on `127.0.0.53`; inspected upstream resolvers were `8.8.8.8` and `4.2.2.4`. **Actual root cause was not proven**. No resolver/network configuration was changed during/after deployment. See the [DNS diagnostic runbook](../../ops/PRODUCTION_DNS_RESOLVER_DIAGNOSTICS.md).
2. **Free billing check — OWNER ATTESTED only:** no permission for independent Cloudflare Account/Billing verification. Continue monitoring free-plan settings; do not misrepresent this as API verification.
3. **Live quotas, complete tool outputs, every footer/dropdown navigation, physical mobile devices, image OCR quality and full financial/contract flows:** **NOT_RUN or PARTIAL** as detailed. Focused browser smoke verifies the critical chat regression and key navigation/tool paths, not the whole 481-entry sitemap.
4. **Security cleanup — PASS:** the one explicitly owner-authorized, IP-restricted short-lived Germany-to-VPS SSH public-key entry was removed from `~/.ssh/authorized_keys` (17 other entries preserved, mode `0600`). Its paired temporary private/public key files were removed from Germany. No credential values were printed or committed. Direct Desktop Commander `asdev-vps` was online at conclusion.

## 5. Follow-up and rollback guidance

- Record/triage the DNS issue using **read-only** repeatable lookup evidence, then propose any resolver fix separately with owner review and rollback. Do not disable strict `sw.js` checks or TLS verification to mask an intermittent DNS timeout.
- Retain the pre-release Green slot and shared immutable static asset store. On a genuine severity-1 regression, use the [canonical production rollback procedure](../../ops/PRODUCTION_DEPLOY_SAFETY.md) and its approval gate; **this report is not rollback authorization**.
- If evaluating Cloudflare billing/tokens/quotas, use provider UI / least-privilege reads only; do not expose environment secrets.
- Source of truth for execution status: GitHub workflow, actual VPS state and this evidence-backed report. Commit of this **documentation-only** report is not a new application release and must **not** trigger an unsanctioned production deploy.

LIVE_VERIFICATION_PASS_WITH_WARNINGS
