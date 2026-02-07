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
