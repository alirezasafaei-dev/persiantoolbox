# PersianToolbox Handoff - 2026-07-07

## Current Repo State

- Branch: `main`
- Local status: clean working tree
- Sync status: `main` synced with `origin/main`
- Latest local commits:
  - `09d0c040 fix: harden staging deploy verification`
  - `46f633b5 feat: expand GSC diagnostics and sitemap auditing`
  - `08aaa65c fix: normalize GSC sitemap responses`
  - `c3269cef fix: align SEO indexing hygiene and GSC property access`

## Current Production / Staging State

- Production site: `https://persiantoolbox.ir`
- Staging site: `https://staging.persiantoolbox.ir`
- Production deploy approval: still required explicitly before any deploy
- Staging is currently verified on commit `09d0c040e85b`
- Staging health/version endpoints now expose commit, branch, and build timestamp correctly
- Production was intentionally not redeployed in this session
- Important operational note:
  - repo docs describe blue-green as the preferred production path
  - live VPS nginx/PM2 topology is currently drifting from that model
  - next production deploy should reconcile server config first, or use the legacy release-based path with explicit approval and full live verification

## What Was Completed In This Session

### Search Console / SEO / Admin

- Added stronger Google Search Console diagnostics and sitemap normalization:
  - `feat: expand GSC diagnostics and sitemap auditing`
  - `fix: normalize GSC sitemap responses`
  - `fix: align SEO indexing hygiene and GSC property access`
- Confirmed the GSC property wiring is using `GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:persiantoolbox.ir`

### Staging Deployment

- Read and corrected the staging-first deployment path before touching production
- Hardened `deploy-staging.sh` to:
  - fail on dirty worktrees
  - run full QA before deploy
  - write `.env.release` metadata
  - verify the deployed commit through `/api/health` and `/api/version`
  - verify key pages and critical assets on the public staging domain
- Deployed staging successfully and verified it on commit `09d0c040e85b`

### Production Risk Clarification

- Investigated the live VPS and confirmed the current production nginx/PM2 layout does not fully match the documented blue-green assumptions.
- Deliberately avoided a production switch in this session until that topology is reconciled or an explicit legacy-path deploy is chosen.

## Verification Completed

- `bash -n deploy-staging.sh`
- `pnpm pwa:shell:check`
- `pnpm pwa:sw:validate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm vitest --run`
- `bash deploy-staging.sh`

Result: local QA passed, staging deploy passed, public staging health/version/pages/assets verification passed.

## Current Blocker / Risk

- Production deploy automation in docs assumes a blue-green nginx upstream topology that is not yet fully reflected on the live VPS.
- This is an operational drift issue, not a code-quality issue.

## Immediate Next Steps

1. Reconcile production nginx + PM2 topology with the documented blue-green deploy model.
2. Decide whether the next production release should use:
   - reconciled `deploy-blue-green.sh`, or
   - the release-based legacy path with explicit approval
3. After production path is clarified, continue the next approved roadmap item from `docs/roadmap.md`.

## Useful References

- `docs/roadmap.md`
- `docs/ops/deploy-and-risk-log.md`
- `deploy-staging.sh`
- `deploy-blue-green.sh`
- `deploy-vps-auto.sh`
