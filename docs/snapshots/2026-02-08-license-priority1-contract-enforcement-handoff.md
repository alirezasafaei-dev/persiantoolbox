# Snapshot — 2026-02-08 — License Priority 1 Contract Enforcement

## Summary

- Priority 1 مهاجرت لایسنس به‌صورت کامل اجرا شد.
- validator لایسنس به گیت قراردادی CI متصل شد.
- فرآیند صدور Commercial License با قالب اجرایی استاندارد شد.
- transition rule برای تغییر آتی `package.json#license` در `v2.0.0` ثبت شد.

## Completed Work

### 1) CI contract enforcement

- Added:
  - `scripts/licensing/validate-license-assets.mjs`
- Updated:
  - `package.json` (`licensing:validate` + اتصال به `ci:contracts`)

### 2) Package license transition planning

- Added:
  - `docs/licensing/package-license-transition.md`

### 3) Commercial issuance process

- Updated:
  - `COMMERCIAL.md` (issuance fields + template + operational flow)

### 4) Documentation sync

- Updated:
  - `docs/licensing/license-migration-taskboard.md` (Priority 1 -> done)
  - `docs/roadmap.md`
  - `docs/index.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm ci:contracts`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority1-contract-enforcement-handoff.md

گام بعدی:
1) Priority 2 را اجرا کن: CLA یا DCO policy را رسمی کن و در CONTRIBUTING/AGENTS enforce کن.
2) برای entrypointهای اصلی، بنر کوتاه dual-license (future-facing) اضافه کن بدون تغییر رفتار runtime.
3) COMMERCIAL.md را با FAQ خرید (scope/version/support/transfer) کامل کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick را اجرا کن، commit/push کن.
```
