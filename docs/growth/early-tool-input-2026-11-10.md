# Early tool input preservation — 2026-11-10

## Defect and approach

Production release `05b8c05f8d33953b1c4b419ac69cb16bbcf1f7f5` showed server-rendered salary and Base64 controls losing edits when React became interactive. Waiting for a ready marker made tests pass but did not preserve real early user input.

Four maintained Playwright tests deliberately hold all Next.js scripts, fill visible server controls, then release scripts. All four failed against unchanged production: Base64's action remained disabled and salary returned to its default. Tests cover 390px and 1440px; salary includes Persian digits, clearing a default, calculation after hydration and reset.

The candidate adopts the textarea DOM value once in a layout effect. Salary adopts changed values from its own SSR numeric controls in a layout effect, including empty edits, and uses the same unchanged normalization function as normal NumericInput events. It does not change salary formulas, legal data, network calls, dependencies, global CSS or unrelated forms. Advanced controls are initially absent and do not need a pre-hydration snapshot.

## Evidence checkpoint

- RED: 4/4 delayed-script tests failed against live production with the expected lost-input symptoms.
- GREEN: 4/4 tests passed against the rebuilt canonical standalone runtime.
- Build and canonical 11-route smoke passed.
- Normal Base64 regression: all 16 desktop/mobile executions passed, including SSR headings, schema, typography and Unicode round-trip.
- Independent scoped review: no correctness, security or data-loss blocker. Coverage expanded to every currently rendered salary numeric field, decimal/integer normalization, calculation and reset; all four expanded tests passed.
- Initial full quality run: 2,107 PASS and one five-second timeout in the unrelated Search Console property-selection test. Its focused suite subsequently passed all 22 tests. The full rerun passed that test but timed out in an unrelated admin-settings test. The full run with two workers passed all 2,108 tests in 271 files; no assertion or timeout limit was weakened.
- Raw logs, traces and screenshots remain in private local evidence outside Git; no entered real customer data is used.

## Release boundary

Not deployed. The owner authorized autonomous implementation, testing and PR preparation. PR #263 publication approval does not authorize publishing this new revision. Exact-head review and separate merge/release approval remain required by AGENTS.md.
