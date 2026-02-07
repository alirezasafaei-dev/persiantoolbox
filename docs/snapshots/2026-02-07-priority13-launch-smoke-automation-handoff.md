# Snapshot — 2026-02-07 — Priority 13 Launch-Day Smoke Automation Closure

## Summary

- Priority 13 completed by adding a contract-driven launch-day checklist and executable smoke runner.
- Launch-day readiness is now validated before execution and report artifacts are stored for auditability.
- Smoke execution exposed a variant-stability race in ad A/B rendering; the issue was fixed and revalidated.

## Implemented Changes

### 1) Launch-day checklist contract

- `docs/launch-day-checklist.json`
  - launch readiness prerequisites
  - core and extended smoke suites
  - launch output expectations
- `scripts/release/validate-launch-day-checklist.mjs`

### 2) Launch smoke runner and reporting

- `scripts/release/run-launch-smoke.mjs`
  - executes core/extended smoke suites
  - writes `launch-smoke-*.json` reports to `docs/release/reports/`
- generated report artifacts:
  - `docs/release/reports/launch-smoke-2026-02-07T22-49-31-732Z.json`
  - `docs/release/reports/launch-smoke-2026-02-07T22-52-07-855Z.json`

### 3) Contract test coverage

- `tests/unit/launch-day-checklist-contract.test.ts`
- `tests/unit/launch-smoke-report-contract.test.ts`
- `tests/unit/release-rc-report-contract.test.ts` updated to scope only `rc-gates-*` reports

### 4) Stability fix discovered during smoke run

- `shared/ui/AdSlot.tsx`
  - variant assignment now initializes deterministically on first render
  - removes initial render race that could flip variant assertion after reload

### 5) Roadmap and board synchronization

- `docs/roadmap.md` (Priority 13 closed)
- `docs/deployment-roadmap.md` (launch-day gate priority added)
- `docs/roadmap-board.html`
- `docs/deployment-roadmap.html`
- `public/roadmap-board.html`
- `public/deployment-roadmap.html`
- `docs/index.md`
- `CHANGELOG.md`

## Validation Executed

- `pnpm release:launch:validate`
- `pnpm release:launch:run`
- `PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/consent-analytics.spec.ts --project=chromium --workers=12 --reporter=list`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-07-priority13-launch-smoke-automation-handoff.md

Priority 14 را اجرا کن:
1) contract-driven incident communication checklist برای launch/post-launch بساز (artifact + validator + unit contract test).
2) smoke failure triage summary runner اضافه کن که خلاصه actionable از آخرین reportهای release/deploy بدهد.
3) docs/roadmap.md, docs/deployment-roadmap.md, CHANGELOG.md و boardهای HTML را sync کن.
4) در پایان pnpm ci:quick را اجرا کن، commit/push کن و snapshot جدید بساز.
```
