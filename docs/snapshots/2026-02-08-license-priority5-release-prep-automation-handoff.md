# Snapshot — 2026-02-08 — License Priority 5 Release-prep Automation

## Summary

- release-prep مسیر مهاجرت لایسنس `v2.0.0` تکمیل شد.
- template رسمی release notes اضافه شد.
- CI job مستقل برای validate مستندات لایسنس اضافه شد.

## Completed Work

### 1) Release-prep automation

- Added:
  - `scripts/licensing/run-v2-release-prep-dry-run.mjs`
  - `docs/licensing/reports/v2-license-release-prep-dry-run-2026-02-08T14-29-57-080Z.json`
  - `docs/licensing/reports/README.md`
- Updated:
  - `package.json` (`licensing:release:dry-run`)

### 2) Release note template

- Added:
  - `docs/licensing/v2-release-notes-template.md`

### 3) CI licensing docs job

- Updated:
  - `.github/workflows/ci-core.yml` (new `licensing-docs` job)

### 4) Validation hardening

- Updated:
  - `scripts/licensing/validate-license-assets.mjs`
  - `scripts/licensing/validate-license-consistency.mjs`

### 5) Docs sync

- Updated:
  - `docs/licensing/license-migration-taskboard.md` (Priority 5 done)
  - `docs/operations.md`
  - `docs/roadmap.md`
  - `docs/index.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm licensing:release:dry-run`
- `pnpm licensing:validate`
- `pnpm ci:contracts`
- `pnpm ci:quick`

## Branching

- Release prep branch: `release/v2-license-prep`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority5-release-prep-automation-handoff.md

گام بعدی:
1) در release/v2-license-prep، اجرای واقعی v2 checklist را در یک release-candidate commit انجام بده (بدون انتشار نهایی).
2) draft release notes را با template جدید کامل کن.
3) اگر لازم بود، CI workflow را برای trigger روی branch release/v2-license-prep هم فعال کن.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
