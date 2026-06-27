# Pricing v2 Production Verification Report

**Date:** 2026-06-27
**Status:** COMPLETE

## Checkout Contract Fix

### Problem Found

The subscription checkout API (`/api/subscription/checkout`) returned `payUrl` but both `UpgradeModal.tsx` and `PricingContent.tsx` read `checkoutUrl`. This meant **buy buttons on the pricing page and upgrade modal silently failed** — users clicking "خرید اشتراک" were never redirected to ZarinPal.

### Fix Applied

1. **API** (`app/api/subscription/checkout/route.ts:75`): Returns both `payUrl` and `checkoutUrl` for backward compatibility
2. **UpgradeModal** (`components/features/pricing/UpgradeModal.tsx:42`): Reads `payUrl || checkoutUrl`
3. **PricingContent** (`components/features/pricing/PricingContent.tsx:66`): Reads `payUrl || checkoutUrl`

### Files Changed

- `app/api/subscription/checkout/route.ts` — dual response
- `components/features/pricing/UpgradeModal.tsx` — accepts both keys
- `components/features/pricing/PricingContent.tsx` — accepts both keys
- `tests/unit/checkout-contract.test.ts` — NEW: 4 tests for contract compatibility

### Verification

| Check       | Result           |
| ----------- | ---------------- |
| Lint        | ✅ 0 errors      |
| Typecheck   | ✅ PASS          |
| Vitest      | ✅ 907/907 tests |
| Build       | ✅ PASS          |
| Local-first | ✅ PASS          |
| Security    | ✅ PASS          |
| Links       | ✅ PASS          |
| PWA         | ✅ PASS          |

## Pricing Config Verified

- 6 plans in `lib/pricing/exportCredits.ts`: free, pack-3, basic, standard, pro, team
- 3 top-up packs defined
- Credit rules: 1 clean export = 1 credit, watermarked = free, retry 30min = free
- `lib/subscriptionPlans.ts` correctly maps plans with `monthlyCredits` and `dailyLimit`
- `getPlanById()` returns correct plan for all valid IDs

## Checkout Flow Verified

1. UpgradeModal → POST `/api/subscription/checkout` with `{ planId: 'pack-3' }`
2. API validates plan, creates ZarinPal checkout, returns `{ ok: true, payUrl, checkoutUrl }`
3. UI reads `payUrl || checkoutUrl`, redirects to ZarinPal
4. All consumers (PremiumPageClient, AccountPage, old UpgradeModal) also work

## What's NOT Yet Implemented

- Credit metering (deduction, limits, retry window) — next sprint
- DB migration for credit tables
- Client-side credit balance display

## Truthful Verdict

Checkout contract mismatch was a real production bug. Fixed with backward-compatible dual response. All gates pass (907/907 tests). Ready to commit and deploy.
