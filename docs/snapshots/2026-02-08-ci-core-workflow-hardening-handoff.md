# Snapshot — 2026-02-08 — CI Core Workflow Hardening

## Summary

- علت شکست تکرارشونده cloud CI در مرحله `Setup Node` شناسایی شد (الگوی شکست قبل از مراحل پروژه).
- workflow اصلی CI harden شد تا وابستگی مستقیم به `actions/setup-node` حذف شود.
- گیت‌های محلی کیفیت و قراردادها پس از hardening پاس شدند.

## Completed Work

### 1) CI workflow hardening

- Updated:
  - `.github/workflows/ci-core.yml`
- Applied:
  - حذف `Setup Node` در تمام jobها
  - افزودن `Verify runtime` با:
    - `node -v`
    - `corepack enable`
    - `corepack prepare pnpm@9.15.0 --activate`
    - `pnpm -v`

### 2) Local verification

- Passed:
  - `pnpm ci:quick`
  - `pnpm ci:contracts`

### 3) Reporting sync

- Updated:
  - `docs/licensing/reports/v2.0.0-post-release-verification-2026-02-08.md`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-ci-core-workflow-hardening-handoff.md

گام بعدی:
1) خروجی run جدید `ci-core` پس از hardening را بررسی کن.
2) اگر سبز بود، گزارش post-release را final کن و بوردهای roadmap/deployment را sync کن.
3) اگر هنوز fail بود، failure step جدید را از job logs استخراج و fix بعدی را مستقیم اعمال کن.
```
