# Snapshot — 2026-02-08 — Full E2E + Admin Race Stability

## Summary

- Full Chromium E2E suite passed with backend-enabled admin/retry coverage.
- Admin site-settings load/save race is now unit-tested.
- CI contract gate usage is formally documented in engineering standards and developer guide.

## Completed Work

### 1) Full E2E stabilization run

- Executed full suite with backend flags:
  - `E2E_ADMIN_BACKEND=1`
  - `E2E_RETRY_BACKEND=1`
- Command:
  - `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm test:e2e:ci`
- Result: `48 passed` on Chromium.

### 2) Unit test for admin load-race scenario

- Added:
  - `tests/unit/site-settings-admin-page-race.test.tsx`
- Covers:
  - form disabled while initial load is pending
  - save payload keeps edited `developerName` after load completes

### 3) Admin E2E readiness hardening

- Updated:
  - `tests/e2e/admin-site-settings.spec.ts`
- Adds:
  - stronger readiness wait before input/save actions
  - reduced flake in full-suite parallel execution

### 4) CI contracts policy docs

- Updated:
  - `docs/project-standards.md`
  - `docs/developer-guide.md`
- `ci:contracts` is now documented as required lightweight contract gate.

### 5) Deployment + roadmap docs sync

- Updated:
  - `docs/roadmap.md`
  - `docs/deployment-roadmap.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm ci:quick`
- `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools E2E_ADMIN_BACKEND=1 E2E_RETRY_BACKEND=1 PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm test:e2e:ci`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-full-e2e-and-admin-race-stability-handoff.md

گام بعدی:
1) فلگ‌های backend E2E را به مسیر CI مستند/استاندارد تیمی اضافه کن (runbook اجرایی).
2) نویز هشدار act(...) در تست واحد admin race را با الگوی بدون warning پایدارسازی کن.
3) یک گزارش خلاصه deploy-readiness (artifact) بعد از full E2E اجرا تولید و در docs/deployment/reports ثبت کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
