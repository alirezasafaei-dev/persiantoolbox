# Snapshot — 2026-02-08 — License Priority 2 Operational Hardening

## Summary

- Priority 2 لایسنس تکمیل شد.
- DCO governance برای مشارکت خارجی رسمی شد.
- اعلان future-facing لایسنس در entrypointهای اصلی اضافه شد.
- FAQ مسیر تجاری برای خرید/پشتیبانی/انتقال تکمیل شد.

## Completed Work

### 1) DCO governance

- Added:
  - `DCO.md`
  - `.github/PULL_REQUEST_TEMPLATE.md`
- Updated:
  - `CONTRIBUTING.md`
  - `AGENTS.md`

### 2) Licensing contract hardening

- Updated:
  - `scripts/licensing/validate-license-assets.mjs`
- Enforced:
  - required presence of `DCO.md` and PR template
  - required DCO references in `CONTRIBUTING.md` and `AGENTS.md`

### 3) Entrypoint licensing notice (future-facing)

- Updated:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `shared/index.ts`

### 4) Commercial FAQ

- Updated:
  - `COMMERCIAL.md`

### 5) Docs sync

- Updated:
  - `docs/licensing/license-migration-taskboard.md` (Priority 2 marked done)
  - `docs/roadmap.md` (Priority 14 marked done)
  - `docs/index.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm ci:contracts`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority2-operational-hardening-handoff.md

گام بعدی:
1) یک CLA سبک (individual/corporate) در docs/licensing تعریف کن تا سیاست DCO+CLA hybrid روشن شود.
2) مسیر release برای v2.0.0 را با چک‌لیست مهاجرت LICENSE/package.json/README/CHANGELOG نهایی کن.
3) اگر لازم بود validator لایسنس را برای CLA artifacts گسترش بده.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
