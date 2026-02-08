# License Migration Taskboard

> آخرین به‌روزرسانی: 2026-02-08

این بورد مسیر اجرایی مهاجرت از مدل فعلی MIT به مدل Dual License را به‌صورت اولویت‌محور نگه می‌دارد.

## Priority 0 — Governance Gates

- [x] تعریف مرز نسخه لایسنس
- [x] تعیین سیاست مشارکت حقوقی
- [x] ایجاد ساختار مستندات لایسنس/تجاری/برند
- [x] همگام‌سازی README با مرز نسخه و واژگان دقیق (source-available بعد از نقطه تغییر)

### P0 Decisions (Locked)

- Boundary:
  - `<= v1.1.x`: MIT
  - `>= v2.0.0`: Dual License (Non-Commercial + Commercial)
- Contribution policy until CLA rollout:
  - External PR merge is paused.
  - Issues/Discussions remain open.

## Priority 1 — Enforceable Repository Policy

- [ ] آماده‌سازی متادیتا `package.json` برای لایسنس سفارشی در زمان انتشار `v2.0.0`
- [ ] افزودن validator سبک برای وجود فایل‌های لایسنس در CI
- [ ] تعریف فرآیند صدور Commercial License (شناسه، دامنه استفاده، تاریخ)

## Priority 2 — Operational Hardening

- [ ] افزودن CLA یا DCO صریح برای بازگشایی merge خارجی
- [ ] افزودن اعلان کوتاه dual-license در entrypointهای اصلی (بعد از تغییر نسخه)
- [ ] تعریف پلن‌های تجاری و FAQ کوتاه خرید

## Execution Order

1. Priority 0 (done)
2. Priority 1
3. Priority 2
