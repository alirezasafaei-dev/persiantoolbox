# Snapshot — 2026-02-08 — License Migration Taskboard + P0 Governance

## Summary

- سند تحلیل لایسنس به تسک‌های اجرایی اولویت‌محور تبدیل شد.
- فاز `P0` مهاجرت لایسنس در اسناد پروژه اعمال شد.
- مرز نسخه‌ای MIT/Dual License و سیاست مشارکت حقوقی فعلی در اسناد رسمی ثبت شد.

## Completed Work

### 1) Taskboard + policy

- Added:
  - `docs/licensing/license-migration-taskboard.md`
  - `docs/licensing/dual-license-policy.md`

### 2) License/commercial/trademark assets

- Added:
  - `LICENSE-NONCOMMERCIAL.md`
  - `LICENSE-COMMERCIAL.md`
  - `COMMERCIAL.md`
  - `NOTICE`
  - `TRADEMARKS.md`

### 3) Documentation sync

- Updated:
  - `README.md` (license boundary and migration references)
  - `CONTRIBUTING.md` (temporary legal contribution policy)
  - `docs/index.md` (new licensing section)
  - `docs/roadmap.md` (Priority 14: licensing governance)
  - `CHANGELOG.md`

## Locked Decisions

- `<= v1.1.x`: MIT
- `>= v2.0.0`: Planned Dual License (Non-Commercial + Commercial)
- Until CLA rollout: external PR merge paused, Issues/Discussions open

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-migration-taskboard-handoff.md

گام بعدی:
1) Priority 1 را اجرا کن: validator فایل‌های لایسنس را در scripts/licensing اضافه کن و به ci:contracts متصل کن.
2) آماده‌سازی package.json برای تغییر آینده لایسنس را به‌صورت conditional در مستندات release ثبت کن (بدون شکستن وضعیت MIT فعلی).
3) COMMERCIAL.md را با فرآیند صدور license (template + fields) کامل کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick را اجرا کن، commit/push کن.
```
