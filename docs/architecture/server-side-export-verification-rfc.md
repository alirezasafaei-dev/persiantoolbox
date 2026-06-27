# RFC: Server-Side Export Verification

**Date:** 2026-06-27
**Status:** PROPOSED
**Author:** PersianToolbox Engineering

## Problem

Current premium export gating is client-side only. A determined user can bypass the UI gate by:

1. Modifying `isPremium` state in browser console
2. Directly calling `downloadPdf()` or `downloadDocx()` functions
3. Removing watermark from rendered HTML before export

This means premium features can be used without payment.

## Current Architecture

```
User fills document (free)
  → Client checks isPremium (from /api/subscription/status)
  → If premium: show PDF/DOCX buttons, no watermark
  → If free: hide PDF/DOCX, show watermark
  → Export happens entirely in browser (no server call)
```

**Gap:** Server verifies subscription status, but export itself is never verified.

## Proposed Architecture: Hybrid Verification

### Approach

Keep export client-side (privacy-first), but add a lightweight server-side token that proves the user has an active subscription.

### Flow

```
1. User clicks "Export PDF"
2. Client requests export token from /api/export/token
   - Server verifies: user authenticated, active subscription
   - Server returns: signed JWT token (expires in 60s)
3. Client renders document with token embedded (invisible)
4. Client calls window.print() or generates blob
5. Token is NOT sent to any external service
```

### Why This Works

- **Privacy preserved:** Document content never leaves browser
- **Server verification:** Token proves subscription is active
- **Token expiration:** Short-lived tokens prevent reuse
- **No server-side rendering:** Export remains client-side

## DB Schema Changes

**None required.** The existing `payments` and `subscriptions` tables already track subscription status.

## API Endpoints

### POST /api/export/token

**Request:**

```json
{
  "product": "business" | "career" | "writing"
}
```

**Response (success):**

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-06-27T13:00:00Z"
}
```

**Response (not premium):**

```json
{
  "ok": false,
  "error": "اشتراک فعال نیست.",
  "upgradeUrl": "/pricing"
}
```

**Security:**

- Requires authentication
- Requires CSRF check
- Token signed with HMAC-SHA256
- Token expires in 60 seconds
- Token contains: userId, product, expiresAt

## Privacy Model

| Data             | Sent to Server | Stored            |
| ---------------- | -------------- | ----------------- |
| Document content | ❌ Never       | ❌ Never          |
| Invoice items    | ❌ Never       | ❌ Never          |
| Resume text      | ❌ Never       | ❌ Never          |
| Writing text     | ❌ Never       | ❌ Never          |
| Product type     | ✅ Yes         | ❌ No             |
| Export timestamp | ✅ Yes         | ❌ No             |
| User ID          | ✅ Yes         | ✅ Yes (existing) |

## Security Model

1. **Token signing:** HMAC-SHA256 with server-side secret
2. **Token expiration:** 60 seconds
3. **Token scope:** Limited to specific product type
4. **No token storage:** Token is ephemeral, not stored in DB
5. **Rate limiting:** Standard API rate limits apply

## Migration Risk

**LOW** — This is an additive change:

- New API endpoint only
- No existing tables modified
- No existing code changed
- Client-side fallback if token fails

## Rollback Plan

1. Remove `/api/export/token` endpoint
2. Revert client-side changes
3. Previous behavior restored (client-only gating)

## Phased Implementation

### Phase 1: Token Endpoint (1 day)

- Create `/api/export/token` endpoint
- Add token signing logic
- Add unit tests

### Phase 2: Client Integration (1 day)

- Update export functions to request token
- Add token to document metadata (invisible)
- Add fallback for token failure

### Phase 3: Verification (1 day)

- Test with active subscription
- Test without subscription
- Test token expiration
- Test privacy (no content leakage)

## Human Decisions Needed

1. **Token expiration time:** 60s recommended (short enough for security, long enough for export)
2. **Token scope:** Per-product or global? (Recommended: per-product)
3. **Fallback behavior:** If token request fails, should export be blocked or allowed with watermark? (Recommended: allow with watermark)
4. **Rate limiting:** How many token requests per minute? (Recommended: 10)

## Estimated Effort

- **Development:** 3 days
- **Testing:** 1 day
- **Total:** 4 days

## Success Criteria

1. Premium users can export without issues
2. Free users cannot export without watermark
3. No document content sent to server
4. Token expires and cannot be reused
5. All existing tests pass
