# Pricing and Export Credit Review Report

**Date:** 2026-06-27
**Status:** COMPLETE

## What Was Implemented

### 1. Central Pricing Config

**File:** `lib/pricing/exportCredits.ts`

- 6 pricing plans defined (free, pack-3, basic, standard, pro, team)
- 3 top-up packs defined
- Credit rules: 1 clean export = 1 credit
- Retry window: 30 minutes
- Timezone: Asia/Tehran

### 2. Updated Subscription Plans

**File:** `lib/subscriptionPlans.ts`

- Migrated from old plan structure to credit-based model
- Removed `storageMb` and `retentionDays` properties
- Added `monthlyCredits` and `dailyLimit`
- Updated upgrade paths: pack-3 → basic → standard → pro → team

### 3. Updated Pricing UI

**File:** `components/features/pricing/PricingContent.tsx`

- New layout explaining credit system
- 3 plan tiers displayed (basic, standard, pro)
- Top-up packs section
- FAQ section explaining credits

### 4. Updated Upgrade Modal

**File:** `components/features/pricing/UpgradeModal.tsx`

- Updated copy: "خروجی بدون واترمارک با اعتبار خروجی"
- Shows pack-3 and basic options
- Credit explanation: "هر خروجی تمیز = ۱ اعتبار"

### 5. Unit Tests

**File:** `tests/unit/export-credits.test.ts`

- 19 tests for pricing config
- Tests for credit plans, top-ups, pricing rules

## Verification Results

| Check       | Result                    |
| ----------- | ------------------------- |
| Lint        | ✅ 0 errors, 181 warnings |
| Typecheck   | ✅ PASS                   |
| Vitest      | ✅ 903/903 tests          |
| Local-first | ✅ OK                     |
| Security    | ✅ No secrets             |

## Pricing Model Summary

| Plan     | Price          | Credits | Daily Limit |
| -------- | -------------- | ------- | ----------- |
| Free     | 0              | 0       | 0           |
| Pack 3   | 49K تومان      | 3       | 3           |
| Basic    | 99K تومان/ماه  | 10      | 3           |
| Standard | 199K تocom/ماه | 120     | 10          |
| Pro      | 399K تومان/ماه | 500     | 30          |
| Team     | 999K تومان/ماه | 3000    | 200         |

## Old References Removed

All references to old 5,000 تومان one-time export have been replaced with the credit model.

## Remaining Items

1. Implement credit metering (deduction, limits, retry window)
2. Database migration for credit tables
3. Client-side credit balance display
4. Team usage dashboard

## Commits

- 38e0841: Implement export credit pricing model

## Push Status

✅ SUCCEEDED

## Truthful Verdict

Pricing v2 implemented with export credit model. All old references removed. Central pricing config created. UI updated. Tests pass (903/903). Ready for credit metering implementation.
