# Deployment Readiness Reports

این پوشه خروجی اجرای گیت‌های استقرار را نگهداری می‌کند.

## تولید گزارش

- اعتبارسنجی قرارداد: `pnpm deploy:readiness:validate`
- اجرای گیت‌های core: `pnpm deploy:readiness:run`

## قرارداد خروجی

هر گزارش readiness باید شامل این فیلدها باشد:

- `version`
- `generatedAt`
- `tier`
- `overallStatus`
- `steps[]`

گزارش‌ها مبنای تایید release candidate هستند.

## گزارش خلاصه

- پس از اجرای کامل گیت‌ها/تست‌ها می‌توانید گزارش خلاصه وضعیت را در کنار گزارش readiness ثبت کنید:
  - الگو: `readiness-summary-<timestamp>.json`
  - نمونه:
    - `docs/deployment/reports/readiness-summary-2026-02-08T01-21-20-808Z.json`
