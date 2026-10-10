# Image generation: deployment and rollback

This feature is disabled unless `IMAGE_GENERATION_ENABLED=true`. It uses a dedicated
database, a queue worker, a separate browser container and an egress proxy. It
does not use the chat worker or Cloudflare.
The public UI does not require a FlatAI account, but this integration relies on
FlatAI's normal browser form, not an official API. Availability and response time
are therefore outside our control. No proxy rotation, account sharing, forged
origins, CAPTCHA solving, or automatic resubmission is implemented.

## Provision before enabling

1. Use a dedicated PostgreSQL database, not production chat/user tables. Apply
   `services/image-generation/schema.sql` as a migration administrator.
2. Use separate non-superuser web and worker database roles. Both need SELECT,
   INSERT, UPDATE and DELETE on the three `image_generation_*` tables; neither
   needs CREATE, access to other databases, or production application tables.
   Restrict connections to the web and worker hosts. Use TLS verification for a
   remote database. The administrator must revoke public CREATE on its schema.
3. Generate one random 32-byte Base64 `IMAGE_GENERATION_KEY` in a protected secret
   store. Web and worker need the same key. Never print or commit it. Changing it
   invalidates guest sessions and stored ciphertext. Use the guarded operator
   procedure below; changing environment variables alone leaves the persistent
   worker fingerprint mismatched. Do not rotate during active work.
4. Supply `IMAGE_GENERATION_DATABASE_URL`, `IMAGE_GENERATION_KEY`,
   `IMAGE_GENERATION_PUBLIC_ORIGIN` (exact HTTPS origin, without trailing slash)
   and `IMAGE_GENERATION_ENABLED` to Next.js. Supply the database URL and key to
   the worker using a Linux-owned environment file with mode 0600 outside the
   release directory. The worker also needs `IMAGE_BROWSER_URL` set exactly to
   `http://image-browser:8080` and a separate random 32-byte Base64
   `IMAGE_BROWSER_AUTH_TOKEN`. A second protected browser environment file must
   contain only that RPC token; never give it queue database credentials or the
   encryption key. Do not put secrets in Docker build arguments or images.
5. Ensure nginx **overwrites** `X-Real-IP` with the validated client address.
   Block public access to the Next.js backend port. For a trusted upstream CDN,
   validate its real-IP chain at nginx; never trust arbitrary client headers.
6. Build all three services on Linux from the pinned lockfile. Docker and browser
   download access are prerequisites. Provision a dedicated PostgreSQL Docker
   network and supply its name as `IMAGE_DATABASE_NETWORK`; the queue worker
   joins this existing network, while the browser and egress proxy do not.
   This Compose file does not provision PostgreSQL or connect to a host database.
   Supply the three required Compose settings through protected operator
   configuration. Install the mandatory host guard described below before
   starting containers, then start from `services/image-generation` using:

   ```sh
   export IMAGE_WORKER_ENV_FILE=/protected/path/image-worker.env
   export IMAGE_BROWSER_ENV_FILE=/protected/path/image-browser.env
   export IMAGE_DATABASE_NETWORK=dedicated-image-database
   docker compose config --quiet
   docker compose build
   sudo /usr/local/libexec/pt-image-host-guard.sh check
   systemctl is-active --quiet pt-image-host-watch.timer
   docker compose up -d
   ```

   Keep the non-root user, Chromium sandbox, seccomp profile, dropped capabilities,
   read-only filesystem and resource bounds. Do not add `--no-sandbox` to get a
   failed smoke test to pass. The seccomp profile is copied from the official
   Playwright v1.64.0 repository; its license is preserved next to the profile.
   Its namespace allow rule also permits `chroot`, which Chromium's namespace
   sandbox requires when host capabilities are all dropped. Host capabilities
   remain zero; sandboxing and seccomp must remain enabled.

7. With the public flag still disabled, verify worker health, database migration,
   Linux sandbox launch and one normal FlatAI generation in a controlled test
   environment. Local WSL container isolation has passed; the intended public
   host and successful Linux generation remain release gates. The browser is attached only to internal networks;
   its external DNS forwarding is disabled. Verify Docker embedded service DNS
   still resolves `image-egress` and `image-browser`, while external DNS/direct
   Internet access fails. Verify the browser cannot reach PostgreSQL, host
   gateway services, loopback services or metadata endpoints. The host firewall
   guard is mandatory: Docker internal bridges still allow host gateway access.
   Internal bridge configuration alone is not proof that
   host services are unreachable. Confirm HTTPS CONNECT through the proxy works
   only for the two allowed FlatAI hosts and rejects private/mixed DNS answers.
   Keep external CDN/telemetry domains denied unless individually justified and
   reviewed. Do not enable while these checks are unresolved.
