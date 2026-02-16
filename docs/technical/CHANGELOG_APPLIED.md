# Changelog Applied

Date: 2026-02-16

## Phase Status
- Phase 0 (Baseline): Done
- Phase 1 (UX Inputs): Done
- Phase 2 (Performance Quick Wins): Done (WOFF2 migration = documented TODO)
- Phase 3 (SEO Polish): Done
- Phase 4 (Correctness + Golden Tests): Done
- Phase 7 (Pro SW Policy): Done

## Applied Changes by Area

### Technical docs import + report
- Added `docs/technical/*` from provided archive.
- Added root docs link in `README.md`.
- Added compatibility/risk report: `docs/technical/APPLICATION_REPORT.md`.

### Baseline / Local-First policy
- Added tool tier model/resolution in `lib/tools-registry.ts`.
- Added tier badge UI in `components/ui/ToolTierBadge.tsx` and wired in `app/(tools)/layout.tsx`.
- Added indexing guard tests:
  - `tests/unit/tool-tier-contract.test.ts`
  - `tests/unit/tools-registry-indexing.test.ts`

### UX Inputs + Date validity
- Added shared standardized inputs:
  - `shared/ui/NumericInput.tsx`
  - `shared/ui/MoneyInput.tsx`
- Migrated key Loan/Salary numeric fields:
  - `components/features/loan/LoanPage.tsx`
  - `components/features/salary/SalaryPage.tsx`
- Added dynamic day clamping for valid dates:
  - `components/features/date-tools/DateToolsPage.tsx`
- Added manual smoke steps:
  - `docs/technical/smoke-tests.md`

### Performance
- Reduced non-essential motion in dense loan/salary form headers.
- Tuned Lighthouse performance warn threshold from `0.80` to `0.82`:
  - `lighthouserc.json`
- Added operational WOFF2 migration TODO:
  - `docs/technical/PERFORMANCE_TODO.md`

### SEO
- Added static OG fallback PNG (1200x630):
  - `public/og-default.png`
- Switched metadata default OG image to PNG:
  - `lib/seo.ts`
- Added canonicalization redirect aliases:
  - `next.config.mjs`
- Updated redirect tests:
  - `tests/unit/next-config-redirects.test.ts`

### Correctness + DataHub scaffolding
- Added golden test scaffold and vectors:
  - `tests/golden/golden-runner.test.ts`
  - `tests/golden/vectors/loan.json`
  - `tests/golden/vectors/interest.json`
- Added versioned salary laws data source:
  - `data/salary-laws/v1.json`
- Switched salary law resolver to data-driven JSON:
  - `features/salary/salary.laws.ts`
- Added internal contract endpoint:
  - `app/api/data/salary-laws/route.ts`
- Added salary freshness/stale/disabled status messaging:
  - `components/features/salary/SalaryPage.tsx`

### Pro policy (network-only)
- Added placeholder Pro page:
  - `app/pro/page.tsx`
- Applied SW network-only rule for `/pro/*`:
  - `public/sw.js`
- Added SW policy test:
  - `tests/unit/sw-pro-policy.test.ts`

### ADR
- Added decision record:
  - `docs/technical/adr/ADR-0001-tool-tier-and-pro-network-policy.md`

## Validation Commands
- `pnpm lint`
- `pnpm typecheck`
- `pnpm gate:local-first`
- `pnpm vitest --run tests/unit/tool-tier-contract.test.ts tests/unit/tools-registry-indexing.test.ts`
- `pnpm vitest --run tests/unit/date-tools.test.ts tests/unit/finance.test.ts tests/unit/high-traffic-tools-async-state.test.tsx`
- `pnpm vitest --run tests/unit/next-config-redirects.test.ts tests/unit/seo.test.ts`
- `pnpm vitest --run tests/golden/golden-runner.test.ts tests/unit/salary-laws-contract.test.ts tests/unit/sw-pro-policy.test.ts tests/unit/sw-cache-version.test.ts`

## Offline Verification (Manual)
1. `pnpm build && pnpm start:prod`
2. Visit `/loan`, `/salary`, `/date-tools`, `/offline` once online.
3. Switch browser to offline mode and reload those routes.
4. Verify `/pro` fails closed (network required) and is not served from cache.

## Remaining Work
- WOFF2 asset generation and rollout is tracked in `docs/technical/PERFORMANCE_TODO.md`.
