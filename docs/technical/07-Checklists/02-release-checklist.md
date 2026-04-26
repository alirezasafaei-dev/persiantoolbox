# PTB-CHK-002 — چک‌لیست انتشار (Release)

- [x] اجرای Lighthouse CI و بررسی افت‌ها
  - آخرین مرجع گیت انتشار: `docs/release/reports/rc-gates-2026-02-27T06-24-17-275Z.json`
  - پیگیری hard budget/trend به backlog منتقل شده: `docs/todo-next.md`
- [x] بررسی sitemap و robots در محیط production
  - قراردادها و پوشش مسیرها: `tests/e2e/seo-crawl.spec.ts`
  - پیاده‌سازی: `app/sitemap.ts` و `app/robots.ts`
- [x] تست آفلاین روی موبایل
  - [x] Loan
  - [x] Date tools
  - [x] PDF tools
  - مرجع تست و سناریوها: `tests/e2e/offline.spec.ts` و `docs/technical/smoke-tests.md`
- [x] بررسی پیام‌های stale/disabled برای ابزارهای Hybrid
  - قراردادها: `tests/unit/feature-availability.test.ts`
  - راهنمای فنی: `docs/technical/01-Architecture/02-datahub.md`
- [x] بررسی cache invalidation سرویس‌ورکر (آپدیت نسخه)
  - قراردادها: `tests/unit/sw-cache-version.test.ts` و `tests/e2e/offline.spec.ts`
  - اعتبارسنجی automation: `pnpm pwa:sw:validate`
