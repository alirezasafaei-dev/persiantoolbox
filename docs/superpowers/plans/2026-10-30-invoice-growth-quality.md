# Invoice Growth Quality Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in the current session. Steps use checkbox syntax for tracking.

**Goal:** Improve loading and reliable PDF export for the existing invoice tool selected from current search evidence.

**Architecture:** Keep the existing client component and arithmetic. Load PDF libraries inside the export function, align quantity handling with the preview, and use the existing toast provider for export errors. No server API or dependency is added.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, pdf-lib, existing toast UI.

**Spec:** [Invoice growth quality](../specs/2026-10-30-invoice-growth-quality.md).

## Global Constraints

- Persian UI and local-only document generation; no sensitive analytics or raw GSC exports in Git.
- Preserve canonical route, existing metadata, anonymous access and premium behavior.
- Preserve unrelated dirty owner files; work from the production-aligned main in an isolated branch.
- No merge or deployment without explicit owner approval.

## Review Focus

- Empty and zero quantities must agree between preview and exported totals.
- Positive and fractional explicit quantities must retain their existing arithmetic.
- Tax, discount and multiple rows must remain consistent.
- Failed PDF/font loading must show a Persian error and permit a retry.
- A first page render must not evaluate the PDF or fontkit modules.

### Task 1: Reliable, deferred invoice export

**Files:**

- Modify: `components/features/finance/InvoiceGenerator.tsx`
- Create: `tests/components/InvoiceGenerator.test.tsx`
- Create: `tests/components/InvoiceGenerator.loading.test.tsx` and `tests/unit/invoice-font-assets.test.ts`
- Restore: `public/fonts/Vazirmatn-Regular.ttf`; add its upstream `public/fonts/OFL-Vazirmatn.txt`
- Update: this plan and `docs/growth/invoice-quality-2026-10-30.md` with verified results.

**Interfaces:** Existing `InvoiceGenerator()` UI, client-only PDF download and `useToast().showToast()`.

- [x] Reconcile live version and fetched main, preserve owner changes, obtain read-only 28-day main-host Search Console comparison, and select the first tool.
- [x] Install the unchanged frozen lockfile and run existing invoice/SEO contracts (20 tests pass).
- [x] Write component tests for deferred module evaluation, quantity parity, multiple rows/tax/discount, and export failure/retry; watch the relevant cases fail before editing production code.
- [x] Use dynamic imports inside `generateInvoicePdf`, change export quantity fallback to match preview, and catch export errors with the standard toast hook.
- [x] Restore the missing regular font, verify its bytes against upstream v33.003, include the font license, and test actual font embedding.
- [x] Run focused tests, then `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, and canonical standalone smoke with Windows-compatible environment setup.
- [x] Verify local browser export and responsive layout. Profile mobile if the browser/profiling tools can reach the local candidate. Record unavailable evidence honestly.
- [x] Review the diff and privacy boundaries. Run repository security/secret checks, dependency audit, Gitleaks, ignored-file probes, DCO/CLA and current GitHub policy checks before a signed commit; repeat before push.
- [x] Prepare a task branch/draft PR when checks permit. Record exact SHA, evidence, and production status without deploying. PR #245 remains Draft; subsequent PDF reader compatibility work is still open.

### Follow-up: rendered RTL output

- [x] Correct sampled visual bidi/positioning defects and add description wrapping and pagination.
- [x] Obtain explicit owner approval for the limited direct `bidi-js@1.0.3` dependency exception.
- [x] Verify actual fonts, PDF.js field extraction, 45-row pagination/bounds, missing-glyph replacement and user warning.
- [x] Reproduce PDFium's dense-page vertical extraction, retain horizontal text objects, and verify isolated invoice ID/footer search. See the [2026-10-31 checkpoint](../../growth/invoice-reader-compatibility-2026-10-31.md). This does not satisfy the mixed-bidi gate below.
- [x] Fix the demonstrated PDFium `React 19` exact-token regression and paired Latin punctuation in the [direction-safe text flow candidate](../../growth/invoice-searchable-text-flow-2026-11-01.md). Measured PDFium tokens pass; pypdf plain punctuation/numeric failures remain and overall cross-reader acceptance is open.
- [ ] Complete native Chrome viewer verification of the new candidate. It remains NOT_RUN; keep PR #245 Draft and preserve the merge/deploy gates.
- [x] Compare owner-saved native Chrome printing with the failing mixed-text cases. The [2026-11-01 control](../../growth/invoice-native-print-control-2026-11-01.md) fails PDFium search; it is not a validated replacement export path.
- [x] Record the owner's 2026-11-01 correction: the brief acceptance of a limitation was revoked and the bug must be fixed. No acceptance exception, merge approval or deployment approval remains in effect.

## Execution ledger

- Native execution was already approved by the owner; no additional design approval is required under current AGENTS.md.
- Search Console connector subscription is unavailable; the existing signed-in browser provides authorized read-only export without new credentials or payment.
- Public production pages returned connection-closed errors in both browser surfaces during this session, while anonymous HTTP fetch worked in the prior audit. Use local browser verification and do not change proxy/network settings.
- Ruling: include restoration of the missing font and a small mobile row layout correction, because actual browser verification demonstrated broken exports and a 34px-wide description field. Both are in the selected invoice journey; no other tool logic was changed.
- Independent review requested font-failure retry coverage and an order-independent lazy-loading test; both were fixed. Six component tests pass with shuffled seed 7, and three real font/PDF asset tests pass.
- Final application logic and assets passed `ci:quick`: 258 files, 1,918 tests. The subsequent responsive class-only correction passed the nine focused invoice tests; final production build and browser geometry validate the layout.
- Local browser downloads succeeded after restoring the font and restarting the standalone server. The browser automation download event timed out; the actual downloaded PDF was independently read and verified (one page, zero totals for blank quantity). Do not report the event listener as passing.
- Ruling: use `md` for the desktop invoice row, because this repository defines `sm` at 360px. Measured mobile description width is now 268px and the document has no horizontal overflow at the tested viewport.
- Mobile Lighthouse is an honest baseline (76, LCP 5.9s), not a claimed performance win or completed 95+ target.
