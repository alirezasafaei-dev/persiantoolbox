# Production incident report — 2026-10-09

## Summary

PersianToolbox production was reported unavailable while Nginx routed traffic to the Green release `production-manual-20261007T201120Z-57729e23342c` (`57729e23342c2090e744ab62d4ae53c138a8e2bd`). Earlier observations showed repeated Green and public endpoint timeouts while the retained Blue release remained healthy.

Fresh incident-command checks began at `2026-10-09T10:05:42Z`. At that time Green had already restarted or otherwise recovered: its PM2 PID differed from the earlier observation, its uptime was approximately 39 minutes, and its local and public health endpoints passed every bounded check. Because the active release was healthy and stable throughout the verification window, the documented rollback decision gate required no production mutation.

**Decision:** `ROLLBACK_DECISION=NOT_REQUIRED_ALREADY_HEALTHY`

## UTC timeline

- Before `09:25:47Z`: Nginx recorded a concentrated wave of upstream timeouts against `127.0.0.1:3004`; 58 of the last 100 error-log lines were upstream timeouts.
- Approximately `09:26Z`: the current Green process start time inferred from its health-reported uptime. This is evidence of a restart/recovery, not proof of its trigger.
- `10:05:42Z`: fresh read-only diagnosis started on `asdev-vps`.
- `10:05:43Z`–`10:05:45Z`: Green and Blue each passed 3/3 local health checks; public health and version each passed 2/2 checks.
- `10:06:20Z`–`10:07:18Z`: three bounded observation rounds passed for both slots, public health/version, homepage, blog, tools, and pricing. No new Nginx upstream timeout appeared and Green's PID/restart count stayed unchanged.
- After `10:07Z`: an independent Windows-host check passed 3/3 requests for health, homepage, blog, tools, pricing, one referenced CSS asset, and one referenced JavaScript asset.

## Read-only diagnosis

- Host: `asdev-vps`; Nginx active and `nginx -t` successful.
- Root filesystem: 48 GiB total, 38 GiB used, 9.7 GiB available (80%).
- Memory: 7.8 GiB total, 4.4 GiB available; swap 2.0 GiB total with about 1.5 GiB used.
- Nginx upstream: `127.0.0.1:3004` (Green).
- Canonical current release and Green slot resolved to `production-manual-20261007T201120Z-57729e23342c`.
- Blue slot resolved to retained release `production-manual-20261004T141747Z-d8bda3fe9483`.
- Canonical state recorded Green/3004 as active and Blue/3000 as previous.
- The production lock was free. No PersianToolbox deploy, rollback, rsync, install, or build process was active. Unrelated long-lived package-install processes for another application were present and left untouched.
- Protected production configuration and the shared static-assets directory were accessible; contents were not displayed.
- PostgreSQL was active and `pg_isready` reported accepting connections.

## Slot health evidence

### Green (active)

- Release SHA: `57729e23342c2090e744ab62d4ae53c138a8e2bd`
- PM2: `persiantoolbox-green`, online, PID `3274953`, restart count `97`.
- Working directory: the expected Green release standalone directory.
- Initial local `/api/health`: 3/3 HTTP 200, `status=ok`, `ready=true`, 0.043–0.085 seconds.
- Observation window local `/api/health`: 3/3 HTTP 200, 0.065–0.116 seconds.

### Blue (retained rollback target)

- Release SHA: `d8bda3fe948309e8aa7853ba8a8ed5e069b1372f`
- PM2: `persiantoolbox-blue`, online, PID `3208276`, restart count `177`.
- Working directory: the expected Blue release standalone directory.
- Initial local `/api/health`: 3/3 HTTP 200, `status=ok`, `ready=true`, 0.045–0.143 seconds.
- Observation window local `/api/health`: 3/3 HTTP 200, 0.052–0.086 seconds.

## Rollback mechanism and safety gate

The source-of-truth safety contract defines this canonical manual rollback:

```bash
bash /home/ubuntu/persiantoolbox-blue-green/current/production/ops/deploy/rollback.sh \
  --env production \
  --base-dir /home/ubuntu/persiantoolbox-blue-green \
  --base-url https://persiantoolbox.ir
```

The mechanism reads the recorded previous slot, validates and verifies it, snapshots the upstream, tests and reloads Nginx, verifies the public release, then atomically updates the current link and release state. The standard production lock is `/home/ubuntu/persiantoolbox-blue-green/shared/deploy/production.lock` and would have been acquired around this command.

The command was **not executed** because the fresh Green and public checks were healthy and stable. No deployment, migration, database write, release deletion, Cloudflare change, or AI feature change occurred.

## Public and asset verification

- `/api/health`: HTTP 200 with `status=ok` and `ready=true` in all VPS and external checks.
- `/api/version`: HTTP 200 and active SHA `57729e23342c2090e744ab62d4ae53c138a8e2bd` in all checks.
- `/`, `/blog`, `/tools`, `/pricing`: HTTP 200 in all three VPS rounds and all three external checks.
- Referenced CSS `/_next/static/chunks/3lkf2-8txw5qz.css`: one VPS-side DNS-resolution timeout, then 3/3 external HTTP 200 responses with `text/css` and consistent 196,283-byte size.
- Referenced JavaScript `/_next/static/chunks/3cz9x6lcbatww.js`: HTTP 200 with JavaScript MIME type; 3/3 external checks returned a consistent 32,353-byte size.
- Both Green and Blue release directories remained intact. The shared static-assets directory remained accessible.
- Nginx upstream remained `127.0.0.1:3004`; configuration validation continued to pass.
- No new upstream timeout appeared during the bounded observation window.

## Initial root-cause hypothesis

The failure was localized to the active Green application process or its ability to respond, rather than Nginx or PostgreSQL: Nginx remained active and valid, PostgreSQL accepted connections, Blue stayed responsive, and error logs specifically recorded response-header timeouts from Green. Green's changed PID and approximately 39-minute uptime at diagnosis indicate that a restart or recovery occurred before incident-command checks began.

The trigger for Green's earlier non-responsiveness is **unproven**. Elevated restart counts, application memory around 708 MiB, substantial swap use, and the prior timeout wave justify investigation, but do not by themselves prove an out-of-memory event, event-loop stall, abusive request pattern, or application defect.

## Follow-up before the next deployment

1. Correlate PM2 Green stdout/stderr, system journal, kernel OOM logs, and Nginx request/error logs around `09:20Z`–`09:27Z`.
2. Determine what initiated PID `3274953` and whether the health monitor, PM2 memory policy, an administrator, or automation performed the restart.
3. Investigate Green restart count `97` and Blue restart count `177`; establish a baseline and alert on deltas rather than cumulative totals.
4. Review memory, swap pressure, and slow-request/event-loop telemetry for the affected SHA.
5. Rehearse the canonical locked rollback path in a non-incident window without changing the excluded AI rollout.

## Final incident state

- Production SHA before/after: `57729e23342c2090e744ab62d4ae53c138a8e2bd` / unchanged.
- Active slot before/after: Green / Green.
- Nginx upstream before/after: `127.0.0.1:3004` / unchanged.
- Rollback executed: no.
- Deployment performed: no.
- Database migration performed: no.
- AI feature enabled: no.
- Final status: `ALREADY_HEALTHY_NO_ACTION`.
