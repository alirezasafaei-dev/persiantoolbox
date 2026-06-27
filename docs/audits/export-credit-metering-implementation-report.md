# Export Credit Metering — Implementation Report

**Date:** 2026-06-27
**Status:** COMPLETE + DEPLOYED
**Commit:** 70aefa5

## What Was Implemented

### 1. Database Tables

Two new tables (additive migration, no existing tables modified):

- **`export_credits`** — Per-user credit balance with daily/monthly tracking
  - user_id (unique), plan_id, monthly_used, monthly_limit, daily_used, daily_limit
  - Lazy reset: daily resets at Asia/Tehran midnight, monthly resets at month start
  - Auto-created on first check per user

- **`export_transactions`** — Credit ledger / audit trail
  - user_id, product (business/career/writing), credit_cost, status (reserved/confirmed/cancelled)
  - No document content ever stored (privacy preserved)

### 2. Credit Service (`lib/server/credit-metering.ts`)

Core functions:

- `getOrCreateBalance(userId, planId)` — Get/create credit balance with lazy reset
- `checkCredits(userId, product)` — Full credit check (subscription, daily, monthly limits)
- `checkRetryWindow(userId, product)` — Same product re-download within 30 min = free
- `reserveCredit(userId, product)` — Reserve 1 credit before export
- `confirmExport(reservationId)` — Mark reservation as confirmed after successful export
- `cancelReservation(reservationId)` — Refund credit if export fails
- `getCreditBalance(userId)` — Public API for balance display

### 3. API Endpoints

- **POST `/api/export/token`** — Updated with credit metering:
  - Checks subscription, daily limit, monthly limit
  - Checks 30-min retry window (returns existing token if within window)
  - Reserves credit before issuing token
  - Returns: `{ ok, token, expiresAt, creditsRemaining, reservationId }`
  - Denies with: `{ ok: false, error, creditsRemaining, upgradeUrl }`

- **PATCH `/api/export/token`** — New: confirm/cancel export
  - `{ reservationId, action: 'confirm' }` — Mark successful export
  - `{ reservationId, action: 'cancel' }` — Refund credit on failure

- **GET `/api/credits/balance`** — New: returns current credit balance for authenticated user

### 4. Client Integration

- **`useExportToken`** hook updated:
  - `requestToken()` now returns `{ token, reservationId }` (was just string)
  - Added `confirmExport(reservationId)` and `cancelReservation(reservationId)`
  - State includes `creditsRemaining`, `retry` flag

- **DocumentStudio** + **CareerWizard**: Updated to confirm credit after successful export

### 5. Credit Rules (from exportCredits.ts config)

| Rule                    | Value                         |
| ----------------------- | ----------------------------- |
| 1 clean export          | 1 credit                      |
| Watermarked/free export | 0 credits (bypasses metering) |
| Preview                 | 0 credits                     |
| Retry within 30 min     | Free (same product)           |
| Daily reset             | Midnight Asia/Tehran (lazy)   |
| Monthly reset           | Month start (lazy)            |

### 6. EXPORT_TOKEN_SECRET

- Generated 96-char random secret on VPS
- Set in VPS `.env` as `EXPORT_TOKEN_SECRET`
- Production no longer falls back to `NEXTAUTH_SECRET`

## Privacy Model

| Data             | Sent to Server | Stored   |
| ---------------- | -------------- | -------- |
| Document content | ❌ Never       | ❌ Never |
| Invoice items    | ❌ Never       | ❌ Never |
| Resume text      | ❌ Never       | ❌ Never |
| Writing text     | ❌ Never       | ❌ Never |
| Product type     | ✅ Yes         | ✅ Yes   |
| User ID          | ✅ Yes         | ✅ Yes   |
| Credit cost      | ✅ Yes         | ✅ Yes   |
| Timestamp        | ✅ Yes         | ✅ Yes   |

## Tests

8 new tests in `tests/unit/credit-metering.test.ts`:

- Denies when no active subscription
- Allows when credits available
- Denies when daily limit exceeded
- Denies when monthly limit exceeded
- Allows retry within 30 min window
- Returns zero for free user
- Returns plan limits for subscriber
- Export transactions never store document content

## Live Verification

| Check                                 | Result                 |
| ------------------------------------- | ---------------------- |
| Homepage                              | 200                    |
| /pricing                              | 200                    |
| /business-tools/document-studio       | 200                    |
| /career-tools/resume-builder          | 200                    |
| /writing-tools/persian-writing-studio | 200                    |
| Export token API                      | Auth required (401) ✅ |
| Credit balance API                    | Auth required (401) ✅ |
| Localhost in HTML                     | 0                      |
| Localhost in sitemap                  | 0                      |
| PM2 health                            | OK                     |
| CSS served                            | 200                    |
