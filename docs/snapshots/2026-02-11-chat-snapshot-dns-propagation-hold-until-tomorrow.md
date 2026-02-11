# Snapshot: DNS Propagation Hold Until Tomorrow

Date: 2026-02-11
Scope: `persian_tools` go-live decision checkpoint

## Operator Decision (Final for Today)

1. Current infrastructure settings are considered correct.
2. VPS and application runtime are healthy.
3. `A` record target is configured as expected.
4. Remaining blocker is DNS propagation behavior (especially `.ir` resolution path).
5. `strict` production verification is paused for now to avoid repeated expected failures.

## Actions Taken

1. Production strict attempt was re-run (`21913126935`) and failed at post-deploy strict checks.
2. Automatic rollback completed and service stayed on the previous healthy production release.
3. DNS probes against public and suggested ISP resolvers were captured and remained unresolved at check time.
4. Team decision recorded: wait and retry strict verification tomorrow.

## Next Planned Step (Tomorrow)

1. Recheck DNS resolution for:
   - `persiantoolbox.ir`
   - `www.persiantoolbox.ir`
   - `staging.persiantoolbox.ir`
2. If resolvable and HTTPS path is healthy, run `deploy-production` with:
   - `base_url=https://persiantoolbox.ir`
   - `post_report_strict=true`
