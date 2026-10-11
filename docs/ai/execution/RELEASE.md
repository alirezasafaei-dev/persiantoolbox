# AI workspace release — 2026-10-11

## Release identity

- Production commit: `f58ef7ad7937de8810df5de4dd3a09ffffdec0f4`, independently observed through the public version endpoint and the active process version endpoint.
- [Chat workspace PR #233](https://github.com/alirezasafaei-dev/persiantoolbox/pull/233), [homepage test readiness PR #232](https://github.com/alirezasafaei-dev/persiantoolbox/pull/232), and [tools layout stability PR #234](https://github.com/alirezasafaei-dev/persiantoolbox/pull/234) are merged.
- [Official production run 38140816741](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140816741) succeeded. Owner approval covered merge and release. Migrations, recovery override and legacy bootstrap override were disabled; strict post-deploy reporting was enabled.
- Previous production `cf370c54afc31e7ececc9f384f572e907a08443b` remains running as the verified rollback target. No manual rollback was performed.
- A fresh database backup passed `gzip -t`, is nonempty and has mode `0600`. This proves archive integrity, not restoreability. Protected production configuration retained mode `0600`.
- Canonical deploy safety audits, candidate/static checks, repeated public asset checks, smoke/header checks and the cross-site deploy guard passed. Private backup contents, configuration and infrastructure paths are excluded from this report.

## Exact production-head CI

| Gate             | Run / result                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Core CI          | [38140422992](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140422992), PASS |
| Lighthouse       | [38140422959](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140422959), PASS |
| Deploy readiness | [38140423004](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140423004), PASS |
| CodeQL           | [38140422977](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140422977), PASS |

Core E2E shard totals: **215 passed, 2 flaky tests that passed on retry, 20 skipped**. The flaky cases were OCR (retry 2) and the mobile hybrid journey (retry 1). This is not a zero-flake result. The release workflow also ran **251 test files / 1878 unit and API tests**, all passing. The dedicated enabled-chat suite passed 10/10 on PR #233; it is separate from the general-suite totals.

Lighthouse on this exact production head: `/` performance 0.94 / CLS 0; `/blog` 0.92 / 0.005961; `/pricing` 0.91 / 0.108752; `/tools` 0.92 / 0.005961. Existing thresholds were retained. The tools fix reserves initial dashboard space and reuses the loading skeleton; the accepted regression test observes actual navigation layout shifts. Discarded blocked-JavaScript harness attempts are not counted as evidence. See [tools stability evidence](TOOLS_LAYOUT_STABILITY.md).

## Live acceptance

[Date-stamped live report](../../reports/live-verification/20261011-1554-persiantoolbox.md): **LIVE_VERIFICATION_PASS_WITH_WARNINGS**. All 21 acceptance groups passed after bounded, documented verification-harness corrections. Scope: 53 distinct HTML paths, 20 static bodies, ten actual blog articles and nine tools with real output or required-field validation. One real chat inference returned HTTP 200 and rendered a Persian reply in 2122 ms. History opt-in/reload/erase, mobile menu/dialog/themes, online service-worker navigation and foreign-origin 403 passed. Mandatory second page requests took 84–196 ms.

JavaScript page exceptions were zero. The broader run recorded nine console errors / 87 network events: eight external trust-seal timeouts, expected trial authentication 401, and 78 navigation aborts. These are retained as warnings; this is not a zero-error log result. No first-party 5xx or JS/CSS/font 404 was recorded. Physical-device and other manual gaps below remain open.

## Remaining external and manual checks

- Image generation remains **BLOCKED / default off**. [Issue #230](https://github.com/alirezasafaei-dev/persiantoolbox/issues/230) and [draft PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229) remain open. Direct transport/TLS reachability does not resolve the provider's generation authorization (`403`, registration required). Provider-authorized access and a bounded successful generation are required before release; no paid fallback or access-control workaround was introduced.
- Physical mobile/software-keyboard testing, manual screen-reader acceptance, true browser zoom 200% and a database backup restore rehearsal are **NOT_RUN**. Desktop Chrome with a mobile viewport is not a physical-device test.
- Cloudflare Free billing status remains operator-attested, not verified by a Billing API. Live quota stress was not performed; isolated database/mocked-provider quota and concurrency tests passed earlier.
- Historical intermittent production DNS timeout root cause remains **UNPROVEN**. This successful release does not establish that it is permanently resolved. No resolver changes were performed.
- Documentation commits after the application release are not deployed application identities. Do not deploy a docs-only commit to make the version endpoint match the handoff branch.
