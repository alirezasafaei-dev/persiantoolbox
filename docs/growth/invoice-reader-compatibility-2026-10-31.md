# Invoice PDF reader compatibility - 2026-10-31

## Disposition

**Metadata search and dense-page horizontal extraction: PASS in the tested PDFium engine. Overall PDF copy/search acceptance: FAIL. Keep PR #245 Draft; no merge or deployment is authorized.**

This continues the [RTL candidate](invoice-rtl-quality-2026-10-30.md), within the existing local-only invoice export. No dependency, endpoint, arithmetic or entitlement change is included.

## Root-cause evidence

The unchanged writer's two-page control used the same three Latin values alone on page one and beside a Persian label on page two. PDFium 156.0.8076.0, through bundled pypdfium2 5.14.0, found all three isolated values. It failed to find `INV-0003` and `React 19` beside the label; the control URL passed. In the actual mixed-invoice fixture, all three failed. The owner separately reported that native Chrome found `React 19` only on the control's first page. This is owner-reported manual evidence, not agent-observed browser verification.

PDFium spatially groups text objects and applies a simplified whole-line bidi reconstruction. Its [official reverted mixed-direction fix](https://pdfium.googlesource.com/pdfium/+/17cf94b52e01507108da6460ebca6b48995a698e%5E!/) documents unresolved mixed-direction ordering and the pure-RTL regression caused by disabling automatic line reversal. This source is consistent with our controlled failure; it does not prove that every reader or PDF producer behaves identically.

A second, distinct defect appeared on dense continuation pages: extraction inserted line breaks between individual glyphs, including the isolated footer URL. In PDFium's [text-page implementation](https://pdfium.googlesource.com/pdfium/+/refs/heads/main/core/fpdftext/cpdf_textpage.cpp), one-character text objects inherit the page-wide orientation heuristic. Multi-character horizontal objects can establish their orientation from their own glyph origins.

## Bounded corrections and proof

- Emit each direction run with equal vertical offsets using a standard `TJ` array. Its spacing adjustments preserve nominal CID widths, font units, and shaped origins. Runs with varying vertical offsets retain individual positioning, preserving mark order. No invisible text, directional-marker substitution, rasterization or ActualText experiment is included.
- Put the generated invoice ID below its Persian label. Put the footer URL and Persian tagline on separate baselines. This protects these controlled values without modifying arbitrary user descriptions.
- A real-font regression test first failed because the identifier shared its text line with the Persian label. A second content-stream test guards complete horizontal text objects. Existing real-font, pagination, loading, arithmetic and warning tests remain required.
- Actual PDFium found the invoice ID on each first page of four generated fixtures, and the exact footer URL on all seven pages. The four long-invoice pages have zero single-character lines; representative Persian text and fractional quantities remain present.
- Two unchanged-layout control pages rendered pixel-identically before and after grouped emission using Poppler. All seven final invoice pages were rendered and visually reviewed for shaping, marks, bounds, repeated headings and totals. The only intended layout changes are the ID and footer baselines.

The earlier grouped-LTR probe was rejected as a solution to whole-line mixed-bidi reconstruction. Grouped emission is now retained for the separately reproduced orientation defect; it does not resolve or reclassify the original failure.

## Remaining gate and next action

`React 19` inside a Persian description or payment term still fails exact PDFium search. PDF.js passing and the metadata corrections do not unblock complete PDF acceptance. Native Chrome verification of the changed invoice remains **NOT_RUN**; the owner will open local PDFs manually when needed. Browser security controls were not bypassed.

Independent review found no actionable correctness or security issue in the bounded code change and approved retaining it on the Draft branch. A separately scoped export-architecture experiment is needed before proposing a wider compatibility fix; a different library, tagged text or browser printing must first demonstrate the failing mixed-text cases and preserve the local-only download contract. None is assumed to work or authorized for release. Acceptance criteria have not been lowered.

## Verification checkpoint

- Focused invoice suite: 19 tests; combined invoice/security suite: 34 tests, all passing.
- Final sequential local gates, after the [dependency correction](../ops/dependency-security-2026-10-31.md): `pnpm ci:quick` passed 260 files / 1,941 tests; `pnpm ci:contracts`, `pnpm build`, and canonical `pnpm smoke:local` passed, all exit 0. Smoke used PowerShell `SMOKE_HOST=127.0.0.1` / `SMOKE_PORT=3187`, with the standalone server and copied assets, and passed 11 checks.
- An earlier full run hit the unchanged Search Console property-selection test's five-second timeout. Its 22-test suite and both later complete runs passed without changing the test or timeout. A later lint run caught a missing brace in the new emission branch; it was corrected before the final passing gates.
- A fresh download event from the final built local browser returned a real one-page PDF. Its 1.5 quantity, 10 percent tax and 5,000-toman discount agree with the 160,000-toman UI/PDF total. The downloaded bytes were independently parsed, rendered and visually reviewed. PDFium finds its exact invoice ID and URL; `React 19` still fails, as documented. This is built-browser download proof, not native Chrome copy/search acceptance.
- Strict production auditing and its report validator passed with zero advisories across 565 dependencies. Formatting and diff checks passed; pre-commit/push secret checks and exact-head hosted outcomes belong in the delivery receipt.

No production change, ranking improvement, conversion increase or field-performance gain is claimed.
