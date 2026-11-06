# OCR file selection recovery — 2026-11-06

## Release checkpoint

The owner approved integration/release work on 2026-11-06. [PR #250](https://github.com/alirezasafaei-dev/persiantoolbox/pull/250) merged as `1b6cccddf2b3bbd1b5981d8bfcdae10c4b51d7a9`, with a tree identical to the reviewed candidate. All five main workflows succeeded, including CodeQL and the deployment gate. Detailed main E2E logs nevertheless contained 221 ordinary passes, one OCR retry-pass and 20 skips. The original candidate's retry-free PR run does not erase this later failure.

[Production workflow 42204420647](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/42204420647) was cancelled during its gate after focused reproduction. The deployment job was cancelled and no server deployment step ran. Public `/api/version` still reported `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129` after cancellation. Do not resume that obsolete release attempt or describe the merged changes as live. This follow-up remains a separate reviewable candidate.

## Reproduction and cause

The unchanged original OCR browser test failed three of five canonical standalone runs with retries disabled: the native input accepted `release-test.png`, but the preview/name never appeared. A diagnostic run captured five native change events with one file on connected inputs; `FileReader.readAsDataURL` started only in the successful case (four failures, one pass). Temporary instrumentation was removed.

The server-rendered input is available before the client component attaches its change handler. Native file selection remains in the DOM, but React state does not recover it. A deterministic browser regression holds application JavaScript, selects an image in server HTML, releases scripts and requires the recovered filename, preview and enabled extraction action. It failed against the old main build after confirming native selection. Component tests using server rendering and `hydrateRoot` also failed for preselected valid/invalid files while normal post-mount selection passed.

## Scoped correction and independent review

One shared callback retains the existing image validation and local preview behavior. A mount effect reads the existing native input file through that callback. No file is sent to an application server; worker/language assets, CSP, extraction, analytics and export behavior remain unchanged. No dependencies are added.

Independent review identified a related preview race: a recovered large image A could finish reading after a newly selected B, displaying A while labeling/processing B. A deferred-FileReader test reproduced that mismatch. Each valid selection now has a monotonic generation; only its current callback may commit a preview. Starting another selection clears the old preview, and effect cleanup invalidates outstanding callbacks. The regression also checks a third selection while its read is pending. Independent re-review found no remaining scoped findings and passed all four component cases. Invalid replacement after an already valid selection retains that previous selection with an error, as before; this patch does not redefine that behavior.

## Verification receipts

- Focused unit RED: two hydration cases failed and ordinary selection passed. Preview race RED: late A overwrote B. Final focused unit GREEN: three files / 12 cases, exit 0.
- Deterministic browser RED: native selection passed, recovered filename failed on the old build.
- Final application build passed, exit 0. An earlier build failed TypeScript because the new RTL tests used Playwright's unsupported `exact` option; anchored name regexes corrected the test API usage. No assertion was removed.
- Canonical standalone Chromium: all four related cases repeated five times, 20 passes, zero retries/skips. This includes deterministic early selection, real synthetic-image OCR with unchanged strict-CSP/same-origin assertions, native-share hydration and western-timezone blog dates.
- Canonical standalone smoke: 11 checks passed, exit 0. Built in-app-browser upload through the normal file chooser displayed the synthetic image and extracted `PERSIAN TOOLBOX TEST 123`; no console errors were captured. The temporary local server was stopped afterward. This is local-browser evidence, not live-site or physical-device evidence.
- Final `pnpm ci:quick`: 265 files / 1,990 tests passed, exit 0. Full `pnpm ci:contracts` passed, exit 0. The first quick-gate attempt stopped at three missing-brace lint errors in new code; those were corrected and new non-null-assertion warnings were removed. No lint rule was disabled.

Raw successful/failed test logs, synthetic fixtures and diagnostic receipts stay outside Git. Original OCR assertions and the existing retry/time limits are retained; no failure is hidden by adding a skip or increasing a timeout.

## Release boundary

Local and hosted candidate results do not prove production behavior. Merge/deploy approval for PR #250 does not silently substitute a newly changed release SHA. The follow-up must pass exact-head review and checks before the owner approves its integration/release. Physical-device/manual accessibility, Firefox offline/migration and real push-provider evidence from the broader candidate remain unverified. No ranking, traffic or indexing outcome is claimed.

DEPLOY_BLOCKED_NOT_VERIFIED
