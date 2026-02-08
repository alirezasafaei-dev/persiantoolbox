# Snapshot — 2026-02-08 — Admin-Managed Developer Attribution Links

## Summary

- A professional developer attribution block was added to the site footer.
- Order and portfolio/personal-site links are now dynamic and configurable via admin panel.
- URL source priority is implemented as: `DB site_settings` -> `ENV fallback` -> disabled "به‌زودی" state.

## Implemented Changes

### 1) Data model and server settings layer

- `scripts/db/schema.sql`
  - added `site_settings` table (`key`, `value`, `updated_at`)
- `lib/siteSettings.ts`
  - settings types, defaults, URL normalization, request payload validation
- `lib/server/siteSettings.ts`
  - DB read/write with fallback behavior and storage-availability guard

### 2) Secure admin API

- `app/api/admin/site-settings/route.ts`
  - `GET`/`PUT` with `requireAdminFromRequest`
  - payload validation + 400 for invalid URL formats
  - 503 when DB-backed storage is unavailable

### 3) Admin UI

- `app/admin/site-settings/page.tsx`
- `components/features/monetization/SiteSettingsAdminPage.tsx`
  - fields: developer name, brand text, order URL, portfolio URL
  - save + test-link actions
  - explicit "به‌زودی" behavior when `portfolio_url` is empty
- `components/features/monetization/MonetizationAdminPage.tsx`
  - shortcut link to `/admin/site-settings`

### 4) Footer integration

- `components/ui/Footer.tsx`
  - now renders developer attribution block using dynamic settings
  - includes order/portfolio actions with disabled fallback labels
- `components/ui/index.ts`
  - removed `Footer` barrel export to keep server-only footer out of client bundle paths

### 5) Environment and docs sync

- `.env.example`
  - `DEVELOPER_NAME`
  - `DEVELOPER_BRAND_TEXT`
  - `ORDER_URL`
  - `PORTFOLIO_URL`
- `docs/operations.md`
  - documented source priority and fallback behavior
- `docs/roadmap.md`
- `CHANGELOG.md`

### 6) Tests

- `tests/unit/site-settings-validation.test.ts`
- `tests/unit/admin-site-settings-route.test.ts`

## Validation Executed

- `pnpm ci:quick`
- `PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/routes.spec.ts --project=chromium --workers=4 --reporter=list`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-admin-developer-attribution-settings-handoff.md

گام بعدی:
1) E2E اختصاصی برای admin site-settings اضافه کن (GET/PUT + reflect in footer).
2) برای site-settings validator اسکریپت قراردادی اضافه کن.
3) docs/index.md و CHANGELOG.md را sync کن.
4) در پایان ci:quick اجرا کن و commit/push کن.
```
