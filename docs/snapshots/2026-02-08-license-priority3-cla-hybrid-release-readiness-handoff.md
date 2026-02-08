# Snapshot — 2026-02-08 — License Priority 3 CLA Hybrid + v2 Release Readiness

## Summary

- CLA hybrid governance (DCO + ICLA/CCLA) به سیاست رسمی مشارکت اضافه شد.
- validator لایسنس برای artifacts و references مربوط به CLA hybrid گسترش یافت.
- چک‌لیست اجرایی release مرز لایسنس `v2.0.0` اضافه شد.

## Completed Work

### 1) CLA hybrid documents

- Added:
  - `docs/licensing/cla-individual.md`
  - `docs/licensing/cla-corporate.md`

### 2) v2 license boundary release checklist

- Added:
  - `docs/licensing/v2-license-release-checklist.md`

### 3) Governance sync

- Updated:
  - `docs/licensing/dual-license-policy.md`
  - `docs/licensing/license-migration-taskboard.md`
  - `CONTRIBUTING.md`
  - `AGENTS.md`

### 4) Contract enforcement

- Updated:
  - `scripts/licensing/validate-license-assets.mjs`
- Enforced:
  - وجود CLA docs + release checklist
  - ارجاع CLA hybrid در CONTRIBUTING/AGENTS

### 5) Documentation sync

- Updated:
  - `docs/index.md`
  - `docs/roadmap.md`
  - `CHANGELOG.md`

## Validation Executed

- `pnpm ci:contracts`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority3-cla-hybrid-release-readiness-handoff.md

گام بعدی:
1) مسیر عملیاتی امضای CLA (storage/audit/reference-id) را در docs/operations و docs/licensing مستند کن.
2) یک validator سبک برای consistency بین taskboard/policy/checklist لایسنس اضافه کن.
3) در صورت نیاز، release dry-run برای v2 migration docs اجرا کن و snapshot بگیر.
4) docs/index.md و CHANGELOG.md را sync کن، ci:quick اجرا کن، commit/push کن.
```
