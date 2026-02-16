# Application Report: Applying `docs/technical` to `asdev-persiantoolbox`

Date: 2026-02-16
Scope: Corrective/development track only (no full payment/subscription implementation)

## 1) Current-State Assessment

### Local-First
- Status: Partial-Good.
- Evidence:
  - Local-first gate exists and scans runtime sources: `scripts/quality/verify-local-first.ts`.
  - SW skips non-same-origin runtime requests: `public/sw.js`.
  - PDF worker uses same-origin font fetch: `features/pdf-tools/workers/pdf-worker.ts`.
- Gap:
  - Tool tier model (Offline/Hybrid/Online-Required) is not explicit in registry and UI.

### PWA / Service Worker
- Status: Partial.
- Evidence:
  - Shell/runtime caching implemented: `public/sw.js`.
  - Offline route exists: `app/offline/page.tsx`.
- Gap:
  - No explicit Network-Only policy for `/pro/*`.
  - No explicit cache-bypass rule for Online-Required paths.

### UI/UX Inputs
- Status: Partial.
- Evidence:
  - Existing numeric parsing supports Persian/Arabic digits: `shared/utils/numbers/number.ts`.
- Gap:
  - Loan and Salary still rely on free-form text inputs without standardized numeric/money wrappers and consistent field-level ARIA error linkage: `components/features/loan/LoanPage.tsx`, `components/features/salary/SalaryPage.tsx`.

### SEO
- Status: Good with minor gaps.
- Evidence:
  - Metadata/canonical and OG contracts exist: `lib/seo.ts`, `app/layout.tsx`.
  - Sitemap is derived from indexable registry entries: `app/sitemap.ts`.
  - Some coming-soon routes already marked noindex: `app/(tools)/pdf-tools/convert/pdf-to-text/page.tsx`, `app/(tools)/pdf-tools/convert/word-to-pdf/page.tsx`.
- Gap:
  - Need a clear URL normalization decision and redirects for consistency expansion.

### Performance
- Status: Partial.
- Evidence:
  - Lighthouse thresholds configured: `lighthouserc.json`.
  - PDF heavy libs are currently isolated to PDF feature/worker area.
- Gap:
  - Input-heavy pages still include extra motion behaviors; needs trimming for interaction latency.
  - Font pipeline still based on TTF preload; WOFF2 migration is not completed yet.

### Tools Correctness
- Status: Partial-Good.
- Evidence:
  - Unit tests exist for loan/interest/salary logic.
- Gap:
  - No dedicated golden test scaffolding for Loan/Interest scenario vectors.
  - Salary laws are local constants, not versioned internal DataHub contract yet.

## 2) Compatibility Risks and Mismatches

1. Missing tool-tier policy wiring.
- Risk: Cannot enforce consistent Local-First behavior at UX/SW layers.
- Paths: `lib/tools-registry.ts`, `public/sw.js`, tool page layouts.

2. `/pro` caching policy not explicitly guarded.
- Risk: future online-required flows could be cached unexpectedly.
- Paths: `public/sw.js`.

3. Input consistency debt in Loan/Salary forms.
- Risk: parsing ambiguity, inconsistent accessibility, higher input error rate.
- Paths: `components/features/loan/LoanPage.tsx`, `components/features/salary/SalaryPage.tsx`.

4. Date invalid-selection prevention is incomplete in UI.
- Risk: users can pick invalid day/month combinations before validation.
- Paths: `components/features/date-tools/DateToolsPage.tsx`.

5. Salary data contract is not API-based/versioned.
- Risk: law updates are harder to audit and expose as stale/updated metadata.
- Paths: `features/salary/salary.laws.ts`.

6. Lighthouse target progression must avoid CI break.
- Risk: strict threshold jumps can fail current CI unexpectedly.
- Paths: `lighthouserc.json`.

## 3) Key Decisions (Proposed)

