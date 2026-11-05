# Unified offline and push worker ownership — 2026-11-05

## Evidence and scope

The preceding hosted suite had an intermittent `service worker cache info timeout`. Fifteen baseline local repetitions passed, so its historical cause remains UNPROVEN. Investigation independently demonstrated a real ownership defect: application boot registered both `/sw.js` and `/sw-push.js` at the same `/` scope. A fresh built-browser test recorded both calls and failed its single-owner assertion. Four new unit cases also failed before the correction.

Registration is keyed by scope; the two script URLs update one root registration rather than provide separate offline and push registrations. The push-only script lacked the offline fetch and cache-info handlers. See [registration semantics](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register) and the [subscription/registration relationship](https://w3c.github.io/push-api/#dfn-associated-service-worker-registration).

## Final correction

- Both bootstrap and the subscription hook register `/sw.js` only.
- The existing push and notification-click handlers are inlined unchanged into the application worker. It has no secondary script dependency; CSP is unchanged.
- Cache version becomes `v14-2026-11-05`; existing cache isolation and network-only private routes are preserved.
- The deployable push-only URL is removed. Its exact legacy source lives only in a migration-test fixture, preventing old tabs from reinstalling it after upgrade.
- Migration uses the existing root registration, with no unregister, forced resubscription, permission request, server-side document transfer or dependency addition.

## Verified candidate

- RED: built browser recorded `/sw.js` and `/sw-push.js` at `/`; four focused unit cases failed on competing registrations/missing combined handlers.
- Focused unit checks: 13 PASS. They exercise one registration with push support, existing-subscription discovery without prompting/unsubscribing, push notification payload delivery to `showNotification`, click navigation and preserved offline/cache handlers.
- `pnpm ci:quick`: 264 files / 1,974 tests PASS, exit 0. Initial full run had one unrelated 5-second dynamic-import timeout in `seo-comprehensive.test.ts`; the complete 22-case file passed in isolation and the final complete gate passed unchanged. The initial failure is retained in external receipts; its timing cause is UNPROVEN.
- `pnpm ci:contracts`, `pnpm build`: PASS, exit 0.
- Canonical standalone `pnpm smoke:local` with host `127.0.0.1`, port `3187`: 11 checks PASS, exit 0; equivalent to the POSIX `predeploy:smoke` wrapper.
- Actual standalone Chromium: all eight offline cases plus two ownership/migration cases PASS, zero retries/skips. The migration fixture intercepts the first legacy script request in a fresh browser context, then removes interception before candidate navigation. One root registration, `/sw.js` controller, cache-info v14, public legacy 404, and a rejected stale `register('/sw-push.js')` with no waiting worker are observed.
- Cache-info, boot ownership and legacy migration repeated ten times each: 30/30 PASS, zero retries/skips.
- Independent corrected canonical review: 2/2 ownership cases PASS against the running standalone server. An extra review run used `next start`; it is discarded and is NOT canonical acceptance evidence.
- Changed-file ESLint/formatting PASS; production dependency audit reports zero vulnerabilities. Final commit/push security gates and exact-head hosted results are recorded with the PR.

## Remaining boundaries

Real provider push delivery, physical-device subscription endpoint preservation, Firefox and manual accessibility are NOT_RUN. Same-scope migration and synthetic existing-subscription tests support the design; they do not prove those external/device outcomes. No causal ranking or traffic improvement is claimed. The preceding suite's twenty intentionally skipped cases remain outside this correction.

Public runtime checked on 2026-11-05 remained `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129` with healthy/ready status. This change authorizes no merge or deployment. A main-targeted release candidate still needs its own exact-head checks, including CodeQL.
