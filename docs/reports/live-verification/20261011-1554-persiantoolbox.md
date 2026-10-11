# Production browser acceptance — 2026-10-11 15:54 UTC

## Identity and authorization

Production `f58ef7ad7937de8810df5de4dd3a09ffffdec0f4` was observed through `/api/version` and the active process version endpoint. [Official production run 38140816741](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140816741) completed successfully after owner authorization. Strict post-deploy reporting was enabled; migrations and recovery/legacy overrides were disabled. Previous production `cf370c54afc31e7ececc9f384f572e907a08443b` remains running as the verified rollback target. No manual rollback occurred.

## Scope and method

Actual installed Chrome 154 headless with Playwright 1.63, fresh isolated profiles, desktop 1440×900 and mobile viewport 390×844. No owner browser profile, pre-existing/user-supplied cookies, documents or private inputs were used. The application created its normal signed anonymous visitor cookie for chat quota enforcement. Tool fixtures, draft text and the single real-inference prompt were synthetic. This is browser acceptance, not physical-mobile acceptance.

**Acceptance URL count: 83 distinct first-party URL paths**: 53 HTML paths, 20 static assets, four OCR assets, five health/metadata endpoints (`health`, `ready`, `version`, sitemap, robots), and the chat security endpoint. Three additional HTTP/www starting URLs reached the canonical HTTPS apex. Ten additional blog-category paths were observed in the initial run but are excluded from the ten-article and 53-HTML counts. API trial authentication and an external trust-seal URL are diagnostic observations, not successful acceptance URLs.

The initial 21-group run recorded 19 passing groups and two wait failures. The footer/category and history checks were completed with bounded follow-ups that assert visible page content and actual persisted/erased state. The initial sitemap filter selected categories; a corrected follow-up explicitly excluded category/tag paths and tested ten real articles. A mobile follow-up waited for theme background transitions before screenshots. These are verification-harness corrections, not production changes. Original failure logs are retained; a blind full-suite retry and a second real inference were not performed. All 21 final acceptance groups passed.

## Route and interaction results

- All 32 unique footer/category destinations: actual browser navigation, HTTP 200 and visible main heading. Desktop free-tools dropdown → PDF tools, Blog client navigation and hard refresh passed. Mobile menu open/close and navigation to search passed.
- Ten actual blog articles from the current sitemap returned 200 and displayed their headings: URL encoding, JSON formatting, Base64, hashes, QR codes, passwords, date differences, international date conversion, monthly budgets and loan comparison. Blog index passed separately.
- Mandatory ten pages all returned 200 twice: `/`, `/blog`, `/about`, `/contact`, `/pricing`, `/tools`, `/contract-tools`, `/contract-tools/salon-contract`, `/contract-tools/vehicle-sale`, `/writing-tools/persian-writing-studio`. Second requests took **84–196 ms**, all below 2 seconds.
- JSON formatted the synthetic object; Base64 matched the known output; address conversion produced English output; loan and salary calculators produced results; manual CPI check-penalty calculation produced a result. Local image processing produced a download. OCR extracted text from a generated PNG using same-origin worker/core/language assets, with the scoped worker CSP. Lease-contract required-field validation displayed an alert. This is a nine-tool sample, not exhaustive feature/export/payment acceptance.
- `/ai/chat`: one real POST returned HTTP 200 and a Persian reply, rendered in the transcript in **2122 ms** from send to checked render. Default history storage was absent. Opt-in, synthetic draft restoration after reload and erase/read-back passed independently. No raw user conversation was collected.
- Mobile chat dialog open, Escape close and focus restoration passed. Both theme controls passed with no horizontal overflow and visible composer/send control. Stable dark suggestion backgrounds match the app surface (`rgb(17, 26, 46)`) with light text (`rgb(248, 250, 252)`); a screenshot captured mid-transition was not accepted as stable color evidence.
- Live `/tools` initial eligible layout-shift sum: **0.035515**, below 0.1 at 1440px. This is a navigation sample, not field CLS.
- Foreign-origin chat POST returned **403** without an inference call. Quota stress was not performed.
- With service workers allowed, the actual active registration was `/sw.js`; homepage hard refresh, chat navigation and release identity passed. Offline behavior was not tested.
- All 20 checked static bodies returned 200 with expected CSS/JavaScript/font/icon/manifest MIME types and nonempty bodies. No missing first-party JS/CSS/font was observed. Canonical deploy asset audits passed independently.