8. Run repository typecheck, lint, unit tests, build, licensing and security checks
   for the exact candidate. Obtain the explicit deploy approval required by
   `AGENTS.md`, deploy through the existing release process, and run its complete
   mandatory health/page/CSS/font sequence. Then enable this feature for a limited
   trial and test a Persian prompt, refresh during generation, display and download.

## Load and privacy

- One running generation, at most three pending jobs, one active job per guest.
- Three requests per IP and guest per hour; ten globally per hour and twenty per
  day. Quotas are shared in PostgreSQL, so restarting the server does not reset them.
- The queue worker and browser each have a 768 MB limit and one CPU; the proxy
  adds a 128 MB limit and a quarter CPU. These are per-container ceilings, not
  measured resident memory. The Next.js database pool is
  bounded to three connections, the worker to two. Check actual Linux memory use
  before choosing larger quotas; the present limits are a small trial, not a
  high-volume service or a capacity guarantee.
- Prompts are erased when a job completes/fails/cancels, or become inaccessible within thirty
  minutes. Ready images expire thirty minutes after completion. Database cleanup
  runs while the worker is alive; if it is stopped, reads still reject expired
  rows, but physical cleanup resumes on worker restart. Database backups/WAL may
  retain encrypted rows longer; use a dedicated short-retention backup policy.
- IP addresses and session tokens are not saved as plaintext in this queue.
  Keyed quota hashes become eligible for cleanup within two days; the HttpOnly guest cookie lasts one
  day. Provider retention is governed by FlatAI, not our thirty-minute expiry.
- Logs contain only job IDs, safe failure codes and timings, not prompts, images,
  connection strings, session tokens or encryption keys. Browser child processes
  receive a minimal environment without the queue credentials.

## Failure and operator recovery

Worker heartbeat expires after twenty seconds; new admissions fail closed. A
worker restart marks uncertain running jobs failed and never repeats the provider
submission. Cancellation stops our wait; FlatAI may finish its already submitted
generation, which we do not publish. There is no automatic retry of GPU work.

CAPTCHA, a signup requirement, provider quota, or three consecutive failures open
a persistent circuit. First disable public admissions and inspect the cause
without logging prompts or credentials. Resume only when the normal form is
available and use is permitted. Clear `image_generation_control.blocked_code`
through the protected operator database session after inspection; a restart alone
does not clear it. Do not solve or bypass CAPTCHA automatically.

The provider's published terms permit commercial use of output, but do not
explicitly document a developer API or permission for this multi-user browser
integration. Confirming such use with the provider is recommended before a public
rollout. This is an integration risk assessment, not a claimed explicit ban or
proof of authorization.

## Planned encryption-key rotation

1. Disable public admissions through the approved web release/configuration
   process. Let current jobs finish and retained jobs expire, with the old-key
   worker still running so it can physically delete expired rows. Verify the
   dedicated jobs table is empty. This procedure does not destroy retained jobs.
2. Stop the queue worker gracefully. Inspect and resolve any existing provider
   circuit through the normal recovery process; rotation must not bypass it.
3. Using the protected operator database session, execute
   `services/image-generation/prepare-key-rotation.sql` with stop-on-error
   enabled. The transaction takes the admission and worker advisory locks,
   refuses any retained job or active provider circuit, and resets only the
   empty queue control and old-key quota hashes. A timeout or refusal means stop
   and correct the cause; do not edit the script to bypass its guards.
4. Generate a new random 32-byte Base64 key in the secret store and update both
   web and worker configuration while admissions remain disabled. Restart the
   worker and confirm its heartbeat/fingerprint, then reload web configuration
   through the approved release process. Old guest cookies are invalidated.
   The separate browser RPC token is unaffected.
5. Run a controlled acceptance check before reopening admissions. For an actual
   credential incident, follow the incident procedure; this planned rotation
   requires retaining existing data until expiry and is not an emergency purge.

## Rollback

Set `IMAGE_GENERATION_ENABLED=false` and restart/reload the web application through
the existing approved release process. The API returns `disabled` and the category
link disappears. Stop the isolated worker gracefully. Keep the additive tables
until any retained data has expired; rollback does not require deleting tables or
changing chat services. Follow the site's existing rollback process if the whole
candidate release is reverted.

## Validation scope

Windows acceptance proves the Next.js API, durable queue, a separate local browser worker,
Persian prompt handling, result rendering and download. PostgreSQL integration
tests cover concurrency, quota enforcement, ownership, cancellation, circuit
breaks and no resubmission after restart. These do not prove hosted deployment,
Linux sandbox operation, unrestricted provider availability or sustained throughput.
The local real provider tests include a 40-second successful Persian generation
and a later request that timed out after approximately 550 seconds. No fixed
response-time or availability guarantee is justified.
All three pinned images built in local WSL using the environment's configured,
credential-free proxy for official registry/package downloads. Nine actual Linux
runtime checks passed: non-root/no database secrets, zero capabilities/seccomp,
read-only files, internal DNS/proxy access, denied external DNS, database TCP,
host gateway TCP and direct public TLS, plus sandboxed Chromium loading the
normal provider form through the allowlisted proxy. The guard lifecycle test
removed only its own INPUT jump and verified the real systemd timer stopped
the labelled browser and disabled restart; explicit restoration recovered it.
These are local Linux witnesses, not intended-host or reboot proof.
Two queue-to-provider Linux requests failed after submission. A separate English
normal-form diagnostic received provider HTTP 403 with a JSON failure response;
there was no POST network failure and no image. No protection bypass or automatic
resubmission was used. Public enablement remains NO-GO pending provider access
resolution and successful acceptance on the intended host.

