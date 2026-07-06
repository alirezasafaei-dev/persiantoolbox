# PersianToolbox Handoff - 2026-07-06

## Current Repo State

- Branch: `main`
- Local status: clean working tree
- Ahead of `origin/main`: `2` commits
- Latest local commits:
  - `1db34322 fix: harden subscription contract and slot deploy ops`
  - `9a512889 fix: restore staging and tighten homepage funnel analytics`
- Push status: `git push origin main` still hangs from this environment and did not complete.

## Current Production / Staging State

- Production site: `https://persiantoolbox.ir`
- Staging site: `https://staging.persiantoolbox.ir`
- Latest deployed production commit: `ed82584db7dc` during the successful `v7.9.0` production deploy earlier in this session
- Production deploy method in use: `bash deploy-blue-green.sh`
- Staging status: restored and publicly verified
- Production health verification previously passed: `/api/health` OK, key pages HTTP 200, CSS/font/worker HTTP 200
- Staging health verification passed: `/api/health` OK, key pages HTTP 200, CSS/font/worker HTTP 200

## What Was Completed In This Session

### Deploy / Ops

- Successful production deploy completed earlier with blue-green flow.
- All open PRs were closed.
- All non-main branches were deleted locally and remotely; only `main` remains.
- `deploy-staging.sh` was fixed to use PM2 restart-or-start flow instead of destructive delete/start.
- Staging TLS/certificate issue for `staging.persiantoolbox.ir` was repaired and staging was brought back online.
- `deploy-blue-green.sh` was hardened so slot processes restart in place when present instead of delete/start churn.
- `ecosystem.config.js` now supports `PM2_PROCESS_NAME` so blue/green slots can run under predictable PM2 names.
- `health-monitor.sh` now detects the active nginx upstream port and targets the matching blue/green PM2 process instead of assuming legacy `persiantoolbox` on port `3000`.

### Product / Analytics

- Homepage role-path click tracking was added and tested.
- Admin analytics and funnel endpoints were wired to expose role-path breakdowns and funnel impact.
- Homepage payload was reduced by removing nested per-tool JSON-LD from the homepage category `ItemList`.
- Misleading testimonial content was replaced with honest usage-pattern copy.

### Monetization / Entitlements

- Subscription status normalization was tightened in `shared/hooks/useSubscriptionStatus.ts`.
- Legacy subscription payloads now count as premium only when one of these is true:
  - `subscription.active === true`
  - `usage.isPremium === true`
  - a known `planId/id` exists and `expiresAt` is still in the future
- Added regression coverage for expired legacy subscriptions in `tests/unit/subscription-status-contract.test.ts`.
- Product IDs for the newer professional export tools were reviewed and documented as aligned.

### Docs Updated

- `docs/roadmap.md`
- `docs/ops/deploy-and-risk-log.md`
- `docs/HANDOFF.md` (this file)

## Verification Completed

- Targeted tests:
  - `pnpm vitest --run tests/unit/subscription-status-contract.test.ts tests/unit/home-role-path-analytics.test.tsx tests/unit/analytics-store-security.test.ts tests/unit/admin-analytics-route.test.ts tests/unit/admin-funnel-route.test.ts`
- Script syntax:
  - `bash -n deploy-blue-green.sh`
  - `bash -n health-monitor.sh`
- Full QA:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`

All of the above passed in this session.

## Verified Findings / Root Cause Notes

- Historical staging restart spikes were caused by repeated `EADDRINUSE` on port `3001`.
- PM2 state on production had drifted between legacy process assumptions and blue/green slot reality.
- Static assets are currently not the active blocker in the deploy path; CSS/font/worker checks passed after the deploy/staging fixes.
- The remaining operational blocker is remote push hanging from this environment, not a repo QA failure.

## Immediate Next Steps

1. Retry `git push origin main` from a working network path/environment.
2. After push succeeds, run the next approved production deploy with:
   - `bash deploy-blue-green.sh`
3. Run the full mandatory production verification sequence after that deploy.
4. Confirm on VPS that the active PM2 process now uses slot-aware naming (`persiantoolbox-blue` or `persiantoolbox-green`) and that restart counts stay stable.

## Recommended Continuation Priorities

1. Push the two local commits to `origin/main`.
2. Apply the hardened blue-green script in the next production deploy.
3. Re-check PM2 restart counts/logs after the new deploy.
4. Continue the remaining roadmap work:
   - site-settings fallback for VPS Node 20
   - ad slot/default campaign seeding in production
   - lint warning reduction in focused admin/API batches
   - deeper homepage/public-page performance pass

## Useful Current References

- `docs/roadmap.md`
- `docs/ops/deploy-and-risk-log.md`
- `deploy-blue-green.sh`
- `deploy-staging.sh`
- `health-monitor.sh`
- `shared/hooks/useSubscriptionStatus.ts`
