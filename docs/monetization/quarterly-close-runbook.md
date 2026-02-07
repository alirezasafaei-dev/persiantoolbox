# Quarterly Close Runbook (Contract-Driven)

> آخرین به‌روزرسانی: 2026-02-07
> مالک اجرا: `@engineering_lead`
> بازبین: `@quality_engineer`
> تایید نهایی: `@engineering_lead`

## هدف

ارتقای گزارش فصلی KPI از `pre-close` به `published` با تصمیم‌های رسمی فصل بعد.

## مراحل اجرایی

1. اجرای اعتبارسنجی قرارداد عملیات:
   - `pnpm monetization:ops:validate`
2. اجرای نگاشت هشدار به تصمیم:
   - `pnpm monetization:alerting:validate`
3. اجرای pipeline خودکار close:
   - `pnpm monetization:close:quarterly`
4. یکپارچه‌سازی خروجی گزارش‌ها در بازبینی KPI.
5. اعمال تصمیم برای هر KPI: `scale` یا `hold` یا `rollback`.
6. ثبت تصمیم‌ها و guardrailها در artifact قرارداد:
   - `docs/monetization/operations-checklist.json`
7. اجرای چک امنیت/حریم خصوصی بر مبنای `docs/monetization/admin-security-checklist.md`.
8. تغییر وضعیت خروجی بازبینی به `published`.

## معیار پذیرش

- گزارش فصل با وضعیت `published` ذخیره شده باشد.
- همه KPIهای بحرانی تصمیم نهایی داشته باشند.
- خروجی‌ها به backlog محصول متصل شده باشند.