On 2026-10-10, one additional bounded normal-form Linux diagnostic identified the
provider's own JSON error code as `signup_required` on HTTP 403 (the full response
body and prompt were not retained). The rebuilt isolated browser implementation
was then tested end-to-end against the same ordinary form; `generateWithBrowser`
returned `signup_required`, with `failureReason=signup_required` at the `waiting`
stage. The response is now classified via a first-party POST error parser that
accepts JSON bodies only up to 8 KiB and forwards a fixed safe code through authenticated
RPC. The queue worker already opens its provider circuit on that code to prevent
submitting further queued requests. This is an **access gate**, not a successful
image generation. Contact the provider to confirm permitted unattended browser
use and resolve the registration requirement; do not bypass the gate. The feature
must remain disabled for public users.

Run `pnpm test` inside `services/image-generation` for disposable PostgreSQL,
browser-form fixtures, authenticated RPC and egress-proxy tests. The database
test accepts only the named loopback database `pt_image_test` on port 55439 and
uses `TEST_IMAGE_DATABASE_URL`; never substitute a production database. The
added GitHub workflow ran successfully for draft PR #229 on 2026-10-10; repeat on subsequent code changes.

## Mandatory host firewall lifecycle

Use a dedicated Linux image Docker host with systemd, iptables and ip6tables.
The two internal bridges have fixed interface names `ptimg-control` and
`ptimg-egress`; run only one instance of this Compose stack per host. Install
the reviewed repository files as root (no secrets are in these files):

```sh
sudo install -d -m 755 /usr/local/libexec /etc/systemd/system/docker.service.d
sudo install -m 755 host-egress-guard.sh /usr/local/libexec/pt-image-host-guard.sh
sudo install -m 755 host-egress-watch.sh /usr/local/libexec/pt-image-host-watch.sh
sudo install -m 644 pt-image-host-guard.service pt-image-host-watch.service pt-image-host-watch.timer /etc/systemd/system/
sudo install -m 644 pt-image-docker-guard.conf /etc/systemd/system/docker.service.d/pt-image-guard.conf
sudo systemd-analyze verify /etc/systemd/system/pt-image-host-guard.service /etc/systemd/system/pt-image-host-watch.service /etc/systemd/system/pt-image-host-watch.timer
sudo systemctl daemon-reload
sudo systemctl enable --now pt-image-host-guard.service pt-image-host-watch.timer
sudo /usr/local/libexec/pt-image-host-guard.sh check
```

The guard applies after supported firewall startup units and before Docker.
Docker's pre-start check rejects an absent guard even if a prior oneshot still
appears active. The watcher checks every two seconds and, on guard loss, stops
only containers labelled `pt.image-generation.role=provider-browser` and disables
their restart policy. It logs no prompts or credentials. The check is reactive;
it does not guarantee zero exposure during an unexpected privileged firewall
change. Before a planned firewall reload, disable admissions, finish/cancel jobs,
stop the browser, reload firewall rules, explicitly reapply/check the guard,
verify the timer, then recreate the browser. Never keep the browser running
through a planned reload. Docker live-restore is unsupported for this setup.

Do not flush host firewall tables. Unexpected rules in the dedicated guard chain
cause refusal; inspect them before recovery. Restore with the guard's `apply`,
verify `check`, then explicitly recreate the browser after resolving the cause.
Verify timer failures through host monitoring (`systemctl --failed` and journal).
Test an actual reboot and the host's firewall reload procedure before public use.

For repeatable runtime smoke checks, run `linux-smoke.mjs` inside the browser
container through `docker compose exec -T ... node --input-type=module`, piping
the file via stdin. Supply operator-derived `IMAGE_SMOKE_DATABASE_IP`,
`IMAGE_SMOKE_HOST_GATEWAY` and `IMAGE_SMOKE_PROVIDER_IP` as exec environment
variables. A controlled listener on the dedicated host gateway port 45555 must
return HTTP 204 from the host before the negative browser test; otherwise a
denied-connect result is not proof of isolation. Use only the test database and
public provider IP, stop the listener afterwards, and never publish the browser
or database ports. This smoke test loads the public form without generating an
image. Successful queue-to-image acceptance remains a separate gate.
