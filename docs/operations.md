# راهنمای عملیاتی (Self-hosted)

> آخرین به‌روزرسانی: 2026-02-11

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
pnpm ci:contracts
pnpm test:e2e:ci
pnpm build
pnpm lighthouse:ci
pnpm monetization:review:validate
pnpm monetization:site-settings:validate
```

- اجرای E2E کامل با backend fixtureهای deterministic:
  - `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools`
  - `E2E_ADMIN_BACKEND=1`
  - `E2E_RETRY_BACKEND=1`
  - `PLAYWRIGHT_SKIP_FIREFOX=1`
  - `PLAYWRIGHT_DISABLE_VIDEO=1`
  - `pnpm test:e2e:ci`

- برای اجرای لوکال سریع‌تر روی سیستم چند‌هسته‌ای:
  - `pnpm vitest --run --maxWorkers=100%`
  - `pnpm exec playwright test --project=chromium --workers=100%`

Workflowهای CI:

- `.github/workflows/ci-core.yml`
  - `pnpm ci:contracts` (گیت سبک قراردادها و SW version)
  - `pnpm install --frozen-lockfile`
  - `pnpm ci:quick`
  - `pnpm test:e2e:ci` (Chromium)
  - `pnpm build`
  - `pnpm audit --prod --audit-level=high`
- `.github/workflows/lighthouse-ci.yml`
  - اجرای Lighthouse CI و آپلود artifact گزارش
  - مسیرهای کلیدی: `/`, `/tools`, `/topics`, `/pdf-tools/merge/merge-pdf`, `/image-tools`, `/date-tools`, `/loan`, `/salary`, `/offline`
  - آستانه‌ها: `performance>=0.80` (warn), `seo>=0.92` (error), `accessibility>=0.94` (error), `best-practices>=0.95` (error)
- `.github/workflows/deploy-staging.yml`
  - deploy خودکار staging روی `main` + امکان trigger دستی
  - اجرای `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build` قبل از deploy
  - deploy با `ops/deploy/deploy.sh` روی VPS از طریق SSH
  - تولید گزارش post-deploy staging با `strict=true`
- `.github/workflows/deploy-production.yml`
  - deploy دستی production با ورودی `release_ref` و `run_migrations`
  - اجرای gateهای `deploy:readiness`, `release:rc`, `release:launch` قبل از deploy
  - deploy با `ops/deploy/deploy.sh` و قابلیت rollback با `ops/deploy/rollback.sh`
  - rollback خودکار اگر post-deploy smoke/security check fail شود

## 10) نگهداری آرتیفکت‌ها

- مسیرهای خروجی (`dist/`, `coverage/`, `playwright-report/`, `test-results/`, `.lighthouseci/`) نباید commit شوند.
- گزارش‌های موقت کیفیت در محیط local یا artifact CI نگهداری شوند.

## 11) ترتیب اجرای Runbook

1. نصب clean و build را در محیط تازه تست کنید.
2. کیفیت و تست را کامل اجرا کنید.
3. تنظیمات امنیتی/consent را تایید کنید.
4. سرویس را deploy کنید و smoke-check انجام دهید.
5. پایش پس از انتشار را فعال نگه دارید.

## 12) عملیات مشارکت خارجی (DCO + CLA)

- policy مرجع:
  - `DCO.md`
  - `docs/licensing/cla-operations.md`
  - `docs/licensing/cla-individual.md`
  - `docs/licensing/cla-corporate.md`
- هر merge خارجی باید:
  1. `Signed-off-by` معتبر داشته باشد.
  2. `referenceId` فعال CLA در رجیستر داخلی داشته باشد.
- فرمت مرجع CLA:
  - `CLA-<YEAR>-<TYPE>-<SEQ>`
- storage فایل امضاشده CLA خارج از ریپو و در storage خصوصی نگهداری می‌شود؛ در ریپو فقط metadata مستند می‌شود.

## 13) قفل نهایی Release Readiness

- مرجع انتشار:
  - نسخه: `v2.0.0`
  - branch: `main`
  - tag: `v2.0.0`
- گیت‌های محلی:
  - `pnpm ci:quick` پاس
  - `pnpm ci:contracts` پاس
- گیت ابری:
  - workflow: `ci-core`
  - run id: `21800702059`
  - commit: `4cd955f`
  - conclusion: `success`
- گزارش رسمی تایید:
  - `docs/licensing/reports/v2.0.0-post-release-verification-2026-02-08.md`

## 14) اقدام‌های خارج از ریپو (Owner: شما)

- زیرساخت:
  - تهیه VPS/Host production
  - تنظیم دسترسی SSH امن و محدودسازی پورت‌ها
- دامنه و TLS:
  - تهیه دامنه production
  - تنظیم DNS
  - فعال‌سازی و تمدید SSL/TLS
- secrets و سرویس‌ها:
  - تنظیم envهای production (site/db/session/webhook/admin/analytics)
  - راه‌اندازی Secret Manager یا نگهداری امن env
- دیتابیس:
  - ایجاد دیتابیس production
  - تعریف backup/restore و retention خارج از ریپو
- برند:
  - تامین لوگو/favicons/OG assets نهایی
- سرویس‌های بیرونی اختیاری:
  - payment/webhook provider
  - SMTP/Email provider

## 15) سیاست عملیاتی Webhook پرداخت

- هدرهای اجباری webhook:
  - `x-pt-signature`
  - `x-pt-event-id`
  - `x-pt-timestamp` (unix seconds)
- کنترل زمان:
  - اختلاف زمانی بیش از `SUBSCRIPTION_WEBHOOK_MAX_SKEW_SECONDS` (پیش‌فرض 300 ثانیه) رد می‌شود.
- کنترل replay:
  - هر `event-id` فقط یک بار در پنجره `SUBSCRIPTION_WEBHOOK_REPLAY_WINDOW_SECONDS` (پیش‌فرض 600 ثانیه) پذیرفته می‌شود.
  - تکرار event-id با خطای `REPLAY_DETECTED` رد می‌شود.
- خط‌مشی لاگ:
  - payload خام webhook یا secret/signature نباید log شود.
  - برای incident فقط metadata غیرحساس (event-id، timestamp، کد خطا) ثبت شود.

## 16) بسته عملیاتی VPS

- اسکریپت‌های deploy/rollback:
  - `ops/deploy/deploy.sh`
  - `ops/deploy/rollback.sh`
- نمونه کانفیگ reverse proxy:
  - `ops/nginx/persian-tools.conf`
- نمونه سرویس‌های `systemd` برای PM2 runtime:
  - `ops/systemd/persian-tools-staging.service`
  - `ops/systemd/persian-tools-production.service`
- قالب env برای هر محیط:
  - `env.staging.example`
  - `env.production.example`
- runbook کامل اجرای production:
  - `docs/vps-deploy-runbook.md`
- تولید گزارش post-deploy:
  - `pnpm deploy:post:report -- --base-url=<url> --environment=production --git-ref=<ref>`
- تبدیل env به base64 برای GitHub Secrets:
  - `pnpm deploy:env:encode -- <env-file-path>`
