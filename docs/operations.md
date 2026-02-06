# راهنمای عملیاتی (Self-hosted)

> آخرین به‌روزرسانی: 2026-02-06

این سند برای اجرای عملیاتی و نگهداری Persian Tools در محیط‌های self-host است.

## پیش‌نیازها

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (برای اشتراک و تاریخچه)
- Prisma CLI (از طریق `pnpm`)

## اجرا

```bash
pnpm install
pnpm build
pnpm start
```

## پایگاه داده (اشتراک و تاریخچه)

- مقداردهی اولیه دیتابیس:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

- متغیر محیطی `DATABASE_URL` باید در محیط اجرا تنظیم شود.
  - مثال: `postgresql://user:password@localhost:5432/persian_tools?schema=public`

- Seed اختیاری (در صورت نیاز به کاربر اولیه):

```bash
pnpm prisma:seed
```

- برای seed متغیرهای `SEED_ADMIN_EMAIL` و `SEED_ADMIN_PASSWORD` را تنظیم کنید.

### ریست Seed

برای حذف کاربران seed:

```bash
pnpm prisma:seed:reset
```

## Prisma Studio

برای بررسی دیتابیس به‌صورت بصری:

```bash
pnpm prisma:studio
```

## داشبورد استفاده

- مسیر: `/dashboard`
- داده‌ها فقط محلی و روی همان دستگاه ذخیره می‌شوند.
- برای ریست آمار از دکمه «پاک‌سازی داده‌ها» استفاده کنید.

## تحلیل‌گر self-hosted (اختیاری)

- فعال‌سازی تحلیل‌گر با تنظیم `NEXT_PUBLIC_ANALYTICS_ID` انجام می‌شود.
- مسیر پیش‌فرض ارسال داده‌ها: `NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics`
- محل ذخیره خلاصه داده‌ها روی سرور: `ANALYTICS_DATA_DIR` (پیش‌فرض: `var/analytics`)
- برای غیرفعال کردن کامل تحلیل‌گر، مقدار `NEXT_PUBLIC_ANALYTICS_ID` را خالی بگذارید.
- اگر `ANALYTICS_INGEST_SECRET` تنظیم شود، ارسال و خواندن داده‌ها نیازمند هدر
  `x-pt-analytics-secret` است.

## PWA و آفلاین

- Service Worker در `/sw.js` ثبت می‌شود.
- صفحه آفلاین در مسیر `/offline` در دسترس است.
- برای تست آفلاین: صفحه را یکبار آنلاین باز کنید، سپس حالت Offline مرورگر را فعال کنید.
- چرخه به‌روزرسانی Service Worker: هنگام آماده شدن نسخه جدید، SW پیام `UPDATE_AVAILABLE` می‌فرستد و در UI بنر «نسخه جدید جعبه‌ابزار آماده است» نمایش داده می‌شود. کاربر با دکمه «بروزرسانی و بارگذاری مجدد» SW جدید را فعال می‌کند.
- شبیه‌سازی آپدیت در توسعه: می‌توانید از پیام `DEBUG_FORCE_UPDATE` برای فعال‌کردن بنر در محیط dev استفاده کنید (نمونه در تست E2E `tests/e2e/offline.spec.ts`).

## نکات نگهداری

- هر بروزرسانی نسخه PWA بهتر است با افزایش `CACHE_VERSION` در `public/sw.js` انجام شود.
- تغییرات مسیرهای کلیدی را در تست‌های E2E پوشش دهید.
- در صورت نیاز به پاک‌سازی کامل کش در کلاینت، پیام `CLEAR_CACHES` به Service Worker ارسال کنید.
- برای ثبت لاگ‌های rate limit، متغیر `RATE_LIMIT_LOG=true` را تنظیم کنید.
- در صورت فعال بودن `RATE_LIMIT_LOG`, شمارنده‌های روزانه در جدول `rate_limit_metrics` ذخیره می‌شوند.

## Lighthouse و پایش کیفیت

- اجرای دستی روی build پروداکشن: `pnpm build && pnpm start:prod` سپس `pnpm lighthouse`.
- اجرای CI با baseline و آستانه: `pnpm lighthouse:ci` (از `lighthouserc.json` استفاده می‌کند).
- گزارش‌ها را در `reports/lighthouse/` نگه دارید؛ مسیر در `.gitignore` اضافه شده تا وارد مخزن نشود.
- گردش‌کار GitHub Actions (`.github/workflows/lighthouse-ci.yml`) روی `push` و `pull_request` اجرا می‌شود و خروجی `.lighthouseci` را به‌عنوان artifact نگه می‌دارد.

## پاک‌سازی آرتیفکت‌ها و انطباق با استانداردها (Post-audit 2026-02-05)

- پوشه‌های خروجی و گزارش (`dist/`, `coverage/`, `playwright-report/`, `test-results/`) نباید در مخزن نگه‌داری شوند؛ قبل از هر PR این مسیرها را حذف کنید و مطمئن شوید در `.gitignore` پوشش داده شده‌اند.
- برای ممیزی‌های بعدی Lighthouse روی ۵ مسیر اصلی (`/`, `/pdf-tools/merge/merge-pdf`, `/image-tools`, `/loan`, `/salary`) خروجی JSON را در پوشهٔ موقت محلی نگه دارید و داخل ریپو کامیت نکنید.
- در هنگام سفت‌تر کردن CSP و حذف `unsafe-inline/unsafe-eval`, از `next/script` یا hash/csp nonce استفاده کنید و پس از تغییر، مسیرهای حیاتی را با Playwright اطمینان بگیرید.
- CSP اکنون از `proxy.ts` صادر می‌شود؛ هر درخواست `Content-Security-Policy` و `x-csp-nonce` جدید دریافت می‌کند و اسکریپت‌های JSON-LD باید از `next/script` استفاده و `getCspNonce()` را بخوانند تا بلاک نشوند.
- پیش از استقرار، مطمئن شوید `NEXT_PUBLIC_ANALYTICS_ID` روی محیط پروداکشن خالی است تا رهگیری بدون رضایت فعال نشود؛ فعال‌سازی فقط بعد از اضافه شدن UI رضایت کاربر مجاز است.
- تبلیغات محلی صرفاً پس از رضایت کاربر نمایش داده می‌شوند؛ بنر `AdsConsentBanner` در `layout` نصب شده و `shared/consent/adsConsent.ts` وضعیت را ذخیره می‌کند. تست‌های Playwright باید این بنر و رفتار `AdSlot` را در حالت‌های consent مختلف بررسی کنند.
