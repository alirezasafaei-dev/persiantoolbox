# Business Word layout follow-up — 2026-11-12

Status: local candidate; not merged or deployed.

Real paid-download acceptance exposed left-aligned Persian party/notes paragraphs and a narrow total column. The downloaded archive was rendered read-only through installed Microsoft Word. All test parties and invoice contents are synthetic; account/payment evidence is retained privately.

## Scoped repair

- Explicit RTL paragraphs with direction-relative start alignment, preserving centered titles and numeric cells.
- A shared six-column DXA grid for header and body, fixed table layout and RTL visual order.
- Separate Latin/number runs inside item descriptions to preserve mixed-text order.
- No dependency, entitlement, calculation or credit-policy changes.

## Evidence

- Regression test failed on the original missing RTL paragraph properties before implementation.
- Generated OOXML test checks paragraph direction, alignment, table direction/layout and identical header/body/grid widths.
- 86 focused unit tests passed, including paid-access and document rendering suites.
- Synthetic candidate generated through the actual export function and rendered by Microsoft Word to one A4 PDF page; visually verified party alignment, notes, RTL column order, amount fit and React 19.
- Local contracts passed, including licensing and documentation link checks.

## Remaining gates

Production build and canonical standalone smoke (11 routes) passed. All 9 Chromium business-document browser checks passed on the standalone candidate. Full ci:quick passed: lint (11 existing warnings, zero errors), typecheck, local-first gate and 2,139 tests across 277 files. The subsequently added Latin-run assertion also passed in the focused test. Independent review was attempted but returned a tool usage limit; it has not passed. No new release approval has been requested.

PDF printing remains a separate open defect: blocked popups currently return success and confirmation can precede the print/save outcome. Browser afterprint alone cannot establish that a file was saved. Do not describe the paid PDF flow as verified or complete, or consume another paid credit as part of this Word layout verification.
