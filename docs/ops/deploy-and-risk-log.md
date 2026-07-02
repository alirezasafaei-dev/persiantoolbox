# Deploy and Risk Log — PersianToolbox

## 2026-07-02 — Local build warning cleanup

**Deployed:** NO
**Risk:** LOW (build configuration and lockfile maintenance only)

### Changes

- Removed the redundant custom `Cache-Control` header for `/_next/static/:path*`; Next.js owns immutable static chunk caching.
- Updated Browserslist data through `pnpm dlx update-browserslist-db@latest`.
- Added a narrow `outputFileTracingExcludes` entry for `/api/admin/ops/logs` so Turbopack no longer traces `next.config.mjs` into that route's NFT list.

### Verification

- `pnpm build` — PASS, 833 pages generated.
- Confirmed the stale Browserslist warning, custom Cache-Control warning, and Turbopack NFT trace warning are gone.
- Existing unrelated Next notice remains: using edge runtime on a page disables static generation for that page.

### Follow-up

- Include this cleanup in the next approved deployment.

## 2026-07-02 — Commit 6608314e

**Deployed:** YES
**Risk:** MEDIUM-LOW (SEO/UX/a11y QA fixes plus CSP compatibility change)
**Production:** https://persiantoolbox.ir
**Deploy command:** `bash deploy-vps-auto.sh`

### Changes

- Final SEO/UX/accessibility QA fixes for homepage and important tool pages.
- Image resize page received a meaningful H1 and intro copy.
- Mobile nav closed state now uses `inert`.
- Enamad seal links received accessible labels.
- Dark-mode contrast and heading order issues fixed.
- Blog/toast/loading mobile overflow risks fixed.
- Tool-count consistency locked to registry `97`, active `87`, display/indexable `86`, label `۸۶`.
- CSP adjusted for verified Next.js hydration; still uses `unsafe-inline`.

### Verification

- Pre-deploy local QA:
  - `pnpm typecheck` — PASS
  - `pnpm lint` — PASS with 302 warnings, 0 errors
  - `pnpm build` — PASS, 833 pages generated
  - `pnpm vitest --run` — PASS, 1235 tests
- Deploy:
  - `bash deploy-vps-auto.sh` — PASS
  - PM2 `persiantoolbox` restarted successfully
  - New process ready on attempt 8
  - Deploy script warmup and verification passed
- Live production checks:
  - `/api/health` returned OK with database and Redis OK
  - `/` and `/loan` returned HTTP 200
  - `www` root, `/loan`, and `/loan?x=1` redirected to non-www with path/query preserved
  - `/sitemap.xml` and `/robots.txt` returned HTTP 200
  - Homepage canonical: `https://persiantoolbox.ir`
  - `/loan` canonical: `https://persiantoolbox.ir/loan`
  - Homepage and `/loan` `[object Object]` count: `0`
  - `/api/version` returned version `7.7.0` and `commit:null`

### Warnings / Follow-up

- Production commit hash is UNVERIFIED from the app because `/api/version` returns `commit:null`.
- CSP enforced policy still uses `unsafe-inline` for static Next.js compatibility. Local code adds a nonce-backed report-only target; use its violations to migrate inline hydration/JSON-LD/style usage before enforcing nonce/hash CSP.
- Production Lighthouse after deploy is UNVERIFIED.
- Previous local Lighthouse `/loan` Performance score was `78`.
- Existing lint warnings remain non-blocking: `no-non-null-assertion`, `no-nested-ternary`, `react-hooks/exhaustive-deps`, `no-img-element`, `no-console`.
- Existing build warnings remain non-blocking: stale Browserslist data, custom Cache-Control notice, Turbopack NFT trace warning.

### Rollback

- Revert commit `6608314e` and redeploy with `bash deploy-vps-auto.sh`.
- No database or storage migration was introduced.

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
