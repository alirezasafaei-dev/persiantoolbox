# Chat Snapshot - Deploy Success + Local DNS Gap

Date (UTC): 2026-02-12

## What Was Verified

1. Public DNS via external resolvers is healthy:
   - `@1.1.1.1`: `persiantoolbox.ir`, `www.persiantoolbox.ir`, `staging.persiantoolbox.ir` -> `185.3.124.93`
   - `@8.8.8.8`: same healthy result.
2. HTTPS origin responds with valid security headers and HTTP 200 for root pages.
3. Strict post-deploy report was generated and passed for production:
   - Command:
     - `node scripts/deploy/generate-post-deploy-report.mjs --base-url=https://persiantoolbox.ir --environment=production --git-ref=d9e1f1b --deployer=codex --strict=true --retry-count=4 --retry-delay-ms=1500`
   - Output:
     - smoke status: `passed`
     - header status: `passed`
   - Report file:
     - `docs/deployment/reports/post-deploy-2026-02-12T00-54-16-916Z.md`

## Remaining Non-Deployment Issue

- On this local workstation, the stub resolver (`127.0.0.53` via router DNS `192.168.100.1`) intermittently returns `NXDOMAIN` for `persiantoolbox.ir` and `staging.persiantoolbox.ir`.
- This creates false negatives in some local checks and is not an origin deploy failure.

## Recommended Next Step

- Keep production as-is (rollout is healthy).
- For local diagnostics, temporarily switch client DNS to `1.1.1.1` and `8.8.8.8` or test with explicit resolver flags / `--resolve`.
