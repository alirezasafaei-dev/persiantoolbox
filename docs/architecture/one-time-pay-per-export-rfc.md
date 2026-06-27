# RFC: One-Time Pay-Per-Export

**Date:** 2026-06-27
**Status:** PROPOSED
**Author:** PersianToolbox Engineering

## Problem

Current monetization requires monthly subscription (۹۹٬۰۰۰ تومان/ماه). Many users only need one clean export occasionally. This creates a barrier to revenue.

## Proposed Solution

Add a one-time purchase option for single clean export:

- **Price:** ۵,۰۰۰ تومان per export
- **No subscription required**
- **No account required** (session-based)
- **Immediate value**

## Current Architecture

```
User → Upgrade Modal → ZarinPal Checkout → Subscription Created → Premium Unlocked
```

**Issues:**

- Requires account creation
- Monthly commitment
- Overkill for occasional users

## Proposed Architecture

### Flow

```
1. User fills document (free)
2. User clicks "Export Clean" button
3. Modal shows: "خروجی بدون واترمارک — ۵,۰۰۰ تومان"
4. User clicks "پرداخت تکی"
5. Checkout API creates one-time payment
6. ZarinPal redirects to payment page
7. After payment: callback creates one-time purchase record
8. Client receives download token (expires in 5 minutes)
9. User exports clean document
10. Token expires, cannot be reused
```

## DB Schema Changes

### New Table: `one_time_purchases`

```sql
CREATE TABLE one_time_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product TEXT NOT NULL,          -- 'business-clean-export', 'career-clean-export'
  amount INTEGER NOT NULL,        -- 5000 (toman)
  currency TEXT NOT NULL DEFAULT 'IRR',
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
  payment_id TEXT,                -- reference to payments table
  download_token TEXT,            -- JWT token for download
  token_expires_at INTEGER,       -- timestamp
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE INDEX idx_otp_user ON one_time_purchases(user_id);
CREATE INDEX idx_otp_status ON one_time_purchases(status);
CREATE INDEX idx_otp_token ON one_time_purchases(download_token);
```

### New Table: `export_usage`

```sql
CREATE TABLE export_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product TEXT NOT NULL,
  export_type TEXT NOT NULL,      -- 'pdf', 'docx', 'html'
  purchase_id TEXT,               -- nullable (free exports)
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_eu_user ON export_usage(user_id);
```

## API Endpoints

### POST /api/payments/one-time-checkout

**Request:**

```json
{
  "product": "business-clean-export" | "career-clean-export",
  "amount": 5000
}
```

**Response:**

```json
{
  "ok": true,
  "purchaseId": "otp_xxx",
  "checkoutUrl": "https://zarinpal.com/...",
  "amount": 5000,
  "currency": "IRR"
}
```

### GET /api/payments/one-time-callback

**Query params:** `Authority`, `Status`, `purchaseId`

**Logic:**

1. Verify payment with ZarinPal
2. Update purchase status to 'completed'
3. Generate download token (JWT, expires 5 min)
4. Redirect to success page with token

### POST /api/export/one-time-token

**Request:**

```json
{
  "purchaseId": "otp_xxx"
}
```

**Response:**

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-06-27T13:05:00Z"
}
```

## Privacy Model

| Data             | Sent to Server | Stored   |
| ---------------- | -------------- | -------- |
| Document content | ❌ Never       | ❌ Never |
| Invoice items    | ❌ Never       | ❌ Never |
| Resume text      | ❌ Never       | ❌ Never |
| Writing text     | ❌ Never       | ❌ Never |
| Product type     | ✅ Yes         | ✅ Yes   |
| Payment amount   | ✅ Yes         | ✅ Yes   |
| User ID          | ✅ Yes         | ✅ Yes   |

## Security Model

1. **No account required:** Purchase linked to session/user ID
2. **Token expiration:** 5 minutes (enough for export, short enough for security)
3. **Single-use token:** Cannot be reused after export
4. **Payment verification:** Server-side ZarinPal verification
5. **Rate limiting:** Standard API rate limits

## Migration Risk

**MEDIUM** — New tables required:

- Add `one_time_purchases` table
- Add `export_usage` table
- No existing tables modified
- No existing data affected

## Rollback Plan

1. Remove new API endpoints
2. Drop new tables
3. Revert client-side changes
4. Previous behavior restored (subscription only)

## Phased Implementation

### Phase 1: Database Schema (1 day)

- Create new tables
- Add migration script
- Add indexes

### Phase 2: Payment Integration (2 days)

- Create one-time checkout endpoint
- Create callback handler
- Create token generation endpoint
- Add ZarinPal integration

### Phase 3: Client Integration (2 days)

- Update upgrade modal to show one-time option
- Add purchase flow
- Add download flow
- Add token handling

### Phase 4: Testing (1 day)

- Test payment flow
- Test token expiration
- Test privacy (no content leakage)
- Test error handling

## Human Decisions Needed

1. **Price point:** ۵,۰۰۰ تومان recommended (low barrier, acceptable margin)
2. **Token expiration:** 5 minutes recommended
3. **Account requirement:** No account needed (session-based) vs account required?
4. **Product scope:** All 3 products or just business/career?
5. **Refund policy:** How to handle failed exports?

## Estimated Effort

- **Development:** 6 days
- **Testing:** 2 days
- **Total:** 8 days

## Success Criteria

1. User can purchase single clean export without subscription
2. Payment flows correctly through ZarinPal
3. Export token works and expires
4. No document content sent to server
5. All existing tests pass
6. Revenue tracking works
