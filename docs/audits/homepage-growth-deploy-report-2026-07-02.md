# Homepage Growth Deploy Report — 2026-07-02

## Summary

Homepage growth changes were shipped to production on commit `98512d4b`.

The deployed homepage now leads with the free-tools message, keeps the verified «۸۶ ابزار رایگان» wording consistent, and adds role-based paths so users can reach relevant tools faster.

## User-Facing Changes

- Added role-based homepage section: «مسیر پیشنهادی برای هر نوع کاربر».
- Added paths for:
  - حسابدار، مدیر مالی و منابع انسانی
  - کسب‌وکار کوچک، فروشگاه و فریلنسر
  - کاربر فایل، PDF و تصویر
  - نویسنده، دانشجو و تولیدکننده محتوا
- Each path links directly to three high-intent tools or hubs.
- Homepage SEO/title/meta copy continues to emphasize the verified «۸۶ ابزار رایگان» count.

## Files Changed

- `components/HomePage.tsx`
- `lib/home-copy.ts`
- `tests/e2e/home.spec.ts`
- `tests/unit/home-copy.test.ts`

## QA Evidence

Pre-deploy local QA passed:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm vitest --run` — 147 files, 1,234 tests passed
- `pnpm build` — 825 static/generated pages

Production deploy passed:

- `bash deploy-vps-auto.sh`
- PM2 `persiantoolbox` restarted via safe restart
- deploy script health checks passed

Live production checks passed:

- `https://persiantoolbox.ir/api/health` returned status OK with database and redis OK
- `/`, `/blog`, `/about`, `/contact`, `/pricing`, `/tools`, `/contract-tools`, `/contract-tools/salon-contract`, `/contract-tools/vehicle-sale`, `/writing-tools/persian-writing-studio` returned HTTP 200
- live CSS and `Vazirmatn-Bold.woff2` returned HTTP 200
- homepage HTML contains the new free-tools and role-path copy

## Remaining Growth Work

- Measure homepage role-path clicks as funnel events.
- Restore staging and run the same health check sequence there.
- Reduce high-volume lint warnings in admin/API code.
- Continue monetization phase 0: precise product IDs, subscription status contract, and export funnel tracking.
