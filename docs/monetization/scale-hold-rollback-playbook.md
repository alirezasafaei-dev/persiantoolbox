# Playbook: Scale / Hold / Rollback

> آخرین به‌روزرسانی: 2026-02-07
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

1. artifact عملیات: `docs/monetization/operations-checklist.json`
2. گزارش ماهانه/فصلی KPI
3. وضعیت Alerting (`docs/monetization/kpi-alerting-escalation.md`)
4. چک‌لیست امنیت (`docs/monetization/admin-security-checklist.md`)
5. خروجی validator قرارداد:
   - `pnpm monetization:ops:validate`
   - `pnpm monetization:review:validate`

## خروجی استاندارد

1. تصمیم: `scale | hold | rollback`
2. دامنه تغییر: `placement | copy | targeting | none`
3. owner: `@...`
4. معیار اندازه‌گیری پس از تصمیم: `...`
5. شناسه آیتم تصمیم در backlog اجرایی: `MON-REV-...`