1. Tool Tier Strategy
- Add `tier` to tool registry entries (`Offline-Guaranteed | Hybrid | Online-Required`).
- Default all current calculation tools to `Offline-Guaranteed` unless explicitly known otherwise.
- Mark `/pro` and future pro routes as `Online-Required`.

2. SW Policy
- Keep shell cache for offline-guaranteed routes.
- Enforce Network-Only for `/pro/*` immediately.
- Keep same-origin constraint unchanged.

3. UX Input Standardization
- Introduce shared `NumericInput` and `MoneyInput` wrappers over current `Input`.
- Normalize Persian/Arabic digits and separators on change.
- Ensure `aria-invalid` + `aria-describedby` per field.

4. Salary DataHub Scaffolding
- Add internal endpoint `/api/data/salary-laws` that serves versioned local JSON.
- Add UI freshness/stale message on Salary page.
- No external data source integration in this track.

5. SEO URL Policy
- Keep canonical source from `buildMetadata`.
- Add minimal permanent redirects for duplicated/legacy routes only.

## 4) Staged Execution Map (No Timeline)

### Phase 0: Baseline and anti-regression
- Add tool tiers in registry and expose tier badge in tools UI shell.
- Ensure coming-soon remains out of index/sitemap.
- Re-check local-first gate behavior.

DoD:
- Every tool has deterministic tier resolution.
- Tier badge visible on tools pages.
- Coming-soon routes are noindex and absent from sitemap sources.

### Phase 1: UX input improvements
- Add `NumericInput` and `MoneyInput` shared components.
- Migrate Loan and Salary key numeric/currency fields.
- Prevent invalid day selection in DateTools via dynamic max-day options.
- Add manual smoke steps in `docs/technical/smoke-tests.md`.

DoD:
- Loan/Salary primary numeric fields use standardized components.
- Date invalid-day selection blocked in UI.
- Smoke test doc exists and is actionable.

### Phase 2: Performance quick wins
- Reduce form-level framer-motion overhead in dense input sections.
- Keep PDF-heavy loading route-scoped and document any TODOs for further split.
- Move Lighthouse target slightly closer to docs goals without breaking CI.

DoD:
- Input forms avoid unnecessary motion on focus-heavy fields.
- Lighthouse config updated conservatively and still passable.

### Phase 3: SEO polish
- Add static OG PNG fallback and point metadata defaults to it.
- Add/extend permanent redirects for URL consistency.
- Keep canonical alignment intact.

DoD:
- Default OG points to PNG fallback.
- URL redirects compile and pass redirect tests.

### Phase 4: Correctness scaffolding
- Add `tests/golden` scaffold + simple runner for loan/interest vectors.
- Add salary laws versioned local JSON + internal API contract endpoint.
- Show last-updated + stale/disabled messaging in Salary UI.

DoD:
- Golden scaffold runs in test command.
- `/api/data/salary-laws` returns versioned payload from local file.
- Salary page exposes freshness and stale state in UI.

### Phase 5: Pro SW preparation
- Add `/pro` placeholder page (CTA + needs internet message; no billing).
- Enforce SW Network-Only for `/pro/*` and exclude from shell cache.

DoD:
- `/pro` route exists.
- SW logic always bypasses cache for `/pro/*`.

## 5) Rollout/Merge Plan (Commit Boundaries)

1. `docs(technical): import technical docs and add application report`
2. `feat(baseline): add tool tier policy, tier badge, and baseline local-first alignment`
3. `feat(ux): add numeric/money inputs, migrate loan/salary, and date validity guard`
4. `perf(ui): reduce heavy form motion and tune lighthouse thresholds conservatively`
5. `feat(seo): add default og png fallback and url consistency redirects`
6. `feat(correctness): golden test scaffold and salary datahub contract endpoint`
7. `feat(pwa): add /pro placeholder and network-only sw policy for pro routes`
8. `docs(technical): add smoke tests + applied changelog summary`

