# Snapshot: VPS Deploy Progress While Domain Activation Is Pending

Date: 2026-02-11
Scope: `persian_tools` deployment hardening and VPS readiness while `persiantoolbox.ir` NS/DNS is still propagating.

## What Was Completed

1. Staging pipeline fixed and stabilized end-to-end.
2. Production pipeline executed successfully with controlled post-deploy behavior.
3. VPS now runs both services via PM2:
   - `persian-tools-staging` on `127.0.0.1:3001`
   - `persian-tools-production` on `127.0.0.1:3000`
4. Nginx config is active and valid.
5. `production.env` and `staging.env` are present on server with restrictive permissions.
6. Daily DB backup automation was added on VPS:
   - script: `/usr/local/bin/persian-tools-db-backup.sh`
   - cron: `0 2 * * *`
   - retention: 14 days

## Key Workflow Runs

1. Staging failed run investigated: `21900054065`
2. Staging stabilization successful run: `21900727669`
3. Latest staging validation successful run: `21901328347`
4. Production warm-up deploy successful run: `21901491267`

## Important Code/Workflow Changes

1. `ops/deploy/deploy.sh`
   - Recreate PM2 process deterministically to avoid stale release `cwd`.
   - Build on target VPS to avoid runtime module hash mismatch.
2. `ops/deploy/rollback.sh`
   - Deterministic PM2 process recreation for rollback reliability.
3. `.github/workflows/deploy-staging.yml`
   - Post-deploy report switched to non-blocking strict mode (`--strict=false`) for staging.
4. `.github/workflows/deploy-production.yml`
   - Added manual inputs:
     - `base_url`
     - `post_report_strict`
5. `docs/vps-deploy-runbook.md`
   - Updated to document DNS propagation phase workflow.

## Current External Blocker

Domain activation/propagation in DNS/CDN panel:

- `persiantoolbox.ir` status: waiting for activation (as reported by operator panel).
- Public resolution may take up to 24 hours after NS changes.

## Next Checkpoint

When DNS becomes active, continue with strict public-domain verification and strict production post-deploy report.
