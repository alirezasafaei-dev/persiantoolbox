# KPI Alerting & Escalation Matrix (Phase 7)

> آخرین به‌روزرسانی: 2026-02-06
> دامنه: KPIهای درآمدی و UX مرتبط

## آستانه‌های هشدار

| KPI                         | سطح هشدار زرد | سطح هشدار قرمز | Owner               | اقدام فوری                      |
| --------------------------- | ------------- | -------------- | ------------------- | ------------------------------- |
| Impression                  | افت > 10% MoM | افت > 20% MoM  | `@quality_engineer` | بررسی خط لوله داده و جایگاه‌ها  |
| CTR                         | افت > 8% MoM  | افت > 15% MoM  | `@quality_engineer` | بازبینی جایگاه و محتوای تبلیغ   |
| RPM/ARPU                    | افت > 10% MoM | افت > 20% MoM  | `@engineering_lead` | توقف تغییرات تهاجمی و تحلیل علت |
| Bounce Rate (Revenue Paths) | افزایش > 5%   | افزایش > 10%   | `@ux_accessibility` | rollback تغییرات UX اخیر        |
| Subscription Conversion     | افت > 5%      | افت > 10%      | `@engineering_lead` | بازبینی funnel و CTAها          |

## Escalation Matrix

- سطح زرد:
  - SLA واکنش: حداکثر 1 روز کاری
  - مسیر: Owner -> Reviewer
  - خروجی: تحلیل علت + برنامه اقدام
- سطح قرمز:
  - SLA واکنش: حداکثر 4 ساعت کاری
  - مسیر: Owner -> Reviewer -> Engineering Lead
  - خروجی: تصمیم فوری `hold/rollback` + ticket بحرانی

## Guardrail حریم خصوصی

- هر هشدار که به تغییر UX تبلیغاتی منجر شود باید با consent gate دوباره بررسی شود.
- رخدادهای حریم خصوصی یا نشتی داده مستقیم در سطح قرمز مدیریت می‌شوند.
