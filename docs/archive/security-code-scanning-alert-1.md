# Security Remediation: Code Scanning Alert #1

- Alert URL: `https://github.com/parsairaniiidev/persiantoolbox/security/code-scanning/1`
- Date: `2026-02-27`
- Rule: `js/clear-text-storage-of-sensitive-data` (CodeQL)
- Severity: `high`
- Status at review time: `open` (awaiting next scan on pushed fix)

## Root Cause

Financial form data in loan/salary flows could be persisted in browser `sessionStorage` through shared helpers, which is flagged as clear-text storage for potentially sensitive data.

## Remediation Implemented

- Removed session persistence for:
  - `components/features/loan/LoanPage.tsx`
  - `components/features/salary/SalaryPage.tsx` (form state only)
- Kept non-sensitive salary laws feed cache behavior unchanged.
- Result: loan/salary user-entered compensation/financial draft data is no longer stored in browser storage.

## Validation

- `pnpm -s typecheck` passed.
- `pnpm exec eslint components/features/loan/LoanPage.tsx components/features/salary/SalaryPage.tsx` passed.

## Follow-up

- Re-run GitHub CodeQL scan after push and verify alert #1 closes automatically.
- If alert stays open, inspect dataflow path in SARIF and apply additional tightening at helper layer.
