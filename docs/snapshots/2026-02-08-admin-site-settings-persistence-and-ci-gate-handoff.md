# Snapshot — 2026-02-08 — Admin Site-Settings Persistence + CI Contract Gate

## Summary

- `developerName` persistence instability in admin settings flow was fixed.
- E2E now covers `DB unavailable` behavior for `admin/site-settings`.
- A lightweight CI contracts gate was added and wired to core CI.

## Completed Work

### 1) Persistence fix for developerName

- `components/features/monetization/SiteSettingsAdminPage.tsx`
  - form fields and save action are blocked until initial settings load completes
  - explicit loading state added to prevent race between initial GET and user edits
  - this removes overwrite risk that could revert `developerName` to default

### 2) E2E expansion for admin site-settings

- `tests/e2e/admin-site-settings.spec.ts`
  - wait-for-ready guard before editing settings
  - persistence assertion for `developerName` via API GET after save
  - new `DB unavailable` scenario (503) with assertions for:
    - fallback env banner
    - disabled save button

### 3) Lightweight CI contracts gate

- `package.json`
  - added `ci:contracts`
- `.github/workflows/ci-core.yml`
  - added dedicated `contracts` job executing `pnpm ci:contracts`

### 4) Docs and visual board sync

- `docs/roadmap.md`
- `docs/deployment-roadmap.md`
- `docs/operations.md`
- `docs/roadmap-board.html`
- `docs/deployment-roadmap.html`
- `public/roadmap-board.html`
- `public/deployment-roadmap.html`
- `CHANGELOG.md`

## Validation Executed

- `pnpm ci:contracts`
- `pnpm ci:quick`
- `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools E2E_ADMIN_BACKEND=1 PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/admin-site-settings.spec.ts --project=chromium --workers=100% --reporter=list`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-admin-site-settings-persistence-and-ci-gate-handoff.md

گام بعدی:
1) E2E full-suite را با `E2E_ADMIN_BACKEND=1` روی Chromium اجرا و flakeهای احتمالی را پایدارسازی کن.
2) Contract gate را در policy مستندات CI (docs/project-standards.md یا docs/developer-guide.md) به‌صورت رسمی ثبت کن.
3) یک تست واحد برای حالت load-race فرم admin/site-settings اضافه کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
