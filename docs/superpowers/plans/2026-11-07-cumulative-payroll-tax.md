# Cumulative payroll tax 1405 implementation plan

**Goal:** Implement the previously missing official in-year A/B/D computation and document the actual remaining eligibility boundary.

**Authorization and design:** Owner requests completion of the existing legal verification work without repeated general approval questions. Reuse the clean isolated worktree, branch from deployed main937ec518. Extend the existing tax tool locally; no dependency, server processing or new payroll export. Keep ordinary annual balance compatible. A separate cumulative panel avoids conflating previously withheld annual tax with previous lists' computed tax.

**Primary specification:** INTA `https://www.tax.gov.ir/action/do/download/227`, linked as the1405 calculation instructions at `/action/do/show/16`. SHA256914fa9dbd04c74f2aebe82135dba6b358b641d83ff1f255c5fd495b7ff0ceb35. Both original pages rendered and read. File specification `/action/do/download/226`, SHA256ee28d1b9bb33ba9d2869cc5f397eed9b4bfd343d9832418d4a5bbc68ea833b09, table10 restricts1405 exceptions to faculty/judges (older oil/clinical exceptions explicitly limited to1403/1404).

## Task1: source-derived calculation

- [x] Add failing `features/salary/cumulative-tax.test.ts`: zero totals; ordinary1/2/12months; all boundaries; A/B weighted exemption; ordinary bracket shift rather than unchanged thresholds; B10%; D5% without article84exemption; previous tax counted once; signed adjustment/credit; invalid month/amounts; multiple lists in same month; annual compatibility.
- [x] Implement `features/salary/cumulative-tax.ts`. Inputs are cumulative net classified A/B/D bases in toman, after item-level exemptions/legal deductions but BEFORE general article84 exemption. Payroll/payment list month determines one monthly exemption and scaled brackets per month, independent of employment months or number of lists. Compute A/B proportional shares using A+B only; shift each ordinary cumulative threshold by B share. Clamp component taxable portions to zero. D has no general exemption. Preserve signed current tax and expose payable/credit. Validate finite nonnegative safe monetary inputs and overflow; do not round to whole toman.
- [x] Update annual ordinary function to use month12/A-only engine while preserving its public result shape and errors.

## Task2: product and provenance

- [x] Add `components/features/salary/CumulativeTaxBalance.tsx` to existing tax tool: labeled Persian numeric inputs, filing month1..12, A/B/D helpers, source link, computed-tax prior-list input, breakdown and recoverable blank/invalid state. No payroll data leaves browser.
- [x] Unsupported personal/geographic tax relief must suppress results explicitly; no inferred eligibility or automatic5%gross bonus. Explain this boundary separately from supported A/B/D rules.
- [x] Update partial-review copy and field-level provenance; remove cumulative A/B/D from pending only after tests/review. Preserve unrelated insurance/eligibility/transport pending scope and old whole-dataset date.
- [x] Update handoff and source audit with primary URLs/hashes, tested examples, PASS/FAIL/NOT_RUN and explicit remaining cases.

## Task3: acceptance and integration

- [x] Independent review against original two-page guide and file specification; fix substantive findings.
- [x] Run focused tests; `pnpm ci:quick`; `pnpm ci:contracts`; `pnpm build`; canonical standalone `pnpm --config.shell-emulator=true predeploy:smoke`; built Chromium desktop/mobile Persian paste, recovery, unsupported relief, source, breakdown and no horizontal overflow. Inspect real screenshots.
- [ ] Staged diff inspection, repository security checks/secret scan/ignored sensitive paths/license validation/current GitHub terms before signed commit and push. Draft a new independently reviewable PR with exact-head CI. New release requires owner authority applicable to that concrete candidate; do not describe local or CI evidence as live behavior.

Universal payroll certification is not a deliverable that these formulas alone can prove: documentary eligibility, every insurer, and every legal exemption are distinct. The final report must identify any unresolved rule precisely rather than deleting a warning to create a false closure.
