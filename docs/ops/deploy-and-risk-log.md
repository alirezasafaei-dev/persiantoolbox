# Deploy and Risk Log — PersianToolbox

## 2026-07-02 — Commit 98512d4b

**Deployed:** YES
**Risk:** LOW (homepage/content/navigation additions only)
**Production:** https://persiantoolbox.ir

### Changes

- Homepage growth pass for free-tool positioning.
- Standardized homepage/live SEO copy around the verified «۸۶ ابزار رایگان» count.
- Added role-based homepage paths for finance/admin users, small businesses, PDF/file users, and writers/students.
- Added direct tool links inside each role path to reduce time-to-tool.
- Updated homepage copy and e2e/unit coverage for the new section.

### Verification

- Local QA before deploy:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm vitest --run` — 147 files, 1,234 tests passed
  - `pnpm build` — 825 pages generated
- Deploy:
  - `bash deploy-vps-auto.sh`
  - VPS build completed; PM2 `persiantoolbox` restarted with `pm2 restart`
  - deploy script warmup and verification passed
- Live production checks:
  - `/api/health` returned `{"status":"ok"}` with database and redis OK
  - 10 key pages returned HTTP 200
  - live CSS chunk returned HTTP 200
  - `Vazirmatn-Bold.woff2` returned HTTP 200
  - homepage HTML contains:
    - «۸۶ ابزار رایگان»
    - «مسیر پیشنهادی برای هر نوع کاربر»
    - «کسب‌وکار کوچک، فروشگاه و فریلنسر»

### Warnings / Follow-up

- Existing lint warnings remain non-blocking but should be reduced in admin/API code:
  `no-nested-ternary`, `no-console`, `@typescript-eslint/no-non-null-assertion`.
- Existing build warnings remain non-blocking:
  custom `Cache-Control` for `/_next/static/:path*`, stale Browserslist data, and Turbopack NFT trace warning from admin ops logs route.
- Staging remains down and should be restored separately with `deploy-staging.sh`.
- PM2 restart count is elevated and needs log-based root-cause review.

### Rollback

- Revert commit `98512d4b` and redeploy.
- No database or storage migration was introduced by this homepage change.

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
