# Monetization Close Reports

گزارش‌های تولیدشده توسط pipelineهای خودکار close در این پوشه ذخیره می‌شوند.

## مسیرها

- `docs/monetization/reports/monthly/` خروجی `pnpm monetization:close:monthly`
- `docs/monetization/reports/quarterly/` خروجی `pnpm monetization:close:quarterly`

## قرارداد خروجی

هر فایل close شامل فیلدهای زیر است:

- `version`
- `closeType`
- `generatedAt`
- `overallStatus`
- `steps[]`
- `nextDecision`

این فایل‌ها artifact عملیاتی هستند و مبنای تصمیم `scale/hold/rollback` قرار می‌گیرند.
