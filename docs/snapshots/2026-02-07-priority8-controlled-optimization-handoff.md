# Snapshot — 2026-02-07 — Priority 8 Controlled Optimization Closure

## Summary

- Priority 8 completed with internal A/B optimization for local ad placement.
- UX and Revenue KPIs are now connected to the aggregated ad report.
- Privacy guardrails for variant tracking and consent actions are enforced and covered by tests.

## Implemented Changes

### 1) Internal A/B experiment (no external runtime dependency)

- `shared/monetization/adExperiment.ts`
  - added deterministic local experiment assignment via localStorage
  - per-slot experiment key support
- `shared/ui/AdSlot.tsx`
  - added `experiment` config with `control/challenger` creatives
  - active variant rendered with `data-ad-variant` marker
  - view/click tracking now variant-aware

### 2) KPI integration in aggregated report

- `shared/analytics/ads.ts`
  - ad events now support variant-aware tracking and consent actions
  - added report aggregation by variant (`byVariant`)
  - added KPI block:
    - revenue: `ctr`, `clicksPer100Views`, `topVariantId`
    - ux: `consentAccepts`, `consentDeclines`, `consentAcceptanceRate`
- `components/features/monetization/AdsTransparencyPage.tsx`
  - added KPI cards for acceptance rate, active variants, and top variant
- `components/features/monetization/MonetizationAdminPage.tsx`
  - added 30-day KPI summary in admin card

### 3) Privacy guardrails and assets

- `components/ads/AdsConsentBanner.tsx`
  - consent actions now logged as aggregated UX signals
- `public/ads/local-sponsor-banner-a.svg`
- `public/ads/local-sponsor-banner-b.svg`

### 4) Test coverage

- `tests/unit/ad-experiment.test.ts`
  - deterministic and isolated variant assignment checks
- `tests/unit/ad-analytics-privacy.test.ts`
  - consent action + variant sanitization + KPI aggregation checks
- `tests/e2e/consent-analytics.spec.ts`
  - deny flow blocks ad render
  - accept flow validates stable local variant across reload

### 5) Documentation sync

- `docs/roadmap.md`
- `docs/roadmap-board.html`
- `docs/monetization/task-plan.md`
- `docs/monetization/roadmap.md`
- `docs/monetization/strategy.md`
- `docs/monetization/analytics-guardrails.md`
- `CHANGELOG.md`

## Validation Executed

- `pnpm vitest --run tests/unit/ad-analytics-privacy.test.ts tests/unit/ad-experiment.test.ts`
- `PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/consent-analytics.spec.ts --project=chromium --workers=12 --reporter=list`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-07-priority8-controlled-optimization-handoff.md

Priority 9 را اجرا کن:
1) چرخه عملیاتی ماهانه/فصلی KPI و هزینه را به artifactهای قابل اعتبارسنجی تبدیل کن.
2) playbook های scale/hold/rollback را به چک‌لیست اجرایی متصل کن و guardrailهای تصمیم‌گیری را تست کن.
3) docs/roadmap.md و CHANGELOG.md را بعد از هر گام sync کن.
4) در پایان pnpm ci:quick و تست‌های e2e مرتبط را اجرا کن، commit/push کن و snapshot جدید بساز.
```
