# Snapshot — 2026-02-07 — Priority 12 RC & Rollback Automation Closure

## Summary

- Priority 12 completed by operationalizing release-candidate gates and rollback drill contracts.
- RC readiness is now contract-driven, validated, and executable with report artifacts.
- Rollback drill readiness is now enforced via a dedicated checklist contract and validator.

## Implemented Changes

### 1) Release candidate contract and runner

- `docs/release-candidate-checklist.json`
  - RC env/security/quality/release outputs contract
  - quality gates include core and extended tiers
- `scripts/release/validate-rc-checklist.mjs`
- `scripts/release/run-rc-gates.mjs`
- `docs/release/reports/README.md`
- generated report artifact:
  - `docs/release/reports/rc-gates-2026-02-07T21-55-13-847Z.json`

### 2) Rollback drill contract and validator

- `docs/rollback-drill-checklist.json`
- `scripts/release/validate-rollback-drill.mjs`

### 3) Package scripts

- `release:rc:validate`
- `release:rollback:validate`
- `release:rc:run`

### 4) Contract test coverage

- `tests/unit/release-candidate-contract.test.ts`
- `tests/unit/rollback-drill-contract.test.ts`
- `tests/unit/release-rc-report-contract.test.ts`

### 5) Roadmap and board synchronization

- `docs/roadmap.md` (Priority 12 closed)
- `docs/deployment-roadmap.md` (RC/rollback gate priority added)
- `docs/roadmap-board.html`
- `docs/deployment-roadmap.html`
- `public/roadmap-board.html`
- `public/deployment-roadmap.html`
- `docs/index.md`
- `CHANGELOG.md`

## Validation Executed

- `pnpm release:rc:validate`
- `pnpm release:rollback:validate`
- `pnpm release:rc:run`
- `pnpm ci:quick`
- `PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/consent-analytics.spec.ts --project=chromium --workers=12 --reporter=list`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-07-priority12-rc-rollback-automation-handoff.md

Priority 13 را اجرا کن:
1) hardening نهایی Release: production smoke suite artifact + validator + runner اضافه کن.
2) publish-ready checklist برای launch day به artifact قراردادی تبدیل کن.
3) docs/roadmap.md, docs/deployment-roadmap.md, CHANGELOG.md را بعد از هر گام sync کن.
4) در پایان pnpm ci:quick و تست‌های e2e مرتبط را اجرا کن، commit/push کن و snapshot جدید بساز.
```