## Errors, warnings and failure evidence

**Broken first-party acceptance URLs: none. JavaScript page exceptions: zero.** Do not report a zero-console/zero-network result: the initial browser recorded **nine console errors and 87 network events**: eight external `trustseal.enamad.ir/logo.aspx` timeouts, one expected unauthenticated `/api/trial` HTTP 401, and 78 `ERR_ABORTED` requests during navigation to first-party route URLs. No first-party 5xx or static-asset 404 was recorded. Request queries were stripped, so the exact RSC/prefetch attribution of every aborted request is not proven. Accepted destination pages and explicit static checks passed.

Pricing displayed HTTP 200 and its heading in 2457 ms in an independent diagnostic, while `networkidle` did not settle within 20 seconds. An outstanding trial fetch was observed and the external trust image timed out in the broader run; the precise cause of every wait is not proven. Pricing/trial and trust-seal source are unchanged from the previous production SHA. Report these as operational warnings; do not change authentication responses or weaken tests to hide them.

The first history follow-up restored its draft but a late consent dialog intercepted the erase click; the corrected harness waited for and clicked the actual consent rejection control before verifying erase. A subsequent trial used the button's visible text instead of its accessible name and failed; it is not counted as passing evidence. The final history follow-up passed with no page/console/network errors. No production fix was required.

Private local evidence uses repository-relative ignored paths:

- `tmp/ai-release-live/report.json`, `failure-footer-links-and-categories.png`, `failure-chat-local-history.png`;
- `tmp/ai-release-live-footer/report.json`, `tmp/ai-release-live-articles/report.json`;
- `tmp/ai-release-live-history/report.json` and `tmp/ai-release-live-history-final/report.json` (failed harness attempts), `tmp/ai-release-live-history-confirmed/report.json` (accepted);
- `tmp/ai-release-live-mobile/report.json`, stable `chat-mobile-light.png` and `chat-mobile-dark.png`;
- `tmp/ai-release-live/chat-desktop.png`, `tools-desktop.png`; `tmp/ai-pricing-diagnostic.json` and `.png`; `tmp/ai-dark-diagnostic.json` and `.png`.

Screenshots and sanitized JSON have also been copied to the owner-facing local delivery directory. Raw deploy logs, protected state/configuration, database contents, credentials and backups are not committed.

## Operations and remaining limits

Canonical production safety audits passed twice; candidate and repeated public JS/CSS checks, smoke/header checks and the cross-site deploy guard passed. Active and retained process version responses were verified after release; nginx configuration validation passed in the official workflow. A fresh nonempty database archive passed `gzip -t` and retained mode `0600`; protected production configuration retained mode `0600`. A backup restore rehearsal is **NOT_RUN**.

Physical mobile/software keyboard, manual screen reader, true browser zoom 200%, offline acceptance and exhaustive tool journeys remain **NOT_RUN**. Two general CI cases passed only after retry; 20 CI tests were skipped. Cloudflare Free billing tier remains operator-attested. Historical intermittent VPS DNS timeout root cause remains **UNPROVEN**; no resolver change was made. Image generation remains default off and externally blocked by provider authorization, independently of this chat release; see [issue #230](https://github.com/alirezasafaei-dev/persiantoolbox/issues/230).

No fresh P0/P1 failure was found in the verified chat release and sampled core journeys. Retain the warning evidence and manual/provider follow-ups. See [release and exact-head CI evidence](../../ai/execution/RELEASE.md).

LIVE_VERIFICATION_PASS_WITH_WARNINGS
