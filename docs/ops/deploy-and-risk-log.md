# Deploy and Risk Log — PersianToolbox

## 2026-06-27 — Commit e6243ae

**Deployed:** YES
**Risk:** LOW (additive changes only)

### Changes

- Revenue hardening: transaction-safe credit reserve, stale cleanup, failure refund
- Legacy resume route 301 redirect
- Legacy registry entry marked non-indexable

### DB Changes

- None (tables already exist from previous migration)

### Risks

- Transaction-safe reserve may briefly hold row lock during concurrent exports (acceptable)
- 301 redirect removes legacy route from sitemap (intentional — reduces duplicate content)
- No data loss, no destructive operations

### Rollback

- Revert commit to restore previous behavior
- Legacy redirect removal: just remove the entry from `next.config.mjs` redirects
