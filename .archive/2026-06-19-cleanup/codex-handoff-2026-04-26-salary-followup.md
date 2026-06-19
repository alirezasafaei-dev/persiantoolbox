# Codex Handoff - 2026-04-26 Salary Follow-up

## Done in this pass

- Refreshed salary laws for Iran year 1405 in `data/salary-laws/v1.json`.
- Replaced flat salary tax with progressive tax brackets in `features/salary/index.ts`.
- Corrected 1405 worker benefits in the salary engine:
  - minimum wage
  - housing allowance
  - food allowance
  - child allowance
  - marriage allowance
  - seniority allowance
- Replaced percentage-based experience growth with fixed seniority eligibility after one year.
- Updated the salary page to show `1405` in the UI and split minimum-wage breakdown rows.
- Added/updated unit coverage for tax brackets, seniority, and salary-laws data.
- Added a Playwright salary E2E scenario in `tests/e2e/tools.spec.ts`.

## Validated

- `pnpm -s vitest --run features/salary/salary.logic.test.ts tests/unit/salary-laws-contract.test.ts tests/unit/salary-laws-cache-route.test.ts tests/unit/high-traffic-tools-async-state.test.tsx`
- `pnpm -s typecheck`

## Blocked validation

- `pnpm -s playwright test tests/e2e/tools.spec.ts --project=chromium --grep "salary" --reporter=list`
- Blocker: local Playwright browser download failed with repeated `ECONNRESET` while running `pnpm exec playwright install chromium`.

## Recommended next production steps

1. Finish Playwright setup locally and rerun salary E2E:
   - `pnpm exec playwright install chromium`
   - `pnpm -s playwright test tests/e2e/tools.spec.ts --project=chromium --grep "salary" --reporter=list`
2. Review all remaining production-closeout items in:
   - `docs/ROADMAP_REAL.md`
   - `docs/ROADMAP_EXECUTION.md`
   - `docs/release/v3-readiness-dashboard.md`
3. Continue the next hardening slice:
   - remove remaining CSP-sensitive inline styles in dynamic UI fragments
   - expand finance-tool regression coverage
   - close remaining release checklist deltas

## Suggested new-chat prompt

```
نقطه شروع:
- docs/codex-handoff-2026-04-26.md
- docs/codex-merge-summary-2026-04-26.md
- docs/codex-handoff-2026-04-26-salary-followup.md
- docs/ROADMAP_REAL.md
- docs/ROADMAP_EXECUTION.md
- docs/release/v3-readiness-dashboard.md

ادامه بده.
اول وضعیت roadmap و readiness را sync کن،
بعد blocker های production باقی مانده را به ترتیب اثر و ریسک ببند،
و اگر Playwright browser نصب نبود اول آن را fix کن و سپس E2E های salary/security را دوباره اجرا کن.
کم توضیح بده، خودکار ادامه بده، و snapshot/handoff را هم به‌روز کن.
```
