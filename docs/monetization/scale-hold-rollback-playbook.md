# Playbook: Scale / Hold / Rollback

> آخرین به‌روزرسانی: 2026-02-06
> دامنه: تصمیم‌های اجرایی درآمدزایی

## قواعد تصمیم

- `scale`:
  - KPIهای کلیدی on-track یا بالاتر از هدف
  - بدون نقض privacy/consent
  - بدون افت معنی‌دار UX
- `hold`:
  - داده ناکافی یا نوسان بالا
  - ریسک متوسط بدون شواهد کافی برای گسترش
- `rollback`:
  - هشدار قرمز KPI
  - افزایش محسوس bounce یا افت conversion
  - هر ریسک امنیت/حریم خصوصی تاییدشده

## ورودی‌های تصمیم

1. گزارش ماهانه (`docs/monetization/YYYY-MM-monthly-report.md`)
2. گزارش فصلی KPI (`docs/monetization/YYYY-qX-kpi-review.md`)
3. وضعیت Alerting (`docs/monetization/kpi-alerting-escalation.md`)
4. چک‌لیست امنیت (`docs/monetization/admin-security-checklist.md`)

## خروجی استاندارد

1. تصمیم: `scale | hold | rollback`
2. دامنه تغییر: `placement | copy | targeting | none`
3. owner: `@...`
4. deadline: `YYYY-MM-DD`
5. معیار اندازه‌گیری پس از تصمیم: `...`
