# Invoice searchable text flow implementation plan

> **For agentic workers:** Use superpowers:executing-plans for this bounded task. Checkboxes record actual evidence, not expected outcomes.

**Goal:** Fix the demonstrated mixed Persian/Latin invoice search failures without reader-specific Unicode substitutions or a new PDF engine.

**Architecture:** Keep the existing local PDF generator, fonts, arithmetic and download contract. Reflow paragraphs containing both strong RTL and strong LTR text at resolved directional-run boundaries, retaining punctuation and logical source order. Give isolated Latin lines an LTR shaping base while preserving right alignment. Keep weak numeric-only Persian fields compact. The tradeoff is taller mixed-text rows and potentially more pages; validate pagination and readability rather than hiding it.

**Tech stack:** Existing pdf-lib, fontkit, bidi-js 1.0.3, TypeScript, Vitest, PDF.js; external bundled PDFium for actual search evidence.

## Constraints

- Owner requires the bug to be fixed; no non-blocking acceptance exception exists.
- The owner asked the implementer to resolve ordinary technical choices autonomously. No new dependency, print workflow, server-side document processing, merge or deployment is authorized.
- Preserve visible text, paired punctuation, grapheme boundaries, explicit paragraphs, arithmetic, entitlements, deferred loading and missing-glyph reporting.
- Use actual reader search and rendered pages as acceptance evidence. Source-only or PDF.js-only success does not close the PDFium gate.

## One deliverable: direction-safe visible text flow

**Files:** `lib/invoice-tools/{rtl-pdf.ts,bidi-js.d.ts,pdf.ts,export-error.ts}`, `components/features/finance/InvoiceGenerator.tsx`, the invoice unit/component tests, and invoice evidence/task documents. The lightweight component change reports an actionable error for bounded export failures; the PDF libraries remain deferred. No endpoint change is intended.

**Review refinements:** Keep text directly in page streams. A Form XObject experiment improved pypdf plain punctuation but broke its layout extraction and was removed. Reserve the exact summary/payment height when it fits a page. Bound exports at 10,000 UTF-16 units per field, 64 directional runs per paragraph, 200 rendered lines per field, 1,000 items and 100 pages. Reject excess input visibly without truncation or partial download.

- [x] Add real-font regressions for mixed descriptions, balanced/nested punctuation, unchanged numeric-only fields, source-content preservation, isolated Latin punctuation and text bounds. Observe the relevant failures before editing the writer.
- [x] Split mixed strong-direction paragraphs using existing Unicode bidi levels and grapheme offsets. Keep logical order, attach adjacent punctuation appropriately, and reuse existing width wrapping.
- [x] Choose the shaping base from strong text direction for isolated LTR lines; preserve RTL behavior for Persian and numeric-only fields.
- [x] Generate actual invoice fixtures covering client names, descriptions, payment terms, fractional quantities/tax/discount and long continuation pages. Verify exact Latin/Persian searches in PDFium and PDF.js, content preservation, column bounds and totals. Reproduce the old reader failure before the fix.
- [x] Render and visually review every sample page; check row heights, punctuation, repeated headings and footer separation. Reject unreadable or overflowing layout.
- [x] Run focused checks, `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, canonical standalone smoke and a real built-browser download. Preserve failed attempts and verification gaps accurately.
- [ ] Obtain independent review; run security, secret, license, ignored-file and GitHub policy gates; make signed commits and push the task branch. Verify final-head CI. Keep merge/deploy separate.

## Stop conditions

If the chosen reflow still fails the demonstrated searches, loses content or breaks reader/render behavior, keep acceptance FAIL and investigate that specific failure. Do not relabel it passed, rasterize the output, inject hidden directional text, invert PDFium's private transform, or replace the download with an unproven print path.
