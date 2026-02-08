# Snapshot — 2026-02-08 — Admin Attribution Delivery Final

## Summary

- Admin-managed developer attribution for footer is fully delivered and pushed.
- Footer links now support runtime fallback: `DB` -> `ENV` -> disabled "به‌زودی".
- Secure admin API and admin UI for editing site attribution settings are in place.

## Completed Scope

### 1) Admin settings domain + storage

- `lib/siteSettings.ts`
- `lib/server/siteSettings.ts`
- `scripts/db/schema.sql` (`site_settings` table)

### 2) Admin management surface

- `app/api/admin/site-settings/route.ts`
- `app/admin/site-settings/page.tsx`
- `components/features/monetization/SiteSettingsAdminPage.tsx`
- `components/features/monetization/MonetizationAdminPage.tsx` (entry link)

### 3) Public UI integration

- `components/ui/Footer.tsx` now renders:
  - developer identity text
  - order action link
  - portfolio/personal-site action link
  - disabled "به‌زودی" labels when URLs are missing

### 4) Docs and env sync

- `.env.example` (`DEVELOPER_NAME`, `DEVELOPER_BRAND_TEXT`, `ORDER_URL`, `PORTFOLIO_URL`)
- `docs/operations.md`
- `docs/roadmap.md`
- `CHANGELOG.md`
- `docs/index.md`

### 5) Test coverage

- `tests/unit/site-settings-validation.test.ts`
- `tests/unit/admin-site-settings-route.test.ts`

## Verification

- `pnpm ci:quick` passed on this delivery state.
- Branch pushed to `origin/main` with feature commit.

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-admin-attribution-delivery-final-handoff.md

گام بعدی:
1) E2E برای admin/site-settings اضافه کن: load, save, invalid URL validation, footer reflection.
2) اگر DB در دسترس نبود، banner راهنما برای ENV fallback در صفحه ادمین اضافه کن.
3) docs/roadmap-board.html و docs/deployment-roadmap.html را با وضعیت جدید sync کن.
4) در پایان ci:quick + تست E2E هدفمند اجرا کن و commit/push کن.
```
