# Mobile touch-target measurement race — 2026-11-05

## Reproduced failure

Hosted [Chromium shard 2](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/42018182427/job/127213879130) timed out twice waiting for the ninth visible target (`nth(8)`) and passed on retry 2. On baseline `1dcc83160331f9e87c48743399c03c5ab28ac2df`, the first local iPhone 14 homepage attempt reproduced the same `locator.boundingBox` timeout after 15 seconds with retries disabled. The planned ten-run baseline stopped after that failure; nine attempts were not run.

The test counted a live selector, then separately resolved each indexed target while the DOM could change. The homepage's deferred search replaces its placeholder button with a combobox. An earlier count is not a stable list of later targets. This is a test measurement race; no product layout defect or search-ranking effect is established by the timeout.

## Correction and regression protection

- Wait for the homepage's existing search combobox before measuring layout, as other homepage tests already do.
- Select targets and synchronously read geometry and diagnostics in one `evaluateAll` DOM task. Do not retain live indexed locators across asynchronous calls.
- Preserve the existing selector and minimum 24px width/height condition. Require a nonempty sample; do not silently skip null bounding boxes or swallow diagnostic failures.
- Fixture tests cover button, button-role link, button input and submit input, hidden-control exclusion, rejection of a named 23px control and an empty sample, and fresh sampling after removing a transient node.
- A separate deterministic race fixture removes a later node while the first descriptor is read and retains the selected node's captured geometry. With a temporary local restoration of the legacy count/`nth` loop, it failed at `nth(2).boundingBox()` after 15 seconds. Restoring the synchronous helper passed. The DOM property overrides exist only inside this synthetic fixture, never in product code. The earlier removal-after-sampling case alone does not establish race protection.
- No production component, route, styling, dependency, CI timeout, retry policy or skip condition changes.

## Local verification

Bundled Playwright Chromium 153.0.8010.12 was installed through the official Playwright command because the required local executable was absent. No product dependency or lockfile changed.

The canonical tooling had prepared static/public assets for the unchanged application's `.next/standalone/server.js`. A temporary test configuration pointed to that standalone server, with one Chromium worker, zero retries and no `next start` invocation. The test fixture pages contain synthetic controls only.

- Focused changed-file ESLint and `pnpm typecheck`: PASS, exit 0.
- Entire `mobile-ux.spec.ts` plus three regression fixtures: 24 PASS, exit 0, no retries or skips. This covers six routes and navigation at each of 375px, 390px and 360px.
- Final iPhone 14 homepage repeat: 10/10 PASS, exit 0, no retries.
- These are automated viewport/browser checks, not physical iPhone/Samsung or manual accessibility proof.
- Application build/full unit gates were not repeated locally for this test-only change; final-head hosted results are tracked in the PR after push.
- The twenty skipped cases in the preceding whole-repository hosted suite are outside this fix and remain unverified. Main-targeted CodeQL is still required after integration/retargeting.

## Release boundaries

This independently reviewable test correction is based on PR #247, separate from its national-ID product fix. No merge, staging or production deployment is authorized. Public version and health checked on 2026-11-05 still reported `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129` and ready status. Raw logs, screenshots and temporary configuration remain outside Git.
