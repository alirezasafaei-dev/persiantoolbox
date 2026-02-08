# Snapshot — 2026-02-08 — CI Quality Regression Fix + Rerun

## Summary

- hardening مرحله `Setup Node` موفق بود و jobهای اصلی CI از آن عبور کردند.
- failure جدید روی `quality` به lint regression در `playwright.config.ts` محدود شد.
- فایل `playwright.config.ts` به ساختار پایدار refactor شد تا conflict formatter/lint تکرار نشود.

## Completed Work

### 1) CI signal analysis

- Run analyzed:
  - `21800614633` (commit `b9c3ea7`)
- Outcome:
  - Passed: `contracts`, `build`, `e2e-chromium`, `security-audit`, `licensing-docs`
  - Failed: `quality`

### 2) Quality failure fix

- Updated:
  - `playwright.config.ts`
- Fix:
  - حذف الگوی ternary چندسطحی برای پروژه Firefox
  - جایگزینی با آرایه `projects` و `if (enableFirefox) projects.push(...)`

### 3) Local gates

- Passed:
  - `pnpm ci:quick`
  - `pnpm ci:contracts`

### 4) Reporting sync

- Updated:
  - `docs/licensing/reports/v2.0.0-post-release-verification-2026-02-08.md`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-ci-quality-regression-fix-rerun-handoff.md

گام بعدی:
1) commit/push اصلاح `playwright.config.ts` را انجام بده.
2) وضعیت run جدید `ci-core` را تا completion مانیتور کن.
3) اگر همه jobها سبز شدند، گزارش post-release را final و readiness-artifacts را تایید کن.
```
