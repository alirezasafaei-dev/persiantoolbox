# Guardrail های داده‌های Analytics

> آخرین به‌روزرسانی: 2026-02-07

این سند مرزهای جمع‌آوری، نگهداری و دسترسی داده‌های analytics را مشخص می‌کند تا رفتار کد با سیاست privacy-by-default هم‌راستا بماند.

## 1) دامنه مجاز داده‌ها

- فقط eventهای تجمیعی برای پایش محصول ثبت می‌شوند.
- داده‌های مجاز در ingest:
  - `event` (نام رخداد)
  - `timestamp`
  - `path`
  - `metadata` (فقط کلیدهای allowlist)
- قرارداد consent در ingest:
  - هر event باید `metadata.consentGranted=true` داشته باشد.
- خروجی ذخیره‌شده سرور (`summary.json`) فقط شامل:
  - `totalEvents`
  - `eventCounts`
  - `pathCounts`
  - `lastUpdated`

## 2) داده‌های ممنوع

- رمز عبور، token، cookie، secret.
- اطلاعات هویتی مستقیم (ایمیل، شماره تلفن، کد ملی).
- محتوای فایل‌ها یا متن خام ابزارهای پردازش‌شده.
- هر شناسه‌ای که بتواند کاربر را به شکل پایدار ردیابی کند.

## 3) شروط امنیتی اجباری

- در production:
  - اگر `NEXT_PUBLIC_ANALYTICS_ID` فعال است، `ANALYTICS_INGEST_SECRET` اجباری است.
  - ingest/read فقط با هدر `x-pt-analytics-secret` معتبر مجاز است.
- summary analytics فقط برای admin قابل دسترسی است (`ADMIN_EMAIL_ALLOWLIST`).
- هر payload ingest با بیش از 200 event رد می‌شود (`TOO_MANY_EVENTS`).

## 4) شروط رضایت (Consent)

- بدون رضایت کاربر (`contextualAds=false`) رویداد analytics از کلاینت ارسال نمی‌شود.
- با رضایت کاربر، ارسال رویداد مطابق endpoint self-hosted انجام می‌شود.
- metadata رویدادها با consent stamp ارسال می‌شود (`consentGranted`, `consentVersion`).

## 5) نگهداری و retention

- retention سرور در سطح summary تجمعی است (event خام روی سرور ذخیره نمی‌شود).
- query/hash از `path` پیش از ذخیره‌سازی حذف می‌شود.
- metadata فقط با allowlist نگهداری می‌شود و کلیدهای غیرمجاز حذف می‌شوند.
- برای تحلیل تبلیغات محلی در مرورگر:
  - حداکثر 1000 رویداد آخر در localStorage نگهداری می‌شود.
- backup/retention فایل‌های `ANALYTICS_DATA_DIR` باید در زیرساخت تعریف شود.

## 6) بازبینی و کنترل تغییر

- هر تغییر در مدل analytics باید این سند و `docs/operations.md` را به‌روزرسانی کند.
- PRهای مرتبط با analytics باید حداقل موارد زیر را شامل شوند:
  - تست واحد security/consent
  - خروجی `pnpm ci:quick`
  - تایید عدم ذخیره PII
