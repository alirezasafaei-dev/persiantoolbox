# Next Safe Implementation Candidates — 2026-07-04

## Candidate 1: CSP Report-Only Tests
Branch: test/csp-report-only-coverage
Files: tests/unit/csp.test.ts (new or extend proxy-csp.test.ts), perhaps lib/csp.ts if needed for testability.
Risk: LOW
Tests: add unit for nonce, report-only header.
Impact: better coverage before any enforcement.
Rollback: delete test file.
Depends: #93 (for context)

## Candidate 2: /loan - Defer Non-Critical After Result (post #91)
Branch: perf/loan-defer-saved
Files: components/features/loan/LoanPage.tsx (move SavedFinanceCalculations to after result + useEffect idle or dynamic further).
Risk: LOW (if after #91 review)
Tests: high-traffic async state test, manual /loan.
Impact: reduce initial client tree for /loan.
Rollback: revert the defer.
Depends: review #91 first.

## Candidate 3: React-hooks/exhaustive-deps Batch 1 (safe files)
Branch: chore/lint-react-hooks-batch-1
Files: selected files with low risk (e.g. not complex effects), add // eslint-disable-line if justified or fix simple ones.
Risk: LOW-MEDIUM
Tests: full vitest.
Impact: reduce lint count.
Rollback: revert changes.
Depends: none.
