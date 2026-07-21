# Production Deployment Safety Contract

This document is the source of truth for PersianToolbox production deployments.

## Incident root cause

The July 21, 2026 deployment incident had two coupled failure modes:

1. Production traffic could be switched before every page and referenced asset had passed verification.
2. The nginx static alias followed `/home/ubuntu/persiantoolbox`, while rollback changed only the upstream port. After rollback, the old application returned old HTML but nginx served the new release's static directory. Hashed CSS and JavaScript URLs then returned 404, producing an unstyled or non-hydrated page.

The previous release could also be deleted before the final verification script completed, and some post-switch failures exited without restoring traffic.

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

## Static asset invariant

nginx must serve `/_next/static/` from the shared immutable store:

```text
/home/ubuntu/persiantoolbox-shared-assets
```

The store is additive. A deployment copies the new release's hashed assets without `--delete`, so both the active and rollback releases remain renderable. The application upstream and static asset path are therefore no longer coupled to one mutable release symlink.

Production deployment is blocked unless this marker exists:

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

For the one-time transition from the July 2026 degraded health contract, use the narrowly scoped bootstrap flag:

```bash
ALLOW_DEGRADED_CURRENT=true \
SITE_URL=https://persiantoolbox.ir \
  bash scripts/deploy/provision-static-asset-store.sh
```

This flag skips only the current release's health assertion. Commit, HTML, CSS, JavaScript and font checks remain mandatory.

## Traffic-switch invariant

Before nginx may switch to a candidate release, all of these must pass on the inactive port:

- `/api/health` returns `status=ok`
- `/api/version` contains the exact 40-character release SHA
- `/`, `/blog`, `/pricing`, `/tools` and `/salary` return non-empty HTML
- every CSS and JavaScript file referenced by those pages returns HTTP 200
- asset response bodies are non-empty
- CSS and JavaScript content types are valid
- critical Vazirmatn fonts return HTTP 200
- generated `.next/static` and copied standalone static manifests match exactly
- candidate static files exist in the shared store with the expected sizes

After switching traffic, the same public verification runs twice with a stabilization delay.

## Rollback invariant

Before switching, the deployer records:

- current upstream configuration
- active slot and port
- current release and commit
- previous PM2 process

The state file is:

```text
/var/www/persian-tools/shared/deploy/production-current.env
```

Any error or signal after the candidate starts triggers cleanup. Any failure after the traffic switch restores the previous nginx upstream, reloads nginx, purges stale HTML cache and verifies the previous public release.

The previous PM2 slot remains running after a successful deployment. It is not deleted during deployment or post-deploy verification.

Manual rollback must use:

```bash
bash /var/www/persian-tools/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /var/www/persian-tools \
  --base-url https://persiantoolbox.ir
```

## Recovery mode

`ALLOW_RECOVERY_DEPLOY=true` is permitted only when the currently active release is reachable and its commit/assets pass, but its old health contract is degraded. It does not relax candidate or post-switch checks.

The GitHub production workflow exposes this as `allow_recovery_deploy`, default `false`. After the first safe transition, every later deployment must use `false`.

## Redis readiness

Redis is a best-effort cache in this application. It becomes a required readiness dependency only when:

```text
REDIS_REQUIRED=true
```

Without that flag, missing or unavailable Redis produces a warning and uses the existing no-cache fallback. PostgreSQL and an enabled payment gateway remain mandatory production dependencies.

## Exact release identity

Every deployment requires an immutable 40-character Git SHA. Manual deployment requires:

```bash
PRODUCTION_DEPLOY_SHA="$(git rev-parse HEAD)" \
  bash deploy-blue-green.sh
```

A dirty working tree, an unconfirmed SHA or a non-main branch blocks production by default.

## Forbidden operations

The following are prohibited during production deployment:

- `pm2 delete` of the active production process before final verification
- in-place build or restart of the active release
- switching nginx before candidate asset verification
- serving `/_next/static` from a mutable release symlink
- deleting shared static assets during deployment
- deleting the previous release or slot before the release is accepted
- treating public verification as advisory
- deploying with a dirty working tree
- bypassing the exact SHA confirmation
- enabling recovery mode for normal releases

## Required deployment sequence

1. Confirm current public commit, health and all referenced assets.
2. Acquire the production lock.
3. Build an immutable release directory.
4. Copy the complete static tree into standalone and compare manifests.
5. Start the candidate on the inactive port.
6. Verify candidate health, commit, pages and every referenced asset.
7. Add candidate assets to the shared immutable store.
8. Snapshot nginx upstream configuration.
9. Validate and atomically reload nginx toward the candidate.
10. Verify the public release twice.
11. Persist active and rollback state.
12. Keep the previous slot running.
13. Generate the strict post-deploy report.
14. Automatically roll back on any later workflow failure.

## Test enforcement

`tests/unit/deployment-safety.test.ts` prevents removal of these contracts. It validates shell syntax, canonical routing, retirement of legacy deployers, static-store use, candidate/public verification, explicit recovery, rollback retention, exact release identity and optional Redis semantics.
