# Image generation review fixes

1. Isolate the provider browser in its own container on internal-only Docker
   networks. The queue worker alone accesses PostgreSQL. Authenticated bounded
   RPC connects worker to browser. A separate HTTPS CONNECT proxy pins DNS to a
   verified public IP and permits only explicitly allowed provider destinations;
   it rejects private, loopback, link-local and reserved destinations. The browser
   container has no Internet/default route; only the proxy has public egress.
   Keep sandbox, non-root users and resource bounds. Linux tests remain required.
2. Make privacy text accurately describe logical expiry, asynchronous physical
   cleanup and backup/provider retention. Avoid an unsupported deletion guarantee.
3. Add repeatable disposable PostgreSQL CI tests and deterministic fixtures for
   provider gate/optimizer/download behavior. Never point tests at production.
4. Run targeted and repository validation, then independent review again. Keep
   public enablement off while hosted generation and Linux isolation are unproven.

Ledger: the initial independent review found three important issues. The network
architecture, privacy wording and automated test gate have been implemented.
Local service tests pass: PostgreSQL 10, browser fixtures 5, authenticated RPC 6,
egress proxy 8 (29 total). Repository verification includes 1708 passing unit
tests, typecheck, lint, production build, licensing, local-first, documentation
links and staged secret scanning. The production dependency audit has no high
or critical findings; five low/moderate findings remain. Independent re-review
found an additional operational key-rotation defect. A guarded operator-only
reset script and regression tests resolved it. Final independent review found
no remaining Critical or Important defects and supports a signed local commit
with the feature default-off. This code review is not deployment approval.
At the initial code-review checkpoint, no deployment or push had occurred; see the continuation below.

Public release remains NO-GO until Linux container build, Chromium sandbox,
internal DNS, denied direct/private/host egress, database connectivity and a
controlled normal-form generation from the intended host pass. The latest real
provider request timed out after 550 seconds following an earlier 40-second
success. No reliability or fixed latency guarantee is supported.

Local Linux verification subsequently built all three pinned images using the
environment's configured, credential-free proxy for official downloads. Docker
29.1.3 and Compose 2.40.3 run in local WSL; secrets remain outside Git in protected
Linux files. Real runtime tests exposed two defects: Docker internal bridges
still permitted the host gateway, and the Chromium namespace sandbox needed
`chroot` in the namespace seccomp rule with all host capabilities dropped.
The dedicated IPv4/IPv6 host guard and narrow seccomp adjustment fixed them.
All nine Linux runtime witnesses now pass, including sandboxed Chromium and
normal provider-form access. The maintained `linux-smoke.mjs` repeats these tests
without a GPU request. Service regression tests now total 31, including fixed
provider failure reasons that never retain arbitrary provider metadata.

Independent review then identified firewall lifecycle enforcement as Important.
The guard is ordered after host firewall startup, a Docker pre-start check refuses
a missing guard, and a two-second systemd watcher stops labelled browser
containers and disables restart if enforcement disappears. A controlled removal
of the owned INPUT jump verified emergency stop and explicit recovery. This is
reactive enforcement, with a detection window; planned firewall reloads require
stopping the browser first. Actual intended-host reboot/reload verification
remains required.

Two actual Linux queue-to-provider requests failed shortly after submission.
An English normal-form diagnostic isolated provider HTTP 403 with a JSON failure
response, no POST network failure and no image. The exact provider rejection
reason is unavailable; do not assume its cause or bypass it. Earlier Windows
success does not establish current Linux reliability. Public enablement remains
NO-GO until provider access is resolved and intended-host acceptance succeeds.
This earlier Linux checkpoint preceded the GitHub draft PR. No public deployment or
production secret/configuration change occurred.

## Continuation — 2026-10-10 (draft PR #229)

The implementation, including isolated Playwright, was ported without merging
unrelated Git histories onto current `main` and pushed as
[`dac82d2e`](https://github.com/alirezasafaei-dev/persiantoolbox/commit/dac82d2e8a0819f73942b5834f84dfef9aba60b3).
The draft [PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229)
remains unmerged and the public enablement flag remains off.

On the ported branch 1855/1855 Vitest tests (249 files), TypeScript, lint,
production build, local-first, licensing, documentation links, secret scanning,
and 10/10 disposable PostgreSQL tests passed. GitHub-hosted image worker CI and
CodeQL passed. Core CI failed in E2E tests that also had failures on the latest
`main` CI; Lighthouse failed a single `/tools` performance sample
(0.69 versus required 0.75) while its prior `main` run passed. Neither result
has been established as an image-generation regression.

A fresh ordinary Windows Edge browser run opened the form (HTTP 200) and sent
two first-party POSTs (HTTP 200), but no generated image appeared in 100 seconds;
several background requests ended `ERR_ABORTED`. A single controlled Linux
browser generation, using the rebuilt isolated Compose stack in one WSL session,
reproduced an application-level FlatAI POST HTTP 403: JSON `success:false` with
`message` and `code` fields. `contentBlocked` and `limitReached` were false,
and no POST transport errors were reported. The accompanying first-party POST
returned HTTP 200. This does not identify why FlatAI refused the generation.
No proxy rewrite, CAPTCHA bypass, fingerprint spoofing, or automatic resubmission
was used.

Browser response diagnostics now retain only fixed `http_403`, `http_429`,
or `http_5xx` codes from first-party provider POSTs, without retaining
response bodies, cookies, request URLs, headers, or prompts. This improves
triage; **it is not a repair of FlatAI's HTTP 403**.

**Release remains NO-GO.** The provider must establish a usable, permitted
server-side browser workflow or explain/resolve its access denial. A successful
actual generated image and download on the intended isolated Linux host, plus
host reboot/firewall lifecycle tests and independent review, remain mandatory.
No production enablement or deployment has been performed.
