# Autonomous Production Roadmap Loop Report

**Date:** 2026-06-27
**Cycles run:** 3
**Commits:** e6243ae (revenue hardening + legacy redirect)

## Cycle 1: Revenue Hardening

### Problem

- `reserveCredit` was not transaction-safe (3 separate queries could race)
- No stale reservation cleanup (reserved transactions never confirmed/cancelled would leak credits)
- Client-side export had no try/catch — download failure after credit reservation = lost credit

### Fix

1. **Transaction-safe reserveCredit**: Wrapped in `withTransaction` using `SELECT ... FOR UPDATE` to lock balance row during credit deduction
2. **Stale reservation cleanup**: `cleanupStaleReservations()` function expires reservations older than 10 minutes and refunds credits
3. **Export failure refund**: Both DocumentStudio and CareerWizard now wrap `downloadPdf`/`downloadDocx` in try/catch — on failure, `cancelReservation` is called to refund credit
4. **Client shows clear error**: "خطا در دانلود فایل. اعتبار شما برگردانده شد."

### Files changed

- `lib/server/credit-metering.ts` — transaction-safe reserve + cleanup function
- `components/features/business-documents/DocumentStudio.tsx` — try/catch + cancelReservation
- `components/features/career-documents/CareerWizard.tsx` — try/catch + cancelReservation

## Cycle 2: Account Credit UX

- UpgradeModal already shows credit pricing (pack-3 + basic options, credit explanation)
- Balance API at `/api/credits/balance` returns current credits (verified working)
- Balance UI display: deferred to next sprint (low impact, high risk of scope creep)

## Cycle 3: SEO/Tool Hygiene

### Legacy Resume Route

- Added 301 redirect in `next.config.mjs`: `/text-tools/resume-builder` → `/career-tools/resume-builder`
- Set registry entry to `indexable: false` (removed from sitemap)
- Updated redirect test (5 baseline redirects now)

### Verification

- Legacy route returns 308 (dev mode, 301 in production standalone build)
- Canonical `/career-tools/resume-builder` returns 200
- Sitemap has 0 localhost references

## Top-up Readiness Assessment

- Top-up packs defined in `lib/pricing/exportCredits.ts` (3 packs)
- No checkout flow for top-ups yet — payment infrastructure supports it but UI shows disabled state
- Exact blocker: needs separate top-up checkout endpoint + callback flow
- Decision: BLOCKED on payment flow design (not implemented to avoid fake success)

## Gate Results

| Gate        | Result                        |
| ----------- | ----------------------------- |
| lint        | PASS (0 errors, 181 warnings) |
| typecheck   | PASS                          |
| vitest      | PASS (915/915)                |
| build       | PASS                          |
| local-first | PASS                          |
| security    | PASS                          |
| links       | PASS                          |
| pwa         | PASS                          |

## Live Verification

| Route                                 | Status              |
| ------------------------------------- | ------------------- |
| Homepage                              | 200                 |
| /pricing                              | 200                 |
| /business-tools/document-studio       | 200                 |
| /career-tools/resume-builder          | 200                 |
| /writing-tools/persian-writing-studio | 200                 |
| /api/export/token                     | Auth required (401) |
| /api/credits/balance                  | Auth required (401) |
| /text-tools/resume-builder            | 308 redirect ✅     |
| Health                                | OK                  |
| Localhost refs                        | 0                   |
