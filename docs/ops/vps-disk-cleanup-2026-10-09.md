# Production VPS disk cleanup report — 2026-10-09

## Outcome

The production cleanup completed successfully on `asdev-vps` (`193.93.169.32`) between `2026-10-09T08:25:25Z` and `2026-10-09T08:32:58Z`. Eight unreferenced PersianToolbox releases were removed while the five newest releases, active release, rollback release, shared static assets, database backups, and all other projects were preserved.

No deployment, service restart, database migration, nginx change, PM2 change, backup deletion, or shared-asset deletion was performed. Production remained on commit `57729e23342c2090e744ab62d4ae53c138a8e2bd`; GitHub `main` was independently observed at `c7d96483d211df46da200dc3c3af69c1930fbc27` before this documentation branch was created.

## Disk result

| Metric                    |                                              Before |                                               After |
| ------------------------- | --------------------------------------------------: | --------------------------------------------------: |
| Root filesystem used      | 44,943,736,832 bytes (89%, 42 GiB shown by `df -h`) | 40,520,478,720 bytes (80%, 38 GiB shown by `df -h`) |
| Root filesystem available |      5,923,594,240 bytes (5.6 GiB shown by `df -h`) |     10,346,852,352 bytes (9.7 GiB shown by `df -h`) |
| Space reclaimed           |                                                   — |            4,423,258,112 bytes (4.42 GB / 4.12 GiB) |
| Inodes used               |                                     2,049,259 (32%) |                                     1,748,249 (28%) |
| Production releases       |                                                  13 |                                                   5 |

The apparent per-release sizes were larger than the physical space reclaimed because releases shared filesystem content/hard-linked storage. The report uses `df` deltas for the reclaimed-space result.

## Protected runtime topology

- Active release: `production-manual-20261007T201120Z-57729e23342c`
- Active slot/process/port: `green` / `persiantoolbox-green` / `3004`
- Active PM2 PID at verification: `3224351`
- Active process cwd: the active release's `.next/standalone` directory
- Rollback release: `production-manual-20261004T141747Z-d8bda3fe9483`
- Rollback slot/process/port: `blue` / `persiantoolbox-blue` / `3000`
- Rollback PM2 PID at verification: `3208276`
- Rollback process cwd: the rollback release's `.next/standalone` directory
- `current/production` and `slots/green` resolved to the active release.
- `slots/blue` resolved to the rollback release.
- Nginx upstream remained `127.0.0.1:3004`.

The state file was read using an allowlist of non-secret deployment fields. It remained mode `0600`, and its SHA and release paths did not change during cleanup.

## Deleted releases

Each directory was revalidated under the non-blocking shared deployment lock immediately before deletion. Every path was a real directory directly below the canonical production release root, was not a symlink or mountpoint, was outside the newest-five retention set, had no live process cwd/open-file reference, was absent from current/slot/state references, and passed static-asset retention checks.

1. `production-manual-20260921T014827Z-f3a88695274d`
2. `production-manual-20260918T215541Z-7b743046b9f3`
3. `production-manual-20260918T204625Z-077b1b3ff1c9`
4. `production-manual-20260918T203206Z-077b1b3ff1c9`
5. `production-manual-20260918T094023Z-03a1a1f40639`
6. `production-manual-20260809T075503Z-bb53003327e5`
7. `production-manual-20260809T065840Z-293c347be5e2`
8. `production-manual-20260807T232241Z-01f64af154bc`

Post-cleanup checks confirmed all eight paths absent.

## Retained releases

These are the five newest releases under the canonical production release root and were preserved:

1. `production-manual-20261007T201120Z-57729e23342c`
2. `production-manual-20261004T141747Z-d8bda3fe9483`
3. `production-manual-20261003T190636Z-6a8f35038e62`
4. `production-manual-20261003T181143Z-9ba83d4edcdf`
5. `production-manual-20260921T050008Z-7c9559c569e6`

## Static assets and rollback readiness

Seven deleted releases contained `.next/standalone/.next/static`; every source file already existed in `/home/ubuntu/persiantoolbox-shared-assets` with the expected size. One deleted release had no static directory. No additive synchronization was needed and nothing was removed from the shared store.

After cleanup, the active and rollback static manifests each reported zero missing and zero size-mismatched files. The shared store contained 2,159 files, including 9 CSS and 2,144 JavaScript files. A real CSS chunk and JavaScript chunk extracted from the live homepage both returned HTTP 200.

The rollback release remained online and healthy on port 3000 at commit `d8bda3fe948309e8aa7853ba8a8ed5e069b1372f`; its slot symlink and `ecosystem.config.js` remained valid. No rollback was executed.

## Service and data verification

- PM2: active and rollback PersianToolbox processes remained `online` with unchanged PIDs and correct release cwd paths.
- Nginx: service `active`; `nginx -t` successful; upstream unchanged.
- PostgreSQL: service `active`; `pg_isready` reported accepting connections; public health reported database `ok=true`.
- Public `/api/health`: HTTP 200, `status=ok`, `ready=true`, commit `57729e23342c2090e744ab62d4ae53c138a8e2bd`.
- Public `/api/version`: HTTP 200 with the same production commit before and after cleanup.
- Public `/`, `/blog`, `/tools`, and `/pricing`: HTTP 200 after cleanup.
- Shared deployment lock: available after cleanup.
- Concurrent backup/deploy/rollback processes: none detected at the pre-delete gates.

## Backups and exclusions

`/home/ubuntu/backups` remained untouched: 136 top-level files totaling 3.4 GiB, including 50 database-like backup files totaling 1,735,971 bytes. No PostgreSQL backup, environment backup, certificate, nginx configuration, log, cache, staging directory, shared directory, or other project path was deleted.

## Observed errors

- One post-cleanup `/tools` request from the VPS encountered a transient DNS resolution timeout. The bounded retry verification immediately passed for all required pages and assets. No service change or restart was performed.
- The PowerShell-to-SSH audit wrapper emitted a trailing carriage-return error after the remote cleanup and verification payloads had completed. Independent post-cleanup checks confirmed all eight deletions, the five retained releases, disk figures, and production health.

## Final status

`PASS`: cleanup completed within the authorized scope, production SHA was unchanged, rollback remained ready, shared assets and backups were preserved, and post-cleanup health verification passed.
