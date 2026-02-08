# راهنمای عملیاتی (Self-hosted)

> آخرین به‌روزرسانی: 2026-02-08

این سند مرجع اجرای Persian Tools در محیط self-host است.

## 1) پیش‌نیازها

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (برای مسیرهای اشتراک/تاریخچه)

## 2) اجرای سرویس

```bash
pnpm install
pnpm build
pnpm start
```

## 3) نکته مهم نصب clean

- مسیر دیتابیس به مدل SQL-first یکپارچه شده است.
- `pnpm install --frozen-lockfile` به `prisma/schema.prisma` وابسته نیست.
- برای آماده‌سازی دیتابیس، اسکریپت `pnpm db:migrate` را اجرا کنید.

## 4) تنظیمات محیطی

- الزامی:
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URL` (وقتی مسیرهای DB فعال هستند)
  - `SESSION_TTL_DAYS`
  - `SUBSCRIPTION_WEBHOOK_SECRET`
  - `ADMIN_EMAIL_ALLOWLIST` (برای مسیرهای ادمین)
- اختیاری:
  - `NEXT_PUBLIC_ANALYTICS_ID`
  - `NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics`
  - `ANALYTICS_DATA_DIR`
  - `ANALYTICS_INGEST_SECRET`
  - `RATE_LIMIT_LOG=true`
  - `DEVELOPER_NAME`
  - `DEVELOPER_BRAND_TEXT`
  - `ORDER_URL`
  - `PORTFOLIO_URL`

- منطق نمایش لینک‌های معرفی توسعه‌دهنده در فوتر:
  1. مقدار ذخیره‌شده در `site_settings` (اگر DB فعال باشد)
  2. fallback به envهای بالا
  3. در نبود مقدار، لینک غیرفعال با برچسب «به‌زودی»
- مسیر ادمین `admin/site-settings` در نبود DB پیام راهنما برای fallback env نمایش می‌دهد و ذخیره دیتابیسی را غیرفعال می‌کند.

## 5) دیتابیس

- schema فعلی SQL در `scripts/db/schema.sql` نگهداری می‌شود.
- migration در محیط‌ها با `pnpm db:migrate` اعمال می‌شود.
- backup و restore باید بیرون از ریپو و در سطح زیرساخت تعریف شود.

## 6) اعتبارسنجی قرارداد تنظیمات معرفی توسعه‌دهنده

- قرارداد رسمی کلیدهای قابل مدیریت:
  - `docs/monetization/site-settings-contract.json`
- اعتبارسنجی قراردادی:
  - `pnpm monetization:site-settings:validate`

## 7) تحلیل‌گر self-hosted

- تحلیل‌گر فقط با `NEXT_PUBLIC_ANALYTICS_ID` فعال می‌شود.
- endpoint پیش‌فرض ارسال: `/api/analytics`.
- در production اگر تحلیل‌گر فعال باشد، `ANALYTICS_INGEST_SECRET` اجباری است.
- برای ingest/read در production هدر `x-pt-analytics-secret` باید معتبر باشد.

## 8) PWA و آفلاین

- Service Worker در `/sw.js` ثبت می‌شود.
- صفحه آفلاین در `/offline` در دسترس است.
- برای هر تغییر SW، نسخه `CACHE_VERSION` در `public/sw.js` افزایش یابد.
- فرمت نسخه باید `v<major>-YYYY-MM-DD` باشد (مثال: `v7-2026-02-07`).
- بعد از bump نسخه، اعتبارسنجی قرارداد SW را اجرا کنید:
  - `pnpm pwa:sw:validate`
- سپس سناریوهای update/clear-cache را تایید کنید:
  - `pnpm exec playwright test tests/e2e/offline.spec.ts --project=chromium`

## 9) کنترل کیفیت عملیاتی

```bash
pnpm ci:quick
pnpm test:e2e:ci
pnpm build
pnpm lighthouse:ci
pnpm monetization:review:validate
pnpm monetization:site-settings:validate
```

- برای اجرای لوکال سریع‌تر روی سیستم چند‌هسته‌ای:
  - `pnpm vitest --run --maxWorkers=100%`
  - `pnpm exec playwright test --project=chromium --workers=100%`

Workflowهای CI:

- `.github/workflows/ci-core.yml`
  - `pnpm install --frozen-lockfile`
  - `pnpm ci:quick`
  - `pnpm test:e2e:ci` (Chromium)
  - `pnpm build`
  - `pnpm audit --prod --audit-level=high`
- `.github/workflows/lighthouse-ci.yml`
  - اجرای Lighthouse CI و آپلود artifact گزارش
  - مسیرهای کلیدی: `/`, `/tools`, `/topics`, `/pdf-tools/merge/merge-pdf`, `/image-tools`, `/date-tools`, `/loan`, `/salary`, `/offline`
  - آستانه‌ها: `performance>=0.80` (warn), `seo>=0.92` (error), `accessibility>=0.94` (error), `best-practices>=0.95` (error)

## 10) نگهداری آرتیفکت‌ها

- مسیرهای خروجی (`dist/`, `coverage/`, `playwright-report/`, `test-results/`, `.lighthouseci/`) نباید commit شوند.
- گزارش‌های موقت کیفیت در محیط local یا artifact CI نگهداری شوند.

## 11) ترتیب اجرای Runbook

1. نصب clean و build را در محیط تازه تست کنید.
2. کیفیت و تست را کامل اجرا کنید.
3. تنظیمات امنیتی/consent را تایید کنید.
4. سرویس را deploy کنید و smoke-check انجام دهید.
5. پایش پس از انتشار را فعال نگه دارید.
