# RFC: Export Credit Metering

**Date:** 2026-06-27
**Status:** PROPOSED
**Author:** PersianToolbox Engineering

## Problem

Current export credit model is defined in config but not enforced. Users can export unlimited clean documents without credit deduction.

## Proposed Architecture

### Credit Ledger

New table: `export_credits`

```sql
CREATE TABLE export_credits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  credits_remaining INTEGER NOT NULL,
  credits_used_monthly INTEGER NOT NULL DEFAULT 0,
  credits_used_daily INTEGER NOT NULL DEFAULT 0,
  daily_reset_at INTEGER NOT NULL,
  monthly_reset_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_ec_user ON export_credits(user_id);
```

### Credit Transactions

New table: `export_transactions`

```sql
CREATE TABLE export_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product TEXT NOT NULL,
  credit_cost INTEGER NOT NULL DEFAULT 1,
  export_type TEXT NOT NULL,
  token_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_et_user ON export_transactions(user_id);
CREATE INDEX idx_et_created ON export_transactions(created_at);
```

### API Endpoint

#### POST /api/export/verify

**Request:**

```json
{
  "product": "business",
  "exportType": "pdf"
}
```

**Response (success):**

```json
{
  "ok": true,
  "creditsRemaining": 9,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-06-27T13:00:00Z"
}
```

**Response (no credits):**

```json
{
  "ok": false,
  "error": "اعتبار خروجی کافی نیست.",
  "creditsRemaining": 0,
  "upgradeUrl": "/pricing",
  "topUpUrl": "/pricing#topups"
}
```

### Credit Deduction Flow

1. User clicks "Export Clean"
2. Client requests `/api/export/verify`
3. Server checks:
   - User authenticated
   - Active subscription or pack
   - Credits remaining > 0
   - Daily limit not exceeded
4. Server deducts 1 credit
5. Server returns signed token
6. Client exports with token
7. If export fails, credit is refunded (within 5 minutes)

### Retry Window

- Same product + export type within 30 minutes = no extra credit
- Server checks recent transactions for same product/export type
- If found, returns existing token instead of creating new one

### Daily/Monthly Reset

- Daily reset: midnight Asia/Tehran
- Monthly reset: subscription renewal date
- Reset happens lazily on next request (not cron job)

### Team Limits

- Team plan shares credits across users
- Daily limit is team-wide (200/day for team plan)
- Admin can view team usage (future feature)

## Privacy Model

| Data             | Sent to Server | Stored   |
| ---------------- | -------------- | -------- |
| Document content | ❌ Never       | ❌ Never |
| Product type     | ✅ Yes         | ✅ Yes   |
| Export type      | ✅ Yes         | ✅ Yes   |
| Credit cost      | ✅ Yes         | ✅ Yes   |
| User ID          | ✅ Yes         | ✅ Yes   |
| Timestamp        | ✅ Yes         | ✅ Yes   |

## Migration Risk

**MEDIUM** — New tables required:

- Add `export_credits` table
- Add `export_transactions` table
- No existing tables modified
- No existing data affected

## Rollback Plan

1. Remove new API endpoints
2. Drop new tables
3. Revert client-side changes
4. Previous behavior restored (subscription-only gating)

## Phased Implementation

### Phase 1: Database Schema (1 day)

- Create new tables
- Add migration script
- Add indexes

### Phase 2: Credit Service (2 days)

- Implement credit checking
- Implement credit deduction
- Implement retry window
- Implement daily/monthly reset

### Phase 3: API Integration (1 day)

- Update `/api/export/verify` endpoint
- Add credit verification
- Add token generation

### Phase 4: Client Integration (1 day)

- Update export flow to check credits
- Show credit balance
- Handle "no credits" state

### Phase 5: Testing (1 day)

- Unit tests for credit logic
- Integration tests for API
- E2E tests for export flow

## Human Decisions Needed

1. **Credit refund window:** 5 minutes recommended
2. **Team credit sharing:** Shared pool vs per-user allocation?
3. **Grace period:** What happens when credits run out mid-export?
4. **Usage dashboard:** When to implement team usage view?

## Estimated Effort

- **Development:** 6 days
- **Testing:** 2 days
- **Total:** 8 days

## Success Criteria

1. Credits are deducted on clean export
2. Free users cannot export without watermark
3. Daily/monthly limits enforced
4. Retry window works correctly
5. All existing tests pass
6. No document content sent to server
