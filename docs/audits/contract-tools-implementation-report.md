# Contract Tools MVP — Implementation Report

**Date**: 2026-06-26
**Version**: v6.8.0
**Status**: MVP Complete

## Product Positioning

This feature is ONLY:
"ابزار تولید پیش‌نویس قرارداد قابل ویرایش بر اساس اطلاعات واردشده توسط کاربر."

This feature is NOT:

- legal advice
- lawyer service
- real-estate agency service
- broker/intermediary service
- official registration service
- guarantee of legal validity
- e-signature authority

## Templates Implemented

1. **قرارداد اجاره مسکونی** (`rental-lease`)
   - 24 fields: landlord, tenant, property, term, financials, obligations, witnesses
   - 4 required clauses + 4 optional clauses
   - Full rendering with Persian digits, signature blocks, disclaimer

2. **قرارداد پیمانکاری / معماری ساختمان** (`construction-contractor`)
   - 28 fields: client, contractor, project, dates, financials, obligations, witnesses
   - 3 required clauses + 2 optional clauses
   - Full rendering with project details, payment structure, signature blocks

## Free/Premium Model

- **Free**: Preview, local draft, text download with watermark "پیش‌نویس / غیرنهایی", disclaimer
- **Premium** (flagged): PDF clean, DOCX editable, multiple drafts, advanced clauses (UI ready, feature-flagged)

## Schema Design

- `lib/contract-tools/types.ts` — Field definitions, clause definitions, template interface, validation
- `lib/contract-tools/templates.ts` — Template definitions with versioning
- `lib/contract-tools/render.ts` — Text rendering with Persian digit conversion
- `lib/contract-tools/draft-storage.ts` — Local-first draft persistence (localStorage)

## Local-First Privacy

- All contract data stays in browser localStorage
- No contract text sent to server
- Network interception test proves no unexpected requests
- Privacy text displayed in UI

## Test Coverage

- 27 Vitest tests: schema, validation, rendering, hashing, disclaimer checks
- Covers: rental lease rendering, construction contractor rendering, free/premium rules, no-legal-guarantee wording

## Premium Features Implemented

### Premium Export Pack

- `lib/contract-tools/export/docx.ts` — DOCX generation with `docx` package (branding support)
- `lib/contract-tools/export/pdf.ts` — PDF generation with `pdf-lib` (watermark support)
- `components/features/contract-tools/ExportPanel.tsx` — 4 export options: TXT, PDF draft, PDF clean, DOCX

### Safe Clause Library

- `lib/contract-tools/clauses.ts` — 20 pre-approved clauses (10 rental + 10 construction)
- 7 categories: obligations, financial, termination, dispute, confidentiality, insurance, special
- Risk levels: low/medium/high with review status

### Draft History

- `components/features/contract-tools/DraftHistory.tsx` — Load, delete, confirm delete
- Auto-save to localStorage with 1s debounce
- Load draft restores values and clauses

## Test Coverage

- 27 Vitest tests: schema, validation, rendering, hashing, disclaimer checks
- 12 export tests: DOCX, PDF, gating, Persian digits
- 20 clause tests: categories, risk levels, template matching
- **Total: 59 contract tests**

## Files Created/Modified

### New Files

- `lib/contract-tools/types.ts`
- `lib/contract-tools/templates.ts`
- `lib/contract-tools/render.ts`
- `lib/contract-tools/draft-storage.ts`
- `lib/contract-tools/clauses.ts`
- `lib/contract-tools/export/docx.ts`
- `lib/contract-tools/export/pdf.ts`
- `components/features/contract-tools/ContractWizard.tsx`
- `components/features/contract-tools/ContractFormFields.tsx`
- `components/features/contract-tools/ContractClauseSelector.tsx`
- `components/features/contract-tools/ContractPreview.tsx`
- `components/features/contract-tools/ExportPanel.tsx`
- `components/features/contract-tools/DraftHistory.tsx`
- `app/contract-tools/page.tsx`
- `app/contract-tools/rental-lease/page.tsx`
- `app/contract-tools/construction-contractor/page.tsx`
- `tests/unit/contract-tools.test.ts`
- `tests/unit/contract-export.test.ts`
- `tests/unit/contract-clauses.test.ts`

### Modified Files

- `lib/tools-registry.ts` — Added contract-tools category + 3 tool entries
- `lib/navigation.ts` — Added contract-tools to category nav

## Legal Disclaimer

این ابزار صرفاً بر اساس اطلاعات واردشده توسط کاربر، پیش‌نویس قرارداد تولید می‌کند و جایگزین مشاوره حقوقی، وکالت، خدمات مشاور املاک، داوری یا ثبت رسمی نیست.

## Remaining Risks

1. Templates need lawyer review before production use (marked `needs-legal-review`)
2. Premium export (PDF clean, DOCX) is feature-flagged — needs payment integration
3. No server-side draft sync (by design — local-first)
4. Persian PDF rendering limited by pdf-lib standard fonts (Helvetica doesn't support Arabic script)
5. More templates needed: services, NDA, receipt

## Commands Run

- `pnpm typecheck` — PASS (clean)
- `pnpm lint` — PASS (0 errors, warnings only)
- `pnpm vitest --run` — PASS (658/658)
- `pnpm vitest --run tests/unit/contract-tools.test.ts` — PASS (27/27)
- `pnpm vitest --run tests/unit/contract-export.test.ts` — PASS (12/12)
- `pnpm vitest --run tests/unit/contract-clauses.test.ts` — PASS (20/20)
