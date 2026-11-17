# Invoice localized money implementation plan

> Execution: use the executing-plans workflow; keep the correction independently reviewable.

**Goal:** Persian and Arabic monetary inputs must produce the same invoice preview and PDF totals as equivalent ASCII inputs.

**Design:** Reuse `parseLooseNumber` from the existing shared number utilities in the invoice component and its PDF generator. It already normalizes Persian/Arabic digits, thousands/decimal separators and direction marks. Keep empty-input zero behavior. Retain the existing native numeric quantity control, form layout, export flow and dependencies. A new parser would duplicate existing behavior; normalizing only the UI would leave direct PDF generation inconsistent.

**Scope:** `components/features/finance/InvoiceGenerator.tsx`, `lib/invoice-tools/pdf.ts`, and the existing component/export regression suite. No metadata, global breadcrumb, credit or provider changes.

**Constraints:** local-only document processing, pnpm, no new dependencies, existing Persian UI and error handling.

- [ ] Add parameterized regression cases to `tests/components/InvoiceGenerator.test.tsx`: ASCII, Persian, Arabic and mixed-digit prices/tax/discount with grouped prices and decimal tax. Use quantity 1.5, price 100000, tax 10.5%, discount 5000; require preview and PDF payable 160750 and tax 15750.
- [ ] Run `pnpm exec vitest run tests/components/InvoiceGenerator.test.tsx`; confirm localized cases fail on the incorrect total before implementation.
- [ ] Replace each numeric `parseFloat` in the two scoped source files with `parseLooseNumber(value) ?? 0`. Use the parsed tax rate for conditional preview display. Do not modify the shared parser.
- [ ] Re-run component/export and shared-number tests, then `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build` and canonical standalone smoke (`SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3100`, `pnpm smoke:local` on Windows).
- [ ] Verify local standalone invoice at desktop/mobile width with localized sample input and an actual PDF download. Retain failure evidence and inspect resulting numeric totals. No paid operation is required for this simple invoice route.
- [ ] Review source and diff, run licensing/security/secret scans, sign the commit and prepare a PR. Report exact-head hosted results separately from production; no new deployment is implied.

## Reproduction evidence

On 2026-11-17 the live invoice at 390px returned 160000 for ASCII quantity 1.5, price 100000, tax 10 and discount 5000. Replacing the three text monetary inputs with equivalent Persian digits returned zero. The current component and PDF generator both use ASCII-only `parseFloat`. This proves an input defect, not the cause of a Search Console traffic change.
