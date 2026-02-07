# چارچوب بازبینی فصلی KPI و مالکیت شاخص‌ها

> آخرین به‌روزرسانی: 2026-02-07
> بازه بازبینی: فصلی (Q1/Q2/Q3/Q4)
> دامنه: مسیرهای درآمدزایی کم‌ریسک، اشتراک و تجربه کاربری مرتبط

## 1) Cadence بازبینی

- جلسه بازبینی اصلی: هفته دوم ماه اول هر فصل (فروردین/تیر/مهر/دی).
- جلسه پیگیری اقدامات: هفته ششم هر فصل.
- freeze تصمیم‌ها: پایان هفته هشتم هر فصل.
- انتشار خلاصه تصمیم: حداکثر تا 7 روز پس از freeze.

## 2) نقش‌ها و مسئولیت‌ها

- KPI Owner: مسئول صحت داده، تحلیل تغییرات و پیشنهاد اقدام.
- Reviewer (Product/Engineering): مسئول تایید کیفیت تحلیل و اولویت‌بندی.
- Approver (Lead): مسئول تایید نهایی برنامه فصل بعد.

## 3) ماتریس KPI Owners

| KPI                         | تعریف کوتاه                            | KPI Owner           | Reviewer            | Cadence |
| --------------------------- | -------------------------------------- | ------------------- | ------------------- | ------- |
| Impression                  | تعداد نمایش جایگاه‌های درآمدی          | `@quality_engineer` | `@engineering_lead` | فصلی    |
| CTR                         | نسبت کلیک به نمایش                     | `@quality_engineer` | `@engineering_lead` | فصلی    |
| RPM/ARPU                    | درآمد به ازای هر 1000 نمایش / هر کاربر | `@engineering_lead` | `@quality_engineer` | فصلی    |
| Bounce Rate (Revenue Paths) | نرخ خروج مسیرهای درآمدی                | `@ux_accessibility` | `@engineering_lead` | فصلی    |
| Subscription Conversion     | نرخ تبدیل مسیر اشتراک                  | `@engineering_lead` | `@quality_engineer` | فصلی    |

## 3.1) نگاشت نقش‌ها

- `@engineering_lead`: صاحب نهایی تصمیم‌های محصول/فنی درآمدزایی.
- `@quality_engineer`: مالک اعتبارسنجی داده‌ها و کیفیت سنجش KPI.
- `@ux_accessibility`: مالک KPIهای تجربه کاربری و نرخ خروج.

## 4) ورودی‌ها و خروجی‌های هر بازبینی

- ورودی الزامی:
  - آخرین گزارش ماهانه از `docs/monetization/monthly-report-template.md`
  - داده مقایسه‌ای فصل قبل و baseline سالانه
  - وضعیت consent تبلیغات و رخدادهای حریم خصوصی
  - خروجی اعتبارسنجی `docs/monetization/operations-checklist.json`
- خروجی الزامی:
  - تصمیم `scale / hold / rollback` برای هر KPI بحرانی
  - 3 اقدام اولویت‌دار با owner
  - ثبت در issue/PR و لینک در گزارش فصل

## 5) SLA داده و کیفیت

- مهلت آماده‌سازی داده خام: حداکثر 3 روز کاری قبل از جلسه بازبینی اصلی.
- مهلت انتشار تحلیل اولیه KPI Owner: حداکثر 1 روز کاری قبل از جلسه.
- در صورت نقص داده، KPI باید با برچسب `data-quality-risk` ثبت شود.

## 6) قالب تصمیم نهایی فصل

1. KPI: `...`
2. وضعیت: `above target | on track | below target`
3. تصمیم: `scale | hold | rollback`
4. اقدام: `...`
5. owner: `@...`
6. deadline: `YYYY-MM-DD`
