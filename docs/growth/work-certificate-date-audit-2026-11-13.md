# Work certificate date audit - 2026-11-13

The approved focus program includes work certificates alongside address
conversion, invoices and formal letters. This bounded correction follows a
20-case synthetic source audit; it does not claim a full legal or export audit.

## Reproduction and scope

The existing validator checked only whether required date fields were nonempty.
It accepted `2026-02-30`, `not-a-date` and an employment period ending before it
started. Preview/export navigation calls this validator, so reversed dates could
reach the generated certificate. Four regression tests failed before the fix;
seven compatibility cases passed.

Validation now requires actual Gregorian `YYYY-MM-DD` values, including leap-year
rules. Valid end dates may equal the start date but cannot precede it. Existing
required-field messages remain; optional end dates stay optional, and the stale
disabled end date for a current employee stays ignored. No future-date, issuance
period, employment eligibility or legal-certification policy was invented.

The audit initially classified an omitted end date as invalid. The field's
optional type, UI label and existing render branch establish that omission is
supported, so that audit assumption was corrected rather than changing product
behavior to satisfy it.

## Verification checkpoint

- Four new regressions reproduced the defect before implementation.
- 48 focused tests passed, including all 37 existing certificate tests.
- Fresh nonincremental TypeScript passed after correcting a test fixture that
  assigned `undefined` to an exact optional property; omission is tested by
  deleting the property instead.
- All 20 synthetic source scenarios matched the supported validation rules after
  the correction. This is not production/browser/PDF acceptance.
- Independent read-only source review found no actionable findings.
- `pnpm ci:quick`: PASS, 2,166 tests in 281 files, including lint, typecheck and
  local-first checks. This branch is based on main and does not include the 27
  additional tests on the separate address PR; these totals are not interchangeable.
- `pnpm ci:contracts`, `pnpm build` and canonical standalone smoke (11 routes):
  PASS, exit code 0. Documentation links were rechecked after adding this audit.
- Chromium at 1440px and 390px: reversed period shows the Persian validation
  error and no preview iframe; corrected period renders the synthetic employee in
  the iframe and clears form errors. No horizontal overflow, page exceptions or
  synthetic document marker in observed request URLs/bodies. Screenshots inspected.
- An initial browser assertion counted the empty Next.js route announcer as a
  form error. Inspection identified `__next-route-announcer__`; the final check
  excludes that accessibility announcer while checking the actual error region.
  Cookie-button accessible-name selection was also corrected before final visual
  acceptance. External trust-badge blocking and aborted account prefetches remain
  warnings. Real mobile hardware, paid exports and full PDF acceptance are NOT_RUN.

Raw synthetic fixtures, logs and screenshots remain outside Git. No real user
document, real payment or paid export credit was used.

## Export follow-up integrated from PR #279

A separate bounded probe called the current PDF helper with a blocked popup
(`window.open` returning null). The helper still resolved successfully. The paid
form then has a path to confirm its export reservation despite no print window.
This was observed with a synthetic stub, not by consuming a real credit. The
helper also invokes browser print rather than downloading generated PDF bytes.
PR #279 subsequently replaced that helper with local PDF generation/download.
The integrated form cancels its reservation on generation failure and confirms
after initiating the download. Mocked-credit component tests and Chromium file
downloads passed. Production credit/refund behavior still requires live acceptance.

## Release boundary

The CI standalone build uses the same bounded 4 GiB heap correction verified in
PR #277, where the default 2 GiB allocation exhausted memory during typechecking.
This prerequisite keeps all build/performance checks and the existing timeout;
it does not change application behavior or production memory configuration.

Candidate base is `4f5c00c1`; the separate address correction remains in PR #277.
Fresh public version/health during this session reported `d584a617`, status ok
and ready true. These are point-in-time runtime checks, not evidence that this
candidate is deployed. Merge and deployment follow the repository's explicit
owner-approval and canonical-release requirements.
