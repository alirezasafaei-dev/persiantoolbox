# نقشه آماده‌سازی استقرار (Deploy Readiness Roadmap)

> آخرین به‌روزرسانی: 2026-02-08

این سند چک‌لیست استقرار را بر اساس **اولویت و ترتیب اجرا** تعریف می‌کند.

## اولویت 1 — پیش‌نیازهای استقرار

- تعیین دامنه اصلی سرویس.
- تعیین نوع میزبانی (PaaS یا VPS) با معیارهای پایداری و امنیت.
- فعال‌سازی HTTPS و اتصال صحیح DNS.

## اولویت 2 — آماده‌سازی محیط اجرا

- تعریف متغیرهای محیطی الزامی:
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URL`
  - `SESSION_TTL_DAYS`
  - `SUBSCRIPTION_WEBHOOK_SECRET`
  - `ADMIN_EMAIL_ALLOWLIST`
- تعریف متغیرهای اختیاری:
  - `NEXT_PUBLIC_ANALYTICS_ID`
  - `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
  - `ANALYTICS_DATA_DIR`
  - `ANALYTICS_INGEST_SECRET`
  - `DEVELOPER_NAME`
  - `DEVELOPER_BRAND_TEXT`
  - `ORDER_URL`
  - `PORTFOLIO_URL`
- استقرار secrets خارج از ریپو (Secret Manager یا env امن).

## اولویت 3 — پایگاه داده و ماندگاری داده

- تعیین مسیر قطعی migration (Prisma یا SQL versioned).
- اجرای migration در pipeline استقرار.
- تعریف rollback برای schema.
- تعریف سیاست backup/restore و retention.

## اولویت 4 — امنیت و انطباق

- بررسی هدرهای امنیتی (`CSP`, `HSTS`, `X-Frame-Options`, `Referrer-Policy`).
- اطمینان از nonce برای JSON-LD و سازگاری با `proxy.ts`.
- اطمینان از consent قبل از ads/analytics.
- بررسی routeهای حساس برای auth/csrf/rate-limit.

## اولویت 5 — کیفیت انتشار

- اجرای `pnpm ci:quick`.
- اجرای `pnpm ci:contracts`.
- اجرای `pnpm test:e2e:ci`.
- اجرای سناریوهای E2E مدیریت تنظیمات سایت: `tests/e2e/admin-site-settings.spec.ts`.
- اجرای `pnpm build`.
- اجرای `pnpm lighthouse:ci` روی build production.
- اجرای `pnpm pwa:sw:validate` پس از هر bump در `CACHE_VERSION`.
- اجرای `tests/e2e/offline.spec.ts` برای تایید مسیر update/clear-cache سرویس‌ورکر.

## اولویت 6 — پس از انتشار

- اجرای smoke-check مسیرهای حیاتی.
- پایش خطاهای runtime و کیفیت تجربه کاربری.
- پایش CWV/Lighthouse و مدیریت regression.

## اولویت 7 — گیت قراردادی استقرار

- تعریف artifact قراردادی deploy readiness: `docs/deployment-readiness-gates.json`.
- اعتبارسنجی قراردادی گیت‌ها: `pnpm deploy:readiness:validate`.
- اجرای خودکار گیت‌های core استقرار: `pnpm deploy:readiness:run`.
- ثبت خروجی اجرایی گیت‌ها در `docs/deployment/reports/`.

## اولویت 8 — اتوماسیون RC و تمرین بازگشت

- تعریف artifact قراردادی RC: `docs/release-candidate-checklist.json`.
- اعتبارسنجی قراردادی RC: `pnpm release:rc:validate`.
- اجرای خودکار RC gates: `pnpm release:rc:run`.
- تعریف artifact قراردادی rollback drill: `docs/rollback-drill-checklist.json`.
- اعتبارسنجی rollback drill: `pnpm release:rollback:validate`.
- ثبت خروجی RC در `docs/release/reports/`.

## اولویت 9 — گیت روز لانچ

- تعریف artifact قراردادی روز لانچ: `docs/launch-day-checklist.json`.
- اعتبارسنجی قراردادی launch-day: `pnpm release:launch:validate`.
- اجرای launch smoke suite: `pnpm release:launch:run`.
- ثبت خروجی smoke روز لانچ در `docs/release/reports/`.
- تایید عملی گیت‌های core استقرار/RC: `pnpm deploy:readiness:run` و `pnpm release:rc:run`.

## ترتیب اجرا

1. اولویت‌های 1 تا 3 پیش‌شرط deploy هستند.
2. اولویت 4 باید قبل از public traffic تایید شود.
3. اولویت 5 gate نهایی انتشار است.
4. اولویت 6 برای پایدارسازی محیط بعد از release اجرا شود.
5. اولویت 7 به‌عنوان gate قابل‌اعتبارسنجی قبل از release candidate اجرا شود.
6. اولویت 8 به‌عنوان مرحله نهایی قبل از انتشار RC و تمرین rollback اجرا شود.
7. اولویت 9 به‌عنوان gate نهایی روز لانچ اجرا و ثبت شود.

## نسخه گرافیکی

- بورد مدیریتی: `docs/deployment-roadmap.html`
- مسیر داخلی اپ: `/deployment-roadmap`
