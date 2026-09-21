# Phase 11.5 final deployment review

## Current snapshot

- Reviewed production SHA: `7c9559c569e618f187e3a222d6c6ee1cfdef530b`.
- Deployment run: [35562641880](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35562641880), successful.
- Coordination issue: [#47](https://github.com/alirezasafaeigfx/persiantoolbox/issues/47).
- Historical failed run: [35551767845](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35551767845).
- Historical candidate evidence remains in [`next-phase-candidate.md`](./next-phase-candidate.md); this file records the current snapshot and does not rewrite that history.

## Release authority

### Historical release approval — NOT VERIFIED

For the earlier merges and deployments (including runs 35551767845 and 35562641880), no explicit owner approval after the visible deployment hold has been verified in the evidence available to this review. This does not prove that approval was never given in a separate local Codex conversation. The local executor should inspect only the relevant existing project conversation and record a short approval excerpt with its time/reference if found; otherwise retain NOT VERIFIED. Reports posted under the owner's GitHub account and successful workflow runs prove activity, not that the owner authorized it.

### New release actions — NOT AUTHORIZED

This review authorizes repository corrections and verification only. No new merge, staging/production deployment or rollback is authorized or performed. Do not infer permission from the historical successful release, an approval of design, or an instruction to continue review.

## UI and 200% zoom evidence

- The old test name `200% zoom` was inaccurate. `deviceScaleFactor: 2` is now named and reported as **DPR 2 density**, not browser zoom.
- The automated checks cover search and secondary hero-action visibility, the six task-link href values, keyboard order, 44px target heights, horizontal bounds with nonnegative vertical coordinates, and horizontal overflow at mobile DPR 2. They do not establish click-through navigation, successful search submission, absence of all overlap/clipping, or full vertical viewport containment. Below-the-fold content is allowed and requires scrolling.
- Actual browser zoom at 200%: **NOT_RUN**. Playwright's supported API here does not set browser UI zoom; CDP page scale and device scale are different measurements. Manual Chromium/Firefox verification is required and must capture the tested SHA, theme, viewport, keyboard path, clipping/overlap result, and screenshot. No PASS is claimed for actual browser zoom.

## Timeout investigation

The raw `production-post-deploy-35551767845.md` artifact shows:

| URL | Attempts | Result |
| --- | ---: | --- |
| `/` | 2 | `This operation was aborted` on www and apex candidates |
| `/tools` | 2 | `This operation was aborted` on www and apex candidates |
| `/loan` | 2 | `This operation was aborted` on www and apex candidates |
| `/salary` | 2 | `This operation was aborted` on www and apex candidates |
| `/date-tools` | 2 | `This operation was aborted` on www and apex candidates |
| `/offline` | 2 | `This operation was aborted` on www and apex candidates |
| `/admin/site-settings` | 2 | `This operation was aborted` on www and apex candidates |

`/api/health` and `/api/ready` returned 200; database read/write and backup checks passed. The report also recorded all four security-header checks aborted. This proves requests exceeded the report's 5-second request deadline and the strict job failed closed. It does **not** prove that cold start was the sole cause. The issue update calls cold-start SSR the cause based on the captured report, but no application/server timing trace is present in the artifact; the causal explanation remains **UNPROVEN / follow-up review**.

Run 35562641880 used the same strict report with `--timeout-ms=30000`; all smoke URLs and headers returned 200, the report passed, and rollback was skipped. The timeout increase is a verification-window change, not a site-speed improvement. Strict non-zero failure handling and the rollback step remain in [`deploy-production.yml`](../../../../.github/workflows/deploy-production.yml), and the workflow still uploads the report.

## Status separation

| Area | Status | Evidence |
| --- | --- | --- |
| UI implementation | PASS for merged SHA | candidate report and focused E2E |
| Automated tests | PASS on deployment SHA CI | run 35562641880 deploy-gate and prior PR checks |
| Merge | Historical PR #50 already merged; no new merge | Issue #47 owner update |
| Deployment | PASS for historical run 35562641880; no new deploy | workflow and report artifact |
| GSC/GEO | **BLOCKED** | no authorized current/previous complete 28-day export or read-only credential |
| Actual browser zoom 200% | **NOT_RUN** | automation limitation documented above |

## GSC input required

To unblock GSC/GEO, provide an authorized read-only export or access for property, complete latest 28 days and preceding 28 days, search type and filters, pages, queries, country/device dimensions, and Page indexing report/reasons. Keep raw exports, private queries, keys, and tokens outside the public repository.

## Follow-up review of PR #61 head `82333c905fd82fe2d024ace25ae4d92635e2f347`

- CI was rechecked for this exact head; prior SHA results were not reused. Core checks passed: CodeQL, licensing-docs, contracts, quality, build, four Chromium E2E shards, smoke, security, readiness-artifacts and CodeRabbit status. LHCI **FAIL**: [run 35602488459](https://github.com/alirezasafaeigfx/persiantoolbox/actions/runs/35602488459), job `106341645223`, homepage performance score `0.72` below the configured minimum `0.75`. The four Lighthouse runs completed and the report artifact was uploaded (`10639503199`); this is a performance-gate failure, not a browser-test failure.
- Browser inventory: installed Google Chrome `153.0.8010.48` at `C:\Program Files\Google\Chrome\Application\chrome.exe`, Microsoft Edge `153.0.4234.48`, and Playwright Chromium `1208` at `C:\Users\ASDEV\AppData\Local\ms-playwright\chromium-1208\chrome-win64\chrome.exe`. The required Computer Use `node_repl`/Sky GUI control surface was not exposed in this session, so real browser UI zoom could not be set or evidenced. Actual 200% zoom remains **NOT_RUN**, pending manual owner collaboration. No device scale, CSS zoom or CDP page scale result is substituted.
- Historical release approval remains **NOT VERIFIED**. Project Issue #47 contains owner-authored activity reports and explicit statements that new approval was required, but no short approval excerpt before runs `35551767845` or `35562641880` was found in the project history inspected here. This does not prove that approval was never given elsewhere.
