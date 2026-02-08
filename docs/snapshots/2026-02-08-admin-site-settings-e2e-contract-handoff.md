# Snapshot — 2026-02-08 — Admin Site-Settings E2E + Contract Validation

## Summary

- Admin site-settings flow is now covered by dedicated E2E scenarios.
- DB-unavailable behavior in admin settings is now explicit with env fallback guidance.
- Site settings schema is formalized as a contract artifact with executable validator.

## Completed Work

### 1) Admin page resilience for no-DB mode

- `components/features/monetization/SiteSettingsAdminPage.tsx`
  - Detects storage unavailable (`503` / storage message).
  - Shows explicit fallback guidance for:
    - `DEVELOPER_NAME`
    - `DEVELOPER_BRAND_TEXT`
    - `ORDER_URL`
    - `PORTFOLIO_URL`
  - Disables DB save action while storage is unavailable.

### 2) E2E for admin site-settings

- `tests/e2e/admin-site-settings.spec.ts`
  - load current settings from admin route
  - invalid URL validation on save
  - successful save and footer link reflection
- `tests/e2e/helpers/admin.ts`
  - deterministic admin session bootstrap via register/login
  - backend gating with `E2E_ADMIN_BACKEND=1`
- `playwright.config.ts`
  - stable admin allowlist for E2E web server

### 3) Site-settings contract artifact + validator

- `docs/monetization/site-settings-contract.json`
- `scripts/monetization/validate-site-settings-contract.mjs`
- `tests/unit/site-settings-contract.test.ts`
- `package.json`
  - `pnpm monetization:site-settings:validate`

### 4) Documentation and visual board sync

- `docs/roadmap.md`
- `docs/deployment-roadmap.md`
- `docs/operations.md`
- `docs/roadmap-board.html`
- `docs/deployment-roadmap.html`
- `public/roadmap-board.html`
- `public/deployment-roadmap.html`
- `CHANGELOG.md`

## Validation Executed

- `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools pnpm db:migrate`
- `pnpm monetization:site-settings:validate`
- `pnpm ci:quick`
- `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools E2E_ADMIN_BACKEND=1 PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/admin-site-settings.spec.ts --project=chromium --workers=100% --reporter=list`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-admin-site-settings-e2e-contract-handoff.md

گام بعدی:
1) persistence تست developerName را در API/DB بررسی و علت fallback به مقدار پیش‌فرض را رفع کن.
2) یک E2E برای حالت DB-unavailable در admin/site-settings اضافه کن (نمایش banner + disabled save).
3) validator جدید را به یک gate CI سبک (contract checks) متصل کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
