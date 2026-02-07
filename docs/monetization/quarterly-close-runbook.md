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
2. یکپارچه‌سازی خروجی گزارش‌ها در بازبینی KPI.
3. اعمال تصمیم برای هر KPI: `scale` یا `hold` یا `rollback`.
4. ثبت تصمیم‌ها و guardrailها در artifact قرارداد:
   - `docs/monetization/operations-checklist.json`
5. اجرای چک امنیت/حریم خصوصی بر مبنای `docs/monetization/admin-security-checklist.md`.
6. تغییر وضعیت خروجی بازبینی به `published`.

## معیار پذیرش

- گزارش فصل با وضعیت `published` ذخیره شده باشد.
- همه KPIهای بحرانی تصمیم نهایی داشته باشند.
- خروجی‌ها به backlog محصول متصل شده باشند.
