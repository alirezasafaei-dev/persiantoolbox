# راهنمای عملیاتی (Self-hosted)

> آخرین به‌روزرسانی: 2026-02-12

## 1) پیش‌نیازها

- Node.js 20+
- pnpm 9+

## 2) اجرای سرویس

```bash
pnpm install
pnpm run build
pnpm run start
```

## 3) تنظیمات محیطی

الزامی:

- `NEXT_PUBLIC_SITE_URL`

اختیاری:

- `NEXT_PUBLIC_ANALYTICS_ID`
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics`
- `ANALYTICS_DATA_DIR`
- `ANALYTICS_INGEST_SECRET`
- `DEVELOPER_NAME`
- `DEVELOPER_BRAND_TEXT`
- `ORDER_URL`
- `PORTFOLIO_URL`

## 4) PWA و آفلاین

- Service Worker در `/sw.js` ثبت می‌شود.
- صفحه آفلاین در `/offline` در دسترس است.
- برای هر تغییر SW، نسخه `CACHE_VERSION` در `public/sw.js` افزایش یابد.
- بعد از bump نسخه، اعتبارسنجی:
  - `pnpm pwa:sw:validate`

## 5) کنترل کیفیت قبل از دیپلوی

```bash
pnpm run lint
pnpm run typecheck
pnpm vitest --run
pnpm run build
```

## 6) نگهداری آرتیفکت‌ها

- مسیرهای خروجی (`dist/`, `coverage/`, `.lighthouseci/`) نباید commit شوند.

## 7) سیاست امنیت لبه (CSP/HSTS)

- هدرهای امنیتی باید از لایه proxy اعمال شوند و قبل از deploy بررسی شوند.
- حداقل سیاست لازم:
  - `Content-Security-Policy` با محدودسازی `script-src` و `connect-src`
  - `Strict-Transport-Security` فقط پس از فعال‌سازی کامل HTTPS
- مسیر بررسی:
  - `app/proxy.ts`
  - `tests/unit/proxy-csp.test.ts`
- نمونه راستی‌آزمایی دستی:

```bash
curl -I https://persiantoolbox.ir | grep -Ei 'content-security-policy|strict-transport-security'
```
