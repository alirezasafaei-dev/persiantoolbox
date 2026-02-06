# Quarterly Close Runbook (Phase 7)

> آخرین به‌روزرسانی: 2026-02-06
> تناوب: فصلی
> مالک اجرا: `@engineering_lead`
> بازبین: `@quality_engineer`
> تایید نهایی: `@engineering_lead`

## هدف

ارتقای گزارش فصلی KPI از `pre-close` به `published` با تصمیم‌های رسمی فصل بعد.

## SLA

- Q-End + 2 days: تکمیل همه گزارش‌های ماهانه فصل.
- Q-End + 4 days: تکمیل بازبینی KPI و تصمیم‌ها.
- Q-End + 5 days: انتشار نسخه `published` گزارش فصل.

## مراحل اجرایی

1. بستن چک‌لیست فصل (`docs/monetization/YYYY-qX-close-checklist.md`).
2. یکپارچه‌سازی داده سه ماه در گزارش فصل (`docs/monetization/YYYY-qX-kpi-review.md`).
3. اعمال تصمیم برای هر KPI: `scale` یا `hold` یا `rollback`.
4. ثبت owner و deadline برای اقدامات فصل بعد.
5. اجرای چک امنیت/حریم خصوصی بر مبنای `docs/monetization/admin-security-checklist.md`.
6. تغییر وضعیت گزارش فصل به `published`.

## معیار پذیرش

- گزارش فصل با وضعیت `published` ذخیره شده باشد.
- همه KPIهای بحرانی تصمیم نهایی داشته باشند.
- خروجی‌ها به backlog محصول متصل شده باشند.
