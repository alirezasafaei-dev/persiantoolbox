# Feature Availability Framework

Status: Active (2026-02-17)

## Purpose

Provide a single source of truth for feature enablement/disablement across pages and APIs, preventing dead links and inconsistent 404/410 behavior while keeping the Local-First contract intact.

## How it works

- Registry: `lib/features/availability.ts` defines `FeatureId`, env keys (`FEATURE_<ID>_ENABLED`), default state, messages, and optional paths.
- Page wiring: routes import `featurePageMetadata` + `isFeatureEnabled`; when disabled they render `FeatureDisabledPage` with clear messaging and safe navigation.
- API wiring: handlers call `disabledApiResponse(featureId)` to return a uniform JSON payload `{ ok:false, status:'disabled', feature, envKey, message }` with status 410.
- Safe links: `getFeatureHref(id)` returns a live path when enabled; otherwise falls back to `/support` (if enabled) or `/` to avoid dead internal links.

## Current coverage (disabled by default)

- Monetization: support, ads, plans, subscription, checkout, subscription-roadmap, account, dashboard
- Account/history: auth, history, history-share
- Admin: admin-site-settings, admin-monetization
- Platform: developers

## Enabling locally

Set env var to `1`/`true` (e.g., `FEATURE_PLANS_ENABLED=1`) before `next dev`/`next start`.

## Contracts & tests

- UI metadata honors noindex when disabled via `featurePageMetadata`.
- API payload consistency validated in `tests/unit/disabled-api-contract.test.ts`.
- Feature registry and env overrides validated in `tests/unit/feature-availability.test.ts`.
- Subscription webhook contract updated in `tests/unit/subscription-webhook.test.ts`.

## Operational notes

- Keep new feature surfaces registered here first, then wire routes/APIs using the helpers.
- Update `TASKS.md` P0/NP lists when feature work completes to keep deploy gate green.
