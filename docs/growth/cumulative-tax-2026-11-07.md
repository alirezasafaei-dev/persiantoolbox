# Cumulative payroll tax source closure - 2026-11-07

## Finding

The earlier audit did not obtain the current official algorithm. This follow-up found it through the ordinary public [INTA salary-list service page](https://www.tax.gov.ir/action/do/show/16), which links both [1405 calculation instructions](https://www.tax.gov.ir/action/do/download/227) and [1405 file specification](https://www.tax.gov.ir/action/do/download/226). Both returned HTTP200; original calculation pages were rendered and read. The earlier assertion that in-year withholding could not be verified from available sources is superseded for the A/B/D scope below.

| Original                                                                     | SHA256                                                             | Evidence                                                                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculation guide,2pages                                                     | `914fa9dbd04c74f2aebe82135dba6b358b641d83ff1f255c5fd495b7ff0ceb35` | Both pages visually reviewed; formulas independently checked                                                                                 |
| File specification,22pages,version1.7.0.7,date1405/02/06                     | `ee28d1b9bb33ba9d2869cc5f397eed9b4bfd343d9832418d4a5bbc68ea833b09` | Table10 distinguishes current faculty/judge exception from oil1403/clinical1404 exceptions; table4 separately enumerates personal exemptions |
| [Budget requirements law](https://dotic.ir/news/19922),original PDF          | `eb94e2c65be91d589040c002bfcd360e7aae4527196d80f1e2b49f3fa2e39f98` | Article1covers income from principal/other payers                                                                                            |
| [Combined payroll-list regulation](https://dotic.ir/news/18603),original PDF | `3b077e2ae889b0b62c4f70ba9a784af9990d05a15c2edfe72fbf4ea759063852` | Articles2-7describe data, system calculation/corrections and insurer responsibility; not a substitute for the actual tax algorithm           |

Originals and screenshots are private local evidence, not committed binaries or customer data. Hashes identify reviewed bytes, not digital-signature verification.

## Implemented formula

Inputs are cumulative net classified A/B/D amounts for the list under review, after documented item-level exemptions and legal deductions, BEFORE general article84exemption. Ais ordinary progressive-rate income; Bis qualifying faculty/judge income; Dis only research contracts under article86paragraph2, not all research-related salary. User supplies the payroll/payment list month1-12and total tax computed for earlier lists, including previous lists in the same month.

The40million-toman monthly exemption and ordinary thresholds accumulate by filing month. A/B share the exemption proportionally to A+B; Ddoes not share it. Every ordinary cumulative threshold is reduced by B's exemption share, preserving bracket widths. Bis taxed10%after its share, D5%without the general exemption. Prior computed tax is subtracted once. Anegative difference is preserved as a correction for review, with separate nonnegative payable/credit displays; it is not an automatic refund or authority to offset a payment.

Examplemonth1: A100m/B100m/D200m,previous tax5m => exemption20m/20m; taxes11m/8m/10m; cumulative29m,current24m. Month2with the same bases => cumulative22m. Ordinary annual balance reuses month12/A-only calculation.

## Coverage and remaining boundary

| Scope                                                                                               | Status                                                                                                |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| In-year cumulative A,including multiple lists in one month                                          | IMPLEMENTED; source-derived regression coverage                                                       |
| Proportional A/B exemption,shifted brackets,faculty/judge10%,qualified research-contract5%          | IMPLEMENTED; source-derived regression coverage                                                       |
| Prior-list difference and negative correction                                                       | IMPLEMENTED; no refund guarantee                                                                      |
| Ordinary annual balance                                                                             | Preserved with shared calculation                                                                     |
| Personal/geographic relief,including combinations                                                   | UNSUPPORTED; selecting this scope suppresses the cumulative result                                    |
| Documentary eligibility,raw benefit classification,noncash valuation,corrective tax-list submission | Not automated; user must supply classified net bases; no submission/export claim                      |
| Full payroll/insurance legal certification                                                          | NOT_ESTABLISHED; unrelated overtime,transport,part-month and nonstandard-insurer findings remain open |

This closes the missing general cumulative algorithm and A/B/D special-rate source finding; it does not close all personal/geographic legal relief or turn the website into a certified filing service. Keep the narrower warning. Table4in the official file specification is a list of exemption categories, not enough evidence to invent their eligibility/combination formulas. No unsupported waiver was accepted by the owner.

## Validation

Initial focused run failed on the missing calculation module. After implementation,62focused tests passed, including38new cumulative scenarios and17existing annual scenarios. The first full typecheck/build caught a possibly absent first threshold; an explicit missing-table guard fixes it.

Final local acceptance: `pnpm ci:quick` exit0,270files/2096tests; `pnpm ci:contracts` exit0; `pnpm build` exit0; canonical standalone `pnpm --config.shell-emulator=true predeploy:smoke` exit0,11checks. Production-mode Chromium salary/cumulative suite7/7passed with zero retries at1440/390widths, including Persian/Arabic digits,B-only,D-only,negative correction,unsupported relief,invalid/oversized input and recovery. Desktop/mobile light/dark screenshot review passed with no horizontal overflow. Physical-device and live candidate testing NOT_RUN.

Independent source/code review found no remaining Critical/Important issue within A/B/Dscope after corrections: clarify payment-list month versus transmission date, support B/D-only input,avoid an unsupported cross-employer integration promise,and fix the test's month2expected total from20m to22m (25mprevious tax means3mcredit). Earlier browser failures retained in private logs were an occupied local smoke port,those erroneous expectations and an obsolete salary-warning assertion. Final full browser run passed after fixes and a fresh standalone build. No retry/forced-click/security bypass was used.

Repository secret scan and production dependency audit passed. Full certification still is not established for personal/geographic relief or the unrelated payroll findings. No production change is claimed here; exact-head hosted results remain pending branch publication.

Private evidence directory: `C:/Users/ASDEV/AppData/Local/PersianToolboxGemini/`, files `tax1405-calculation-guide.pdf`, `tax1405-list-guide.pdf`, `tax1405-calc-1.png`, `tax1405-calc-2.png`, `cumulative-red.log`, `cumulative-focused.log` and final gate logs.
