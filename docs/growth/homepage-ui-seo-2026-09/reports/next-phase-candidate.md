# Homepage next-phase candidate

## Scope and state

- Base: `origin/main` at `c90f175096ab7053b8d2e7119ca2aaee85bb2407`.
- Branch: `feat/home-next-phase-20260920` in an isolated worktree.
- Verified implementation head before this evidence-only commit: `70d47cea38eeb81c7d4de349787c9e465f3c05a1`.
- Owner-approved design: `docs/superpowers/specs/2026-09-20-home-next-phase-design.md`.
- Implementation plan: `docs/superpowers/plans/2026-09-20-home-next-phase.md`.
- Scope: 18 tracked paths (homepage/CSS, consent-aware install prompt, cross-platform test support, browser/unit coverage, design/plan/report and five screenshots).
- Remote truth at finalization: `origin/main` is still the base SHA above; documentation PR #48 remains open and green, so its overlapping task board was not edited.
- MERGED: no.
- DEPLOYED: no; staging and production remain prohibited without separate explicit approval.

## Mobile task access

| Viewport | Baseline task heading top | Baseline first task top | Baseline first value-proof top | Candidate first task top | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| 360×800 | 1745px | 1829px | 1092px | 1176px | PASS; 653px earlier and before value proofs |
| 390×844 | 1641px | 1725px | 1012px | 1096px | PASS; 629px earlier and before value proofs |

## Search placeholder contrast

| Theme | Computed foreground | Opacity | Computed background | Rendered ratio | Result |
| --- | --- | ---: | --- | ---: | --- |
| Light baseline | `rgb(90, 101, 119)` | 0.48 | `rgb(255, 255, 255)` | 2.06:1 | RED; scoped correction required |
| Dark baseline | `rgb(123, 138, 166)` | 0.42 | `rgb(17, 26, 46)` | 1.92:1 | RED; scoped correction required |
| Light candidate | `rgb(71, 85, 105)` | 1 | `rgb(255, 255, 255)` | 7.58:1 | PASS |
| Dark candidate | `rgb(154, 166, 189)` | 1 | `rgb(17, 26, 46)` | 7.07:1 | PASS |

Visual evidence: `reports/next-phase/screenshots/` contains 360×800 and 390×844 full-page light/dark captures plus a 360×800 DPR2 equivalent-zoom capture. Keyboard order from the last hero action reaches the first task link; all six task links are at least 44px high and no approved viewport overflows horizontally.

## Consent/install matrix

| State | Expected behavior | Result |
| --- | --- | --- |
| Unknown consent after 45 seconds | Consent remains visible; install hidden while deferred event is retained | PASS |
| Rejected consent | Rejection resolves the gate; install becomes eligible | PASS |
| Accepted consent | Acceptance resolves the gate; install becomes eligible | PASS |
| Existing install dismissal | Install remains hidden | PASS |
| Manual install dismissal | Install hides and persistence remains independent of consent | PASS |
| `appinstalled` | Install hides, deferred state clears and dismissal persists | PASS |
| Storage read failure | Page does not crash; unresolved consent keeps install hidden | PASS |
| Component unmount | Consent listener is removed | PASS |

## GSC/GEO

BLOCKED after a sanitized local access audit:

- `GOOGLE_APPLICATION_CREDENTIALS`, `GSC_SITE_URL` and `GOOGLE_SERVICE_ACCOUNT_FILE` are not set in the process or owner-checkout environment files.
- Only the non-secret example property `GOOGLE_SEARCH_CONSOLE_SITE_URL` exists in `.env.example` files.
- The documented local credential path does not exist and no candidate Performance/Page-indexing export exists in the workspace.
- Smallest next action: provide an authorized read-only credential path or exports for the latest complete 28 days and preceding 28 days, including property, dates, search type, filters, pages, queries, country/device and Page indexing reasons.

No raw export, private query, credential value, or fabricated metric was read or committed.

## Verification log

| Command or scenario | Result | Evidence |
| --- | --- | --- |
| Design docs links and licensing | PASS | commits `31bc296a` and `3b4b70ac` |
| Playwright Windows server config contract | PASS | `tests/unit/playwright-config.test.ts`; environment moved to `webServer.env` |
| Mobile order RED | EXPECTED_FAIL | 360: first task 1829px vs value proof 1092px; 390: 1725px vs 1012px |
| Placeholder contrast baseline | EXPECTED_FAIL | Light 2.06:1; dark 1.92:1; both below 4.5:1 |
| Mobile/contrast GREEN | PASS | 3/3 focused tests; task offsets reduced, light 7.58:1, dark 7.07:1, keyboard/touch/DPR2 checks pass |
| Existing homepage E2E | PASS | 7/7 with one worker; an earlier two-worker dev run had 2 hydration-race navigation failures before passing in isolation |
| TypeScript | PASS | `pnpm typecheck` |
| Consent/install unit regression | PASS | 10/10 across component, analytics-consent and mount-contract suites |
| Windows SQLite cleanup regression | PASS | RED reproduced as `EPERM`; GREEN 2/2 after explicit test-only connection cleanup |
| Hydration/cold-compile E2E regressions | PASS | RED reproduced for four legacy interactions; GREEN 4/4 after readiness and cold-compile waits |
| Final Chromium matrix | PASS | 32/32 with one worker across next-phase, homepage and three mobile viewports |
| `pnpm ci:quick` | PASS | 225 files, 1759 tests, lint, typecheck and local-first gate |
| `pnpm ci:contracts` | PASS | release/PWA/links/docs/licensing contracts; feature audit reported expected missing local optional env warnings |
| `pnpm build` | PASS | 656 static pages; four pre-existing dynamic-filesystem tracing warnings in `app/api/admin/ops/logs/route.ts` |
| Standalone smoke | PASS | 11/11 route checks on `127.0.0.1:3100` |
| Formatting/diff/licensing | PASS | relevant files formatted; `git diff --check`; 8 license assets and 3 consistency assertions |

All six branch commits preceding this evidence-only commit contain a `Signed-off-by` trailer. No workflow dispatch, merge, staging mutation or production deployment was performed.
