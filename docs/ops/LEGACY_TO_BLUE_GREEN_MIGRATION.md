# Legacy VPS to Canonical Blue-Green Migration

This runbook applies only to the first migration from the July 2026 legacy production topology.

## Known source state

```text
Active process: persiantoolbox-green
Active port: 3003
Legacy release root: /home/ubuntu/persiantoolbox-releases
Known current release SHA: cc4e6968dfcd8dc4b8fa930e701e192b9d83df1f
Canonical base: /home/ubuntu/persiantoolbox-blue-green
Shared static store: /home/ubuntu/persiantoolbox-shared-assets
```

The source release reports `commit=null` and uses the obsolete HTML cache policy. Those two defects are permitted only during the current-release bootstrap. Candidate and post-switch verification remain strict.

## Preconditions

Run from a clean `main` checkout after all exact-SHA CI checks pass.

```bash
set -Eeuo pipefail
set +x
umask 077

git fetch --prune origin
git switch main
git pull --ff-only origin main

test -z "$(git status --porcelain)"
RELEASE_SHA="$(git rev-parse HEAD)"
test "$RELEASE_SHA" = "$(git rev-parse origin/main)"
```

The VPS must provide:

```text
node
pnpm
pm2
rsync
curl
flock
nginx
sudo
/etc/nginx/.persiantoolbox-static-safe
```

Do not print, copy into chat, or commit production environment values.

## First migration

```bash
PRODUCTION_DEPLOY_SHA="$RELEASE_SHA" \
PRODUCTION_CURRENT_SHA=cc4e6968dfcd8dc4b8fa930e701e192b9d83df1f \
DEPLOY_BASE_DIR=/home/ubuntu/persiantoolbox-blue-green \
LEGACY_RELEASES_DIR=/home/ubuntu/persiantoolbox-releases \
STATIC_STORE=/home/ubuntu/persiantoolbox-shared-assets \
ALLOW_LEGACY_CACHE_BOOTSTRAP=true \
ALLOW_RECOVERY_DEPLOY=false \
RUN_MIGRATIONS=false \
  bash deploy-blue-green.sh
```

`ALLOW_LEGACY_CACHE_BOOTSTRAP=true` relaxes only the cache-header assertion for the current legacy release. It does not relax:

- current exact commit after identity backfill;
- current referenced asset checks;
- candidate health and readiness;
- candidate exact SHA;
- candidate CSS, JavaScript and font checks;
- public cache headers after switching;
- both-slot availability;
- final independent production audit.

## Mandatory acceptance

```bash
BASE=/home/ubuntu/persiantoolbox-blue-green
STATE="$BASE/shared/deploy/production-current.env"

test -f "$STATE"
set -a
source "$STATE"
set +a

bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" \
  "http://127.0.0.1:$ACTIVE_PORT" "$RELEASE_SHA"

bash "$RELEASE_DIR/scripts/deploy/verify-release-assets.sh" \
  "https://persiantoolbox.ir" "$RELEASE_SHA"

bash "$RELEASE_DIR/scripts/deploy/assert-production-safety.sh" \
  "$RELEASE_SHA" \
  "https://persiantoolbox.ir" \
  "$BASE"
```

Required final marker:

```text
PRODUCTION_SAFETY_AUDIT=pass
```

Both `ACTIVE_PROCESS` and `PREVIOUS_PROCESS` must be online with positive PIDs. The public commit must equal the exact 40-character release SHA.

## Rollback drill

After the new release remains stable for at least five minutes:

```bash
bash /home/ubuntu/persiantoolbox-blue-green/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /home/ubuntu/persiantoolbox-blue-green \
  --base-url https://persiantoolbox.ir
```

Verify the rollback release and all referenced assets. Then redeploy the same final SHA with normal strict settings:

```bash
PRODUCTION_DEPLOY_SHA="$RELEASE_SHA" \
DEPLOY_BASE_DIR=/home/ubuntu/persiantoolbox-blue-green \
LEGACY_RELEASES_DIR=/home/ubuntu/persiantoolbox-releases \
STATIC_STORE=/home/ubuntu/persiantoolbox-shared-assets \
ALLOW_LEGACY_CACHE_BOOTSTRAP=false \
ALLOW_RECOVERY_DEPLOY=false \
RUN_MIGRATIONS=false \
  bash deploy-blue-green.sh
```

Run the independent audit again. Deployment is incomplete until rollback and final redeployment both pass.

## Failure recovery

Before nginx switches, stop only the failed candidate process and leave the active process untouched.

After nginx switches, use the recorded rollback command. Never use `pm2 delete`, never build in the active release, and never remove files from the shared static store.

When the canonical deploy exits nonzero, preserve:

```text
/home/ubuntu/persiantoolbox-blue-green/shared/deploy/
/home/ubuntu/persiantoolbox-blue-green/releases/production/
/home/ubuntu/persiantoolbox-releases/
/home/ubuntu/persiantoolbox-shared-assets/
```

Do not report success from a hard reload, a single sampled asset, `commit=null`, a stopped previous slot, or a skipped rollback drill.
