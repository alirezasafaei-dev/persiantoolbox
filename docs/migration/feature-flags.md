# v3 Feature Flags

Use environment-driven flags to make v3 rollout reversible.

## Flags

- `FEATURE_V3_NAV=0|1`: switch primary navigation to v3 layout.
- `FEATURE_V3_REDIRECTS=0|1`: enable redirect map enforcement.
- `FEATURE_V3_ANALYTICS_POLICY=0|1`: enforce stricter ingest policies by default.

## Rules

- Default all flags to `0` in production until staging validation passes.
- Enable one flag at a time and observe error budget impact.
- Rollback strategy: set flag back to `0` and redeploy.
