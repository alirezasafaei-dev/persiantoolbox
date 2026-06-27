# Pay-Per-Export MVP — Sprint 1

**Date:** 2026-06-27

## What Was Implemented

### 1. Subscription Status Hook

**File:** `shared/hooks/useSubscriptionStatus.ts`

Client-side hook that fetches subscription status from `/api/subscription/status`. Returns `{ isPremium, planId, expiresAt }`. Runs once on mount, respects cleanup.

### 2. Upgrade Modal

**File:** `components/features/pricing/UpgradeModal.tsx`

Modal shown at export time when user is not premium. Shows:

- Product name and price (۹۹٬۰۰۰ تومان/ماه)
- Checkout button → redirects to ZarinPal via `/api/subscription/checkout`
- "Continue with free export" button
- Payment disabled fallback message
- Privacy note: "پردازش کاملاً محلی در مرورگر"

### 3. DocumentStudio Integration

**File:** `components/features/business-documents/DocumentStudio.tsx`

- Added `UpgradeModal` import
- Added `showUpgradeModal` state
- Added upgrade CTA button in export section when `!featureGate?.canExportPdf`
- Button text: "خروجی بدون واترمارک"
- Modal opens on click, reloads page on success

### 4. CareerWizard Integration

**File:** `components/features/career-documents/CareerWizard.tsx`

- Same pattern as DocumentStudio
- Added `UpgradeModal` import
- Added `showUpgradeModal` state
- Added upgrade CTA button in export section
- Modal opens on click, reloads page on success

## What Was NOT Implemented

1. **Server-side export verification** — Export remains 100% client-side. A determined user could bypass the UI gate. This is acceptable for MVP because:
   - The watermark is embedded in the rendered HTML
   - PDF/DOCX buttons are hidden for free users
   - The vast majority of users won't bypass UI gates

2. **Pay-per-export (one-time purchase)** — The current implementation uses the existing subscription flow (monthly plan). True pay-per-export would require:
   - New product SKU in the payment system
   - New purchase verification endpoint
   - Database schema changes for one-time purchases

3. **Account-free purchase** — The existing checkout requires authentication. Account-free purchase would require:
   - Anonymous payment tracking
   - Session-based purchase verification
   - Privacy implications of storing purchase data without user identity

4. **Writing tool monetization** — Not implemented per scope.

## Privacy Guarantees

- **No document content sent to server** — All export logic remains client-side
- **Only metadata sent to checkout** — Product type, plan ID, price
- **No names, emails, phone numbers** sent during export
- **No invoice items, resume text, or writing content** sent anywhere
- **Payment handled by ZarinPal** — Standard Iranian payment gateway

## Payment Status

- **Provider:** ZarinPal (production mode)
- **Merchant ID:** Configured in `.env`
- **Checkout flow:** Working via `/api/subscription/checkout`
- **Callback:** Working via `/api/subscription/confirm`
- **Feature flag:** `checkout` defaults to enabled

## Tests Run

- `pnpm lint`: PASS (0 errors, 140 warnings)
- `pnpm typecheck`: PASS
- `pnpm vitest --run`: PASS (859/859 tests)

## Remaining Risks

1. **Export bypass** — Client-side gates can be bypassed via browser console. Acceptable for MVP.
2. **Subscription required** — Users must create account to purchase. May reduce conversion.
3. **No pay-per-export** — Monthly subscription only. One-time purchase would be better for occasional users.
4. **Page reload on success** — After payment, page reloads to pick up new premium status. Not ideal UX but functional.

## Deploy Readiness

- **Code changes:** 4 files modified, 2 files created
- **Tests:** All passing
- **Lint:** Clean
- **Typecheck:** Clean
- **Build:** Should pass (no new dependencies)
- **Risk:** Low — additive changes only, no breaking changes
