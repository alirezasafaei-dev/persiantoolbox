# Work certificate date validation

**Goal:** Reject impossible or malformed certificate dates and reversed employment
periods before preview/export, without changing optional fields or credit rules.

**Design:** Validate native date-input values as real Gregorian `YYYY-MM-DD`
calendar dates in the existing shared certificate validator. Compare valid date
strings only. An inactive employee's end date stays optional; a current employee's
disabled stale end date stays ignored. Do not add future-date or issuance-period
policy without evidence of a product requirement.

**Scope:** `lib/work-certificate/types.ts`, focused regression tests and audit
documentation. No dependencies, network processing, template or export changes.

- [x] Reproduce malformed, impossible and reversed dates with failing tests.
- [x] Preserve leap days, optional end dates, existing missing-field messages and
      the current-employment toggle behavior.
- [x] Implement scoped validation and run focused tests plus clean typecheck.
- [x] Verify preview rejection and valid preview on desktop/mobile; run final
      quality, contracts, build and canonical standalone smoke.
- [ ] Obtain independent review, scan and prepare a signed reviewable candidate.

The blocked-popup PDF behavior found during the same read-only audit is a separate
export defect. No real credit was consumed; it is not repaired by date validation.
