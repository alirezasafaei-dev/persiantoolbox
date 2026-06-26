# Post-Deploy Homepage, Navigation, SEO & Performance Cleanup Report

**Date:** 2026-06-26
**Scope:** Navbar simplification, homepage redesign, naming cleanup, sitemap/robots fix, Playwright filter fix

## Changes Made

### 1. User-facing "استودیو" wording removed

- `app/business-tools/document-studio/page.tsx`: metadata title, breadcrumb, loading text
- `app/career-tools/resume-builder/page.tsx`: loading text
- `components/features/career-documents/CareerWizard.tsx`: fallback title
- `components/features/business-documents/DocumentStudio.tsx`: fallback title
- `lib/tools-registry.ts`: tool titles and descriptions

All visible "استودیو" → replaced with clear Persian names (فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای, ویرایشگر فارسی).

### 2. Navbar simplified

- `lib/navigation.ts`: Added `flagshipDropdown`, `utilityDropdown`, `NavDropdownGroup` types
- `components/ui/Navigation.tsx`: Replaced flat 10-item category list with 2 grouped dropdown menus:
  - "ابزارها" — grouped utility categories (فایل و محتوا, محاسباتی, قراردادها)
  - "محصولات حرفه‌ای" — 3 flagship products
- Desktop: hover/focus dropdowns with grouped links
- Mobile: collapsible sections in drawer
- Keyboard accessible: Escape closes, aria-expanded, focus trap

### 3. Homepage redesigned

- `components/HomePage.tsx`: Reduced from 558→315 lines
- Hero leads with "ابزارهای فارسی حرفه‌ای؛ سریع، امن و بدون ارسال داده"
- 3 flagship product cards above utility tools
- Quick tools section with 6 curated categories
- Updated FAQ questions
- Removed redundant TrustStats, SocialProofSection, UsageStatsBar

### 4. Sitemap/robots production URLs fixed

- `.env`: Changed `NEXT_PUBLIC_SITE_URL` from `http://localhost:3000` to `https://persiantoolbox.ir`
- Next build will now generate correct production URLs in sitemap.xml and robots.txt

### 5. Playwright network filters fixed

- All 3 E2E test files: network tests now allow same-origin requests (localhost for dev, persiantoolbox.ir for production)
- Landing page navigation: changed from `toHaveURL` to `waitForURL` for more reliable navigation detection

### 6. Navigation feature flag test updated

- `tests/unit/navigation-feature-flag.test.tsx`: Updated to test new grouped navigation structure

## Test Results

| Command                        | Result                        |
| ------------------------------ | ----------------------------- |
| pnpm typecheck                 | PASS                          |
| pnpm lint                      | PASS (0 errors, 140 warnings) |
| pnpm vitest --run              | PASS (857/857)                |
| pnpm build                     | PASS                          |
| Playwright (32 flagship tests) | PASS 32/32                    |

## Bugs Fixed: 6

1. استودیو wording in 6 UI files
2. Navbar clutter (10 flat items → 2 grouped dropdowns)
3. Homepage generic tool directory → flagship product focus
4. Sitemap/robots localhost URLs → production URLs
5. Playwright network filters (localhost:3100 → same-origin aware)
6. Navigation feature flag test (outdated assertions)

## Remaining Risks

- Sitemap/robots fix requires rebuild to take effect (NEXT_PUBLIC_SITE_URL is build-time)
- Performance budget still exceeds limit (pre-existing)
- Deploy needed to propagate sitemap/robots fix to production

## Commit SHA: pending

## Push status: pending
