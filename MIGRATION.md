# Migration Guide: v2 -> v3

This guide defines the controlled migration from v2 to v3 with compatibility guarantees.

## Breaking Changes

- API contract hardening for analytics ingest:
  - v3 requires consent contract metadata.
  - production ingest requires `ANALYTICS_INGEST_SECRET` via `x-pt-analytics-secret`.
- URL and page IA updates are handled through explicit redirect rules.

## Compatibility Window

- v2 routes remain available during v3 alpha and beta.
- Redirects use permanent `301` once validated in staging.
- Deprecations are announced at least one minor release before removal.
- Redirect rules are enforced through `FEATURE_V3_REDIRECTS=1` (see `docs/migration/feature-flags.md`).

## Rollout Stages

1. `v3-alpha`: dual-run v2 + v3 routes with telemetry.
2. `v3-beta`: default v3 navigation, v2 via redirects.
3. `v3-ga`: finalize redirects and remove deprecated internals.

## Runtime Flags

- `NEXT_PUBLIC_FEATURE_V3_NAV=0|1`
- `FEATURE_V3_REDIRECTS=0|1`
- `FEATURE_V3_ANALYTICS_POLICY=0|1`

## Acceptance Gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm vitest --run`
- `pnpm build`
- `pnpm test:e2e:ci -- tests/e2e/consent-analytics.spec.ts`
- Lighthouse SEO and Accessibility stay >= 0.90.
