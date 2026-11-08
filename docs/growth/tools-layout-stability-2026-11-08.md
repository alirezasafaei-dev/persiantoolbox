# Tool-hub layout stability follow-up

The owner ended additional payroll legal research and returned priority to product quality and organic growth. PR #256 is deployed as `472fcafc2ce9d968f2f27dda82ebfa94af4b4c7a`; public version and ready health were rechecked for this follow-up. The previous handoff entries are historical checkpoints, not current runtime identity.

## Reproduced problem

Fresh Chromium measurements of the public `/tools` page at 390x900 produced CLS 0.2288, 0.2288 and 0.1684. At 1440x900 the samples were 0, 0 and 0.1213. These are six lab navigation samples, not field Core Web Vitals or a ranking outcome.

Layout-shift attribution identifies a mobile navigation height change from 77.5px to 100px when the brand wraps, and changes to the row arrangement of the breadcrumb/status strip as fonts arrive. Desktop font arrival also moves category controls and text. Blocking font requests in a browser-only control yielded zero shifts; that diagnostic is not a proposed product change. A browser-only font-display experiment did not solve the problem and was rejected.

A browser-only layout prototype retained the real fonts and reduced delayed-font CLS to 0.0100 at 390px and 0.0361 at 1440px. The actual product candidate still requires built-browser proof; prototype numbers are not acceptance results.

## Bounded correction and verification

Use the existing navigation appearance with an icon that does not shrink and a smaller single-line brand title on narrow screens. Give tool-shell breadcrumbs a predictable full-width row and retain the desktop arrangement. The first candidate passed mobile but desktop remained at 0.1218: attribution recorded a category button moving horizontally by 165px. Fixed category columns from the tablet breakpoint remove this row-fit instability. Mobile category wrapping stays unchanged. Preserve status text, long-label wrapping, keyboard access, dark mode, tool functions and URLs. No font, global breakpoint, dependency, analytics or infrastructure change.

The existing layout regression now deliberately delays local WOFF2 requests by 1500ms. It failed on the unchanged standalone build at CLS 0.2523 (390px) and 0.1218 (1440px), with retries=0 and the unchanged 0.1 threshold. Follow the [task plan](../superpowers/plans/2026-11-08-tools-layout-stability.md).

## Candidate verification

- `pnpm ci:quick`: PASS, 271 files / 2,109 tests; lint, typecheck and local-first gate passed. Final category-class change is also covered by the final build and focused browser checks.
- `pnpm ci:contracts`: PASS, including licensing and documentation links; final new documentation links are rechecked before commit.
- Final `pnpm build` and canonical standalone `predeploy:smoke`: PASS. Existing build warnings are retained.
- Built delayed-font regression at 320/360/390/768/1440: 5/5 PASS, CLS 0.001815 / 0.002567 / 0.011014 / 0.003820 / 0.002799. A further three repetitions passed 15/15 with zero retries; the 0.1 threshold is unchanged.
- Ten light/dark viewport captures and JSON search checks passed, no horizontal overflow. Mobile 360-light and 390-dark screenshots were visually read; remaining captures are retained as supporting artifacts. At 360px the brand text extends about 7px into a 14px clear gap, remaining visible without overlap; independent review treats this tight spacing as non-blocking.
- Independent read-only review: no important findings in the three components or regression test. Reviewer did not run tests or processes; execution results above are lead-observed.
- Secret scan and production dependency audit: PASS, no detected high-risk patterns or known vulnerabilities. No sensitive environment files are tracked.

Broader navigation checks and exact-head hosted CI are separate acceptance steps, recorded in the PR when complete. Physical-device testing and field-CWV measurement are NOT_RUN. A first private screenshot script used a mismatched search label; it was corrected to the existing input ID and all ten final captures/search checks succeeded. That private harness correction changed no product code.

Evidence scripts, measurements and screenshots remain private outside Git. The candidate is not merged or deployed; new release authority must name the reviewed revision. Payroll legal review remains stopped, and no guarantee of search position is made.
