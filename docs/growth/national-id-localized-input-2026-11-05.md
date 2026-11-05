# National ID localized-input correction — 2026-11-05

## Scope and root cause

The public national-ID validator clears a pasted Persian-digit version of the existing synthetic test fixture while the ASCII version succeeds. The component's ASCII-only `digitsOnly` filter removes Persian and Arabic-Indic digits before the shared checksum validator sees them. The shared validator already supports these digits.

Normalize with the existing `toEnglishDigits` utility before filtering in `NationalIdValidator`. Preserve leading zeros, formatting, hide/show, copy, empty-state behavior and checksum rules. No dependency, endpoint, persistence, metadata or entitlement change is introduced. This verifies number structure/checksum only, not a person's identity. No actual personal identifiers or private search exports are used.

The unused legacy `ValidationToolsPage` component is outside this route's execution path and is unchanged. Other validators need their own evidence and review.

## Verification checkpoint

- RED: nine component tests, eight failures and the ASCII control passing before the fix.
- GREEN: all nine pass, including Persian, Arabic-Indic, mixed/formatted input, invalid checksum, repeated/short input, hide/show and clearing stale results.
- Focused component, shared validation and SEO tests: 22 PASS, exit 0.
- `pnpm ci:quick`: PASS, exit 0; 262 files / 1,970 tests. Lint has 11 warnings and zero errors. An initial test-only unsupported `getByRole` option failed typechecking; anchored name matching fixed the test and the complete gate then passed.
- `pnpm ci:contracts`, `pnpm build`: PASS, exit 0.
- Canonical standalone `pnpm smoke:local` with `SMOKE_HOST=127.0.0.1` / `SMOKE_PORT=3187`: PASS, exit 0, 11 route checks; equivalent to the POSIX `predeploy:smoke` wrapper. Assets were prepared by the canonical tooling; `next start` was not used.
- Built in-app browser on the standalone server: PASS for Persian and mixed input, Arabic-Indic input while hidden, show/hide, copied ASCII digits without separators, invalid checksum, clearing stale results, and Tab focus moving to hide/show. One H1 and no captured browser console errors. Dark-layout visual checks and document-width measurements passed at 390px (382px document) and 1440px (1432px document), with no horizontal overflow. The temporary viewport was reset and test tab closed.
- Physical mobile/software keyboard, manual screen reader and light-theme visual acceptance: NOT_RUN. Browser checks are local candidate evidence, not production acceptance.
- Independent source/test review: PASS; its documentation-gap finding is resolved by recording these results. Repository secret scan, staged Gitleaks, licensing checks and strict production dependency audit: PASS; zero reported vulnerabilities.
- First hosted run on `f2ad6a109b1e5fecfd8ba41fd4c4eeb28d641195`: FAIL in Chromium shard 2 before tests started. [Job log](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/42017213875/job/127210622853) shows compilation succeeded, then TypeScript exhausted the default approximately 2 GiB Node heap. The other three Chromium shards passed. The E2E production-build step now explicitly permits a 4 GiB heap; commands, assertions and security gates remain intact. Local `pnpm build` with that exact `NODE_OPTIONS` value passed, exit 0. This setting applies only to the CI build step, not production or the test step. Final-head hosted status is tracked in the PR after push.
- A branch targeting the invoice candidate does not trigger the existing main-only CodeQL pull-request workflow; main-targeted verification remains a release requirement.

## Release boundaries

This independent correction is based on invoice candidate `40030826d18151124649d478f3bdc23a5ab3eb6b`, separate from the date-input follow-up. It does not authorize merging its parent, this change, or deployment. Public version and health on 2026-11-05 still reported `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129` and ready status. Search ranking and CTR effects are unproven.
