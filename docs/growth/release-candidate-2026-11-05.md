# Growth quality integration candidate — 2026-11-05

## Purpose and approved scope

Assemble the independently reviewed corrections into one genuine `main`-targeted candidate so integration checks and the existing main-only CodeQL workflow can run. This is branch preparation and review, not a merge into `main` or a deployment.

The fetched base is `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, also the public production revision observed on 2026-11-05. Existing owner checkouts and all source PR heads remain untouched.

| Component                               | Reviewed source                                     | Evidence                                                        |
| --------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| Invoice PDF/export and dependency audit | PR #245, `40030826d18151124649d478f3bdc23a5ab3eb6b` | [Invoice report](invoice-composite-text-2026-11-04.md)          |
| Persian/Arabic date input               | PR #246, `2af52e8af8660f9577e25026041753ef7ab0936d` | [Date report](date-difference-localized-input-2026-11-04.md)    |
| National-ID input and CI build heap     | PR #247, `1dcc83160331f9e87c48743399c03c5ab28ac2df` | [National-ID report](national-id-localized-input-2026-11-05.md) |
| Mobile measurement race                 | PR #248, `ec570a3f48b6f12c42a136e2cfc8b99a83aa2619` | [Mobile report](mobile-touch-target-race-2026-11-05.md)         |
| Unified PWA/push ownership              | PR #249, `c8e871f1af000db005b66f64b743c9e6ca0ab9bb` | [PWA report](pwa-worker-ownership-2026-11-05.md)                |

## Assembly and verification plan

1. Preserve the reviewed PWA descendant on a new isolated integration branch. Apply the date-input commit without automatic commit, inspect staged scope and retain both roadmap entries. No source PR is rebased, force-pushed or merged on GitHub.
2. Compare feature source files to their reviewed heads. Invoice implementation/package files and PWA runtime files must be unchanged; date component/tests/report must exactly match PR #246. The combined index and this integration report are new documentation.
3. Run fresh `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build` and canonical standalone smoke. Verify relevant built-browser journeys against the combined output. Report any failures/retries/skips explicitly.
4. Run staged and commit-range secret scans, strict production dependency audit, licensing, ignored-file and current GitHub policy checks before signed commit/push.
5. Open a Draft PR with the real destination `main`. Verify the exact final head, full triggered checks and CodeQL. This is the integration candidate's evidence; stacked/inherited checks do not substitute for it.

## Canonical browser launcher correction

Integration review found that the pre-existing Playwright production launcher used `next start` despite standalone output. The candidate replaces that launcher with a test-only wrapper that imports canonical `prepareStandaloneRuntime()` and `resolveReleaseSha()`, injects both release-SHA environment values, and directly loads `.next/standalone/server.js`. The existing localhost:3100 endpoint, retry policy and CI test selection stay unchanged. A production configuration contract prevents returning to `next start`; health assertions now require a valid release identity even when an unrelated local dependency is degraded. The migration fixture starts on plain `/robots.txt` because Firefox downloads the manifest document. No deployment path is introduced. Historical hosted runs using the old launcher remain regression evidence rather than canonical acceptance.

## Combined local evidence and Firefox boundary

The final complete `pnpm ci:quick` gate passed 264 files / 1,986 tests, exit 0. Contracts, the combined application build and canonical standalone smoke (11 routes) also passed. The production configuration guard and real health-identity assertions exercise the corrected launcher. Browser-internal verification of the combined date page passed Persian consecutive dates (one day), invalid fractional input with stale-result removal, calendar-switch reset, Arabic-Indic Gregorian leap boundary (two days), Tab focus, one H1 and no captured console errors. That temporary browser tab and local server were closed after testing.

Chromium's canonical production-mode run passed all 36 selected mobile, offline, ownership/migration, geometry-regression and health-identity checks without retries or skips. Firefox is assessed by explicit scope, not a blanket success claim:

- Thirty targeted mobile/keyboard/navigation, root-worker boot, cache-messaging, geometry-guard and health-identity cases passed with zero retries/skips. This scope excludes emulated offline navigation and route-seeded legacy replacement; it is not a pass of the complete Firefox suite.
- An attempted Firefox offline suite failed after 22 passes. Diagnostic tracing showed an actual server `GET /date-tools` 21ms after offline navigation began, despite `navigator.onLine === false`. The worker returned a live HTTP 200, so the emulation had not disconnected worker-origin traffic. Real offline fallback in Firefox is NOT_VERIFIED under this harness; the unchanged full-suite failure is retained, not skipped or weakened.
- The initial Firefox migration fixture downloaded the manifest instead of navigating. After moving setup to `/robots.txt`, legacy-script installation still failed before candidate navigation; that fixture did not establish Firefox migration behavior. Same-scope replacement in Firefox remains NOT_VERIFIED. Chromium's complete migration assertion, including rejection of stale legacy registration, remains required and passes.
- Temporary request/worker diagnostics were removed from source. Raw failed and successful receipts remain outside Git. No test is disabled to manufacture a green Firefox suite.

## Release boundaries and unresolved evidence

No merge, staging deployment, production deployment or indexing request is authorized. Subsequent release operations remain subject to [production deployment safety](../ops/PRODUCTION_DEPLOY_SAFETY.md) and [live verification](../ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md). A later merge creates a separate revision that must pass its applicable gates and receive the required owner authorization before deployment.

The twenty inherited skipped cases, physical-device/manual accessibility checks and real push-provider delivery remain unverified. Original PDF reader failures and intermediate candidates are historical evidence, not acceptance of a remaining bug. The reviewed invoice candidate's actual reader checks are documented separately; no universal-reader or ranking/traffic outcome is claimed. The historical cache-info timeout and initial unrelated SEO test timing cause remain UNPROVEN, even though the root-worker ownership defect is reproduced and corrected.

Final local and hosted receipts are recorded in the candidate PR against its immutable head after observation. This document describes preparation and does not declare a release complete.
