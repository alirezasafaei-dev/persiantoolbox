# Review-to-Backlog Flow

> آخرین به‌روزرسانی: 2026-02-06

## هدف

تبدیل خروجی گزارش‌های ماهانه/فصلی به آیتم‌های قابل اجرا در backlog محصول.

## جریان اجرایی

1. خروجی گزارش ماهانه یا فصلی نهایی می‌شود.
2. هر اقدام با owner/priority/order به یک آیتم backlog تبدیل می‌شود.
3. اولویت هر ticket با یکی از برچسب‌های زیر ثبت می‌شود:
   - `revenue-growth`
   - `ux-risk`
   - `privacy-risk`
   - `data-quality`
4. ticketها به milestone فاز فعال متصل می‌شوند.
5. وضعیت ticket در گزارش ماه بعد بازتاب داده می‌شود.

## قالب حداقلی هر ticket

- عنوان: `[Monetization] <Action>`
- منبع: لینک گزارش (`monthly` یا `quarterly`)
- تصمیم: `scale/hold/rollback`
- اولویت: `P0/P1/P2`
- ترتیب اجرا: `order`
- KPI هدف: `...`
- owner: `@...`

## نمونه فعال

- backlog جاری: `docs/monetization/review-backlog.json`
- اعتبارسنجی قرارداد backlog:
  - `pnpm monetization:review:validate`
