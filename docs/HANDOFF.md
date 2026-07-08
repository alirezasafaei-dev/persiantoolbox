# PersianToolbox Handoff - 2026-07-07

## Current Repo State

- Branch: `main`
- Local status: deploy-script changes in progress
- Sync status: `main` synced with `origin/main`
- Latest local commits:
  - `104cd61c docs: record production release sync`
  - `161c512a docs: record staging deploy state`
  - `09d0c040 fix: harden staging deploy verification`
  - `46f633b5 feat: expand GSC diagnostics and sitemap auditing`
  - `08aaa65c fix: normalize GSC sitemap responses`

## Current Production / Staging State

- Production site: `https://persiantoolbox.ir`
- Staging site: `https://staging.persiantoolbox.ir`
- Production deploy approval: still required explicitly before any deploy
- Staging is currently verified on commit `09d0c040e85b`
- Staging health/version endpoints now expose commit, branch, and build timestamp correctly
- Production live version is currently `46f633b58783`
- Production was not promoted to the docs-only `161c512a20b7` commit
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

### Production Sync

- Attempted the release-based production deploy from the current `main` HEAD.
- The deploy build completed, but the runtime commit check failed because the live site was already serving the active `slot-blue` release.
- Reconciled the live symlinks so `persiantoolbox` and `persiantoolbox-current` now point to the live `slot-blue` release again.

### Deploy Automation Hardening

- Hardened `deploy-vps-auto.sh` to detect when the live `persiantoolbox` PM2 process is actually running from `persiantoolbox-slot-blue` or `persiantoolbox-slot-green`.
- Legacy production deploy now updates the active runtime slot symlink before restart and includes that slot in automatic rollback, which closes the earlier commit-mismatch path.
- Hardened `deploy-blue-green.sh` slot detection to read the real active port from nginx and the active slot from PM2 instead of assuming `persiantoolbox-current` is slot-backed.
- Updated `deploy-blue-green.sh` nginx migration step to patch both `/etc/nginx/sites-enabled/projects` and `/etc/nginx/sites-available/projects` when converting direct `127.0.0.1:3000` proxying to `persiantoolbox_backend`.
- Updated `health-monitor.sh` to detect direct nginx proxying as a fallback when the upstream config file is absent.
- Added a safer default in `deploy-blue-green.sh` so an empty SSH detection result now falls back to `slot=blue` and `port=3000` instead of inferring an incorrect active port.
- Restored env-driven SSH configuration in the deploy entrypoints:
  - `deploy-blue-green.sh`
  - `deploy-vps-auto.sh`
  - `deploy-staging.sh`
  - `scripts/automation/automation/ssh_client.py`
- Deploy scripts now honor `SSH_PORT` first, then `VPS_PORT`, then legacy `.env` `PORT`, and fail fast with a short SSH reachability preflight before running expensive QA.

### Production Deploy Attempt

- Ran `bash deploy-blue-green.sh` from `main` at commit `c9c982c6`.
- Local QA passed.
- Public production remained healthy on commit `46f633b58783`.
- The deploy stopped before any nginx/runtime switch because the first operational SSH step to `193.93.169.32:22` returned `Connection refused`.

## Verification Completed

- `bash -n deploy-staging.sh`
- `bash -n deploy-vps-auto.sh`
- `bash -n deploy-blue-green.sh`
- `bash -n health-monitor.sh`
- `curl -s https://persiantoolbox.ir/api/health`
- `curl -s https://persiantoolbox.ir/api/version`
- `pnpm pwa:shell:check`
- `pnpm pwa:sw:validate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm vitest --run`
- `bash deploy-staging.sh`

Result: local QA passed, staging deploy passed, public staging health/version/pages/assets verification passed.

## Current Blocker / Risk

- Live VPS still has operational drift: public nginx is direct-to-3000 today while blue-green expects upstream switching.
- The code-side automation gap is now narrowed, but the next production blue-green cutover should still be done deliberately and verified live.
- SSH access to the current configured deploy target is currently unreachable from this environment. The scripts now support `SSH_PORT` / `VPS_PORT` / legacy `PORT`, but remote connectivity still has to be restored before any deploy can run.
- Docs-only commits should not be treated as mandatory runtime promotions.

## Immediate Next Steps

1. Reconcile production nginx + PM2 topology with the documented blue-green deploy model.
2. Restore SSH reachability from the deploy environment to the correct configured `SSH_PORT` on `193.93.169.32`.
3. Decide whether the next production release should use:
   - reconciled `deploy-blue-green.sh`, or
   - the release-based legacy path with explicit approval
4. Run the next approved production deploy only after explicit approval and full live verification.
5. After production path is clarified, continue the next approved roadmap item from `docs/roadmap.md`.

## Useful References

- `docs/roadmap.md`
- `docs/ops/deploy-and-risk-log.md`
- `deploy-staging.sh`
- `deploy-blue-green.sh`
- `deploy-vps-auto.sh`
