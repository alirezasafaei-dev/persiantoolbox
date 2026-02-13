# v3 Feature Flags

Use environment-driven flags to make v3 rollout reversible.

## Flags

- `NEXT_PUBLIC_FEATURE_V3_NAV=0|1`: switch primary navigation to v3 layout.
  - Wired in: `components/ui/Navigation.tsx`
- `FEATURE_V3_REDIRECTS=0|1`: enable redirect map enforcement.
  - Wired in: `next.config.mjs`
- `FEATURE_V3_ANALYTICS_POLICY=0|1`: enforce stricter ingest policies by default.
  - Wired in: `app/api/analytics/route.ts`

## Rules

- Default all flags to `0` in production until staging validation passes.
- Enable one flag at a time and observe error budget impact.
- Rollback strategy: set flag back to `0` and redeploy.

## Related Contracts

- Redirect map source: `docs/migration/redirect-map.csv`
- Migration policy: `MIGRATION.md`
