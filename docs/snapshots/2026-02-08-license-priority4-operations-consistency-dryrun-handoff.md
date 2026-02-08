# Snapshot — 2026-02-08 — License Priority 4 Operations + Consistency + Dry-run

## Summary

- عملیات CLA با مسیر audit/reference-id در runbook رسمی شد.
- validator consistency برای اسناد لایسنس اضافه شد.
- dry-run مستنداتی مهاجرت مرز لایسنس `v2.0.0` ثبت شد.

## Completed Work

### 1) CLA operations runbook

- Added:
  - `docs/licensing/cla-operations.md`
- Updated:
  - `docs/operations.md`

### 2) License consistency validator

- Added:
  - `scripts/licensing/validate-license-consistency.mjs`
- Updated:
  - `scripts/licensing/validate-license-assets.mjs`
  - `package.json` (`licensing:consistency`, updated `licensing:validate`)

### 3) Dry-run report

- Added:
  - `docs/licensing/reports/v2-license-migration-dry-run-2026-02-08.json`

### 4) Docs sync

- Updated:
  - `docs/licensing/license-migration-taskboard.md` (Priority 4 marked done)
  - `docs/roadmap.md`
  - `docs/index.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm licensing:validate`
- `pnpm ci:contracts`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority4-operations-consistency-dryrun-handoff.md

گام بعدی:
1) اگر تصمیم release v2 قطعی شد، اجرای واقعی checklist در یک release-prep branch انجام شود.
2) release note template برای migration license (`<=v1.1.x MIT`, `>=v2.0.0 dual`) نهایی شود.
3) در صورت نیاز، CI job اختصاصی docs/licensing validation اضافه شود.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
