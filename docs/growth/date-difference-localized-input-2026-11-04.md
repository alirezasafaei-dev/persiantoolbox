# Date difference: localized numeric input, 2026-11-04

## Confirmed problem and scope

Read-only production verification returned revision `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, health `ok`, ready `true`. In the actual in-app browser, pasting the synthetic Persian year `۱۴۰۵` into the start-year field left it empty. The same paste operation using ASCII `1405` worked; a fully entered consecutive Jalali date pair produced one day. The six inputs used HTML `type="number"`, which discarded the localized input before the component could parse it.

This is a demonstrated usability defect. Search Console motivated investigating this page; neither its cause nor its correction establishes why a particular search result has low CTR. Private search exports and raw queries remain outside Git. The earlier date-guide and fractional-input correction is historical completed work and is not repeated here.

## Bounded correction

- Use text inputs with the existing `inputMode="numeric"` hint, labels, stable IDs, styles and controlled state.
- Preserve the raw input and normalize Persian/Arabic-Indic digits only while parsing, with the existing `toEnglishDigits` helper.
- Accept surrounding whitespace, then require decimal digits only. Reject fractions, exponents, hex, signs, separators, slashes and suffixes without truncation or coercion into another date.
- Keep the existing calendar validators, supported ranges, exact-day arithmetic, approximate month/year output, calendar-switch reset and local-only processing.
- Native number steppers/min/max semantics are replaced by text entry; custom calendar/range validation remains authoritative. Keyboard focus and Tab navigation are preserved. Physical mobile keyboard behavior is not verified.

No new dependency, shared calendar algorithm, metadata, URL, analytics, storage, server endpoint or premium/export behavior changes are introduced. Canonical URL and one-H1 structure were checked in the built browser.

## Verification

| Check                           | Result                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Baseline focused tests          | PASS, 13 tests before edits                                                                                   |
| Genuine regression              | Five localized/mixed-digit cases FAIL before the correction and PASS afterward                                |
| Final focused checks            | PASS, 21 input regressions plus 3 date SEO contracts, exit 0                                                  |
| `pnpm ci:quick`                 | PASS, 261 files / 1,972 tests, exit 0                                                                         |
| `pnpm ci:contracts`             | PASS, exit 0                                                                                                  |
| `pnpm build`                    | PASS, exit 0                                                                                                  |
| Canonical standalone smoke      | PASS, 11 routes, exit 0; Windows `SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3187`, `pnpm smoke:local`                |
| Actual built-browser paste      | Persian Jalali `۱۴۰۵/۱/۱` to `۱۴۰۵/۱/۲`: one day; raw digits retained                                         |
| Gregorian/Arabic-Indic boundary | `٢٠٢٤/٢/٢٨` to `٢٠٢٤/٣/١`: two days                                                                           |
| Invalid/recovery behavior       | Fractional year shows the existing invalid-date alert and removes stale output; calendar switch clears fields |
| Keyboard/browser errors         | Tab moves start-year to start-month; captured browser error log empty                                         |
| Responsive review               | 390px and 1440px viewports reviewed; document widths 382px and 1432px, no horizontal overflow observed        |
| Independent source review       | PASS; no blocking finding                                                                                     |
| Production dependency audit     | PASS, zero vulnerabilities at every severity on the tested parent/candidate dependency set                    |

`predeploy:smoke` uses the same canonical local-smoke tooling; its POSIX environment assignment was expressed as Windows environment variables. The smoke tooling copies static/public assets and starts `.next/standalone/server.js`; `next start` was not used. The browser then exercised the actual date route on that built standalone server. Physical device, software keyboard, manual screen reader and Google ranking impact remain NOT_RUN/unproven.

External evidence includes `date-digits-ci-quick-20261104.log`, `date-digits-contracts-20261104.log`, `date-digits-build-20261104.log`, `date-digits-smoke-20261104.log`, `date-digits-audit-20261104.json`, and `date-digits-browser-20261104.json`. A browser assertion initially matched Next.js's empty route-announcer alert as well as the date error; scoping to the visible date-error text verified the expected alert. Product code and assertions were not weakened.

## Review and release boundary

The independent branch is `codex/date-difference-digits-20261104`, based on tested parent `40030826d18151124649d478f3bdc23a5ab3eb6b` from PR #245. Its review diff is limited to the date input, regressions and this evidence/index update. This is a stacked review candidate; the parent is not merged or deployed by this task. The PR must record the exact final SHA and hosted results after the signed commit/push; they must not be inferred from the parent's checks. Hosted verification is NOT_RUN at this pre-commit checkpoint.

No staging/production mutation, indexing request or search-title experiment was performed. After an explicitly approved release, verify localized paste on the live revision. Any subsequent search comparison must use equal windows, stable page/query/country/device scope and the actual release date; do not attribute pre-release traffic changes to this fix.
