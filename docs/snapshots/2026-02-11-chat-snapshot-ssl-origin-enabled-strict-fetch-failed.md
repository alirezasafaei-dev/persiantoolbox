# Snapshot: SSL Origin Enabled + Strict Post-Deploy Still Failing From Runner

Date: 2026-02-11
Scope: `persian_tools` production domain activation, VPS TLS setup, and strict deploy verification

## What Was Completed

1. DNS and NS alignment

- Domain NS set to Arvan:
  - `o.ns.arvancdn.ir`
  - `g.ns.arvancdn.ir`
- DNS records set with Cloud OFF:
  - `A @ -> 185.3.124.93`
  - `A www -> 185.3.124.93`
  - `A staging -> 185.3.124.93`

2. VPS TLS setup completed

- Installed on VPS:
  - `certbot`
  - `python3-certbot-nginx`
- ACME challenge path configured and validated:
  - `/.well-known/acme-challenge/*`
- Issued unified Let's Encrypt certificate:
  - Cert name: `persiantoolbox-unified`
  - SAN: `persiantoolbox.ir`, `www.persiantoolbox.ir`, `staging.persiantoolbox.ir`

3. Nginx HTTPS configuration applied

- Port 80 redirects to HTTPS.
- Port 443 enabled for production and staging with the unified cert.
- `nginx -t` passed and service reloaded successfully.

4. Runtime health on VPS

- Production process is online in PM2.
- Active production symlink points to latest release.
- Local on-VPS HTTPS checks return `200` with expected security headers.

## Runs and Outcomes

- Strict run (failed):
  - `21922656486`
  - Failed at: `Generate production post-deploy report`
  - Rollback step failed due to old release missing `ecosystem.config.cjs`, but production stayed healthy.

- Strict retry run (failed):
  - `21923305218`
  - Failed at: `Generate production post-deploy report`
  - Rollback step succeeded.

## Current Blocking Symptom

In strict post-deploy artifact for run `21923305218`, all public smoke checks fail with:

- `fetch failed`
- `This operation was aborted`

Affected paths:

- `/`
- `/tools`
- `/loan`
- `/salary`
- `/date-tools`
- `/offline`
- `/admin/site-settings`

Header checks also fail in strict report due to same fetch failure context.

## Operational Interpretation

- Origin TLS on VPS is now correctly configured and valid.
- Remaining issue is public reachability/connection path from GitHub runner to `https://persiantoolbox.ir` during strict check window.
- This is no longer a certificate-issuance task.

## Resume Checklist (Tomorrow)

1. Re-validate external reachability from at least one non-VPS network:

- `https://persiantoolbox.ir`
- `https://www.persiantoolbox.ir`
- `https://staging.persiantoolbox.ir`

2. Keep Arvan Cloud OFF for all three A records during origin-only validation.

3. Trigger one non-blocking production deploy first:

- `post_report_strict=false`
- Confirm deployment pipeline remains green.

4. Then rerun strict production deploy:

- `post_report_strict=true`
- Base URL: `https://persiantoolbox.ir`

5. If strict still fails, capture:

- failing run artifact
- nginx access/error slices for the same timestamp window
- runner-side job logs for post-report step

## Key Links

- Failed strict run (retry):
  - https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21923305218
- Previous failed strict run:
  - https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21922656486
