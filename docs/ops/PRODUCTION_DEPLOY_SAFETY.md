# Production Deployment Safety Contract

This document is the source of truth for PersianToolbox production deployments.

## Incident root cause

The July 21, 2026 deployment incident had three coupled failure modes:

1. Production traffic could be switched before every page and referenced asset had passed verification.
2. The nginx static alias followed a mutable release path, so old HTML could be paired with missing hashed assets after a switch or rollback.
3. The live VPS topology remained under `/home/ubuntu/persiantoolbox-releases`, while the canonical deploy wrapper required a pre-existing `/var/www/persian-tools` hierarchy, protected env file and state file. The wrapper therefore could not perform the migration it was supposed to own.

A browser hard reload is not remediation. Application HTML must be non-cacheable across releases, immutable assets must be retained, and the deployer must reconcile the observed live topology before starting a candidate.

## Non-negotiable architecture

Production deploys must use only:

```bash
ops/deploy/deploy-production-blue-green.sh
```

Supported entrypoints delegate to that engine:

- `.github/workflows/deploy-production.yml`
- `deploy-blue-green.sh`
- `ops/deploy/deploy.sh --env production`

Legacy entrypoints are compatibility wrappers and must never contain independent production mutation logic.

The canonical manual deployment base is:

```text
/home/ubuntu/persiantoolbox-blue-green
```

It contains:

```text
current/production
releases/production/
shared/deploy/production-current.env
shared/env/production.env
slots/blue
slots/green
```

The historical releases under `/home/ubuntu/persiantoolbox-releases` remain read-only rollback and static-retention inputs during the first migration.

## One-time legacy topology bootstrap

`deploy-blue-green.sh` invokes:

```bash
scripts/deploy/bootstrap-production-layout.sh
```

The bootstrap must derive facts from the running server rather than assume them. It:

- resolves the active port from nginx or direct health probes;
- selects the online PM2 process whose environment matches that port;
- resolves the real PM2 working directory;
- verifies that the active release contains `ecosystem.config.js` and `.next/standalone/server.js`;
- copies the existing production env into the protected canonical env file without printing its contents;
- creates canonical current and slot symlinks;
- writes only non-secret topology metadata to `bootstrap-current.env`.

When the live runtime reports `commit=null`, the operator must provide the exact known current SHA:

```bash
PRODUCTION_CURRENT_SHA=<exact-40-character-current-sha>
```

The bootstrap then writes `.git-revision` and `.env.release`, restarts only the already-active PM2 process, and refuses to continue until `/api/version` exposes that exact SHA. It never invents or infers a short SHA.

A missing inactive process is not an incident. The inactive blue or green process is created from the candidate release by the canonical deploy engine. A missing active process is fatal.

## Static asset invariant

nginx must serve `/_next/static/` from the shared immutable store:

```text
/home/ubuntu/persiantoolbox-shared-assets
```

The store is additive. A deployment copies new hashed assets without `--delete`, so both active and rollback releases remain renderable. Production deployment is blocked unless this marker exists:

```text
/etc/nginx/.persiantoolbox-static-safe
```

Provision it once, while the current site is still serving traffic:

```bash
cd <checked-out-release>
chmod +x scripts/deploy/provision-static-asset-store.sh
SITE_URL=https://persiantoolbox.ir \
  bash scripts/deploy/provision-static-asset-store.sh
```

## Local smoke invariant

The project uses Next.js `output: standalone`. Local and pre-deploy smoke checks must execute:

```text
.next/standalone/server.js
```

They must first copy `.next/static` and `public` into the standalone tree and provide an exact immutable release SHA. `next start` is forbidden for this build mode.

## Traffic-switch invariant

Before nginx may switch to a candidate release, all of these must pass on the inactive port:

- `/api/health` returns `status=ok`;
- `/api/version` contains the exact 40-character release SHA;
- `/`, `/blog`, `/pricing`, `/tools` and `/salary` return non-empty HTML;
- every CSS and JavaScript file referenced by those pages returns HTTP 200;
- asset response bodies are non-empty;
- CSS and JavaScript content types are valid;
- critical Vazirmatn fonts return HTTP 200;
- generated `.next/static` and copied standalone static manifests match exactly;
- candidate static files exist in the shared store with the expected sizes.

After switching traffic, the same public verification runs twice with a stabilization delay.

## Rollback invariant

Before switching, the deployer records:

- current upstream configuration;
- active slot and port;
- current release and commit;
- previous PM2 process.

The state file is:

```text
/home/ubuntu/persiantoolbox-blue-green/shared/deploy/production-current.env
```

Any error or signal after the candidate starts triggers cleanup. Any failure after the traffic switch restores the previous nginx upstream, reloads nginx, purges stale HTML cache and verifies the previous public release.

The previous PM2 slot remains running after a successful deployment. It is not deleted during deployment or post-deploy verification.

Manual rollback must use:

```bash
bash /home/ubuntu/persiantoolbox-blue-green/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /home/ubuntu/persiantoolbox-blue-green \
  --base-url https://persiantoolbox.ir
```

## Recovery mode

`ALLOW_RECOVERY_DEPLOY=true` is permitted only when the currently active release is reachable and its commit/assets pass, but its old health contract is degraded. It does not relax candidate or post-switch checks.

The legacy topology bootstrap is separate from recovery mode. It repairs missing canonical state and immutable identity before the deploy engine runs. Normal deployment should keep:

```text
ALLOW_RECOVERY_DEPLOY=false
```

## Redis readiness

Redis is a best-effort cache. It becomes a required readiness dependency only when:

```text
REDIS_REQUIRED=true
```

Without that flag, missing Redis uses the no-cache fallback. PostgreSQL, payment-gateway readiness and immutable release identity remain mandatory production dependencies.

## Exact release identity

Every deployment requires an immutable 40-character Git SHA. Manual deployment requires:

```bash
PRODUCTION_DEPLOY_SHA="$(git rev-parse HEAD)" \
PRODUCTION_CURRENT_SHA=<exact-current-production-sha> \
ALLOW_RECOVERY_DEPLOY=false \
RUN_MIGRATIONS=false \
  bash deploy-blue-green.sh
```

`PRODUCTION_CURRENT_SHA` is required only while migrating a legacy runtime that reports `commit=null`. A dirty working tree, an unconfirmed release SHA or a non-main branch blocks production by default.

## Forbidden operations

The following are prohibited:

- `pm2 delete` of the active production process before final verification;
- in-place build or replacement of the active release;
- switching nginx before candidate asset verification;
- serving `/_next/static` from a mutable release symlink;
- deleting shared static assets during deployment;
- deleting the previous release or slot before acceptance;
- printing or committing production env contents;
- inventing release identity from a short directory prefix;
- treating a missing inactive slot as permission to stop the active slot;
- running `next start` against an `output: standalone` build;
- treating public verification as advisory;
- deploying with a dirty working tree;
- bypassing exact SHA confirmation;
- enabling recovery mode for normal releases.

## Required deployment sequence

1. Confirm current public health and exact known current SHA.
2. Acquire the production lock.
3. Bootstrap canonical state from nginx and PM2 when state is absent.
4. Backfill legacy runtime identity only from the explicitly supplied exact current SHA.
5. Run local CI, contracts, build and standalone smoke.
6. Build an immutable candidate release directory.
7. Copy the complete static tree into standalone and compare manifests.
8. Start the candidate on the inactive port.
9. Verify candidate health, commit, pages and every referenced asset.
10. Add candidate assets to the shared immutable store.
11. Snapshot nginx upstream configuration.
12. Validate and atomically reload nginx toward the candidate.
13. Verify the public release twice.
14. Persist active and rollback state.
15. Keep the previous slot running.
16. Run the independent strict production audit.
17. Automatically roll back on any post-switch failure.

## Test enforcement

`tests/unit/deployment-safety.test.ts` and `tests/unit/local-smoke-runtime.test.ts` enforce shell syntax, canonical routing, topology bootstrap, protected env migration, exact identity, standalone smoke assembly, static-store retention, candidate/public verification, rollback retention and optional Redis semantics.
