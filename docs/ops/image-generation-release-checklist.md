# Image generation release packet

Prepared on 2026-10-13. Public admissions remain disabled. This is a reviewable
two-stage release procedure, not permission to merge, deploy or enable the tool.
Cloudflare remains chat-only; the image adapter uses the ordinary FlatAI form.

## Evidence and remaining gates

| Gate                           | Evidence / status                                                                                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source quality                 | All 17 checks passed on the earlier `7a835ccd` candidate; rerun on the final PR head after the preparation fix and main integration                                                                                                                                   |
| Real image journey             | Actual Persian prompt, queue, isolated browser, UI display and decoded JPEG download; reload recovered the same job/image; one measured generation took 438 seconds                                                                                                   |
| Intended image host            | **PASS**: strict browser isolation, cold boot, automatic stack/TLS startup and restored unrelated-service policies. **UNPROVEN**: continuous IPv4/IPv6 denial and service-DNS/proxy reachability across UFW reload and Docker restart; additional acceptance required |
| Queue TLS and credentials      | Seven real TLS/least-privilege/negative-access probes and three idle-pool probes passed; protected secrets are outside source control                                                                                                                                 |
| Certificate operation          | Actual leaf renewal and forced-failure rollback verified the exact live peer; temporary private material removed; owner-operated renewal, not automatic renewal/notification                                                                                          |
| Production-mode ingress        | Optimized Next.js API/component fixture ran as the application user behind a private loopback HTTPS nginx; disabled API and seven enabled security probes passed without provider submissions                                                                         |
| Deployment environment         | Shell-safe quoted image settings round-tripped through the corrected PM2 parser; release overrides, literal text and inspector removal tested; protected full-env candidate remains disabled                                                                          |
| Reverse-proxy candidate        | Exact image API no-cache location syntax-tested, preserving existing API limits/timeouts and client-IP overwrite; active routing untouched                                                                                                                            |
| Provider public use / capacity | **UNPROVEN**. Successful bounded tests do not establish permitted unattended multi-user use or sustainable public throughput                                                                                                                                          |
| Owner release approval         | **PENDING** for merge, deployment and public enablement                                                                                                                                                                                                               |
| Public-domain live acceptance  | **NOT RUN**. Private production-mode HTTPS proof does not replace acceptance through the live public routing/CDN                                                                                                                                                      |

The earlier host and frontend evidence is recorded in
[the intended-host follow-up](../ai/execution/FLATAI-FOLLOWUP-20261012.md).
Final exact-head checks and protected operator evidence belong to the delivery
report. The fixture used unchanged API/component source; it is not a full
production-site visual acceptance or an additional provider capacity sample.

## Stage 1: approved deployment with the image flag off

1. Resolve the provider gate for the intended public usage and retain the evidence.
   Do not contact the provider while the owner's no-contact instruction applies.
   Do not infer a volume entitlement from commercial output rights, free access
   or the word Unlimited. Do not increase quotas or rotate identities to obtain
   availability.
2. Review the exact final PR head, its independent review and CI results. Obtain
   the owner's separate merge/deployment approval. After merge, verify that the
   deployed commit contains the approved code and use the immutable deployment
   SHA required by `deploy-blue-green.sh`.
3. Use the protected operator configuration candidate. **Preserve all existing
   production settings** and append only the reviewed image settings; never
   replace the application's full environment with an image-only file. Require
   `IMAGE_GENERATION_ENABLED=false`, the canonical HTTPS origin, the dedicated
   web role, verified queue TLS and the already-matched encryption key. Keep
   the authoritative configuration outside Git/source transfer with mode 0600.
   The deploy script installs protected mode-0600 copies into each release and
   its standalone tree; those copies must never enter a public artifact.
4. The deploy shell sources the environment file, and PM2 reads the copied file.
   Matching quote delimiters must be decoded literally by the PM2 loader; neither
   substitutions nor escape sequences are evaluated there. Use shell-safe
   quoting for URLs containing query separators. Preserve `.env.release`
   precedence and inspector removal. Do not source an untrusted dotenv file.
5. Apply the protected nginx candidate only under the approved release operation.
   Compare its audited preimage with the current live file first; regenerate and
   review it if the baseline changed. The exact `/api/image-generation` location
   must inherit/copy the existing API rate/body/timeout controls, overwrite
   `X-Real-IP`, and disable cache lookup/storage. Do not discard unrelated site
   configuration. Syntax-test before reload, with a protected rollback copy.
6. Deploy through the existing blue-green path. Backend ports must remain
   loopback-only and closed to public ingress. Do not delete/start the existing
   PM2 application to replace it or change unrelated services.
7. Run the **complete** mandatory health, ten-page, CSS and font sequence from
   `AGENTS.md` and verify the exact release identity. Confirm the image API returns
   `503 disabled`, creates no guest cookie/job and the UI stays unavailable.
   Stop and roll back on a failed health/assets/identity check.

## Stage 2: separately approved, limited public trial

Only proceed when all publication gates are satisfied. Keep the existing trial
profile: one running generation, at most three pending jobs, one active job per
guest, three requests per IP/guest/hour, ten globally/hour and twenty globally/day.
These are application ceilings, not a provider entitlement or throughput promise.
Do not advertise unlimited or guaranteed image generation.

Enable through the approved blue-green/configuration procedure, then:

- Verify the live canonical HTTPS origin and `Secure`, `HttpOnly`, `SameSite=Strict`
  cookie scoped to the image API. The parent image page remains `noindex` during
  the trial.
- Verify the live API/image responses are `no-store`, including errors. Inspect
  the actual public routing/CDN cache behavior, not only local nginx syntax.
- Reject a forged Origin, cross-site request and non-owner image request. Confirm
  public clients cannot bypass nginx to forge the quota IP.
- Submit one identified, bounded, non-sensitive Persian acceptance prompt with
  consent. Reload while running, recover the same job, display and download the
  image, decode pixels and confirm a repeated download has the same hash.
  Do not repeat uncertain provider submissions to get a green result.
- Confirm prompt erasure, result expiry, heartbeat, queue bounds and failure
  reporting. Keep acceptance media, prompts and infrastructure evidence out of
  GitHub. Stop the trial if the provider exposes a signup, CAPTCHA or quota gate.

## Operations and rollback

- Observe worker/browser/TLS/host-watch health, fresh heartbeat, safe failure codes
  and timing/queue counts through protected operator access. Logs must not contain
  prompts, images, tokens or connection strings. The provider circuit persists
  across restarts; do not clear it simply to continue testing.
- Keep an owner and renewal deadline for the queue certificate. The tested manual
  renewal helper checks key/chain/name, reload success and the exact live peer,
  with verified rollback. Startup expiry checks do not provide continuous alerts;
  agree the ongoing observation/notification arrangement before public enablement.
- Active-table expiry is not a promise of erasure from backups/WAL or FlatAI.
  Retain the existing privacy explanation and dedicated retention policy. Never
  rotate the encryption key while retained jobs exist to shortcut cleanup.
- A failure of isolation, trusted TLS, ownership, admission bounds, live health or
  provider permission closes admissions. Disable the flag through the approved
  release process and stop the worker gracefully. Do not drop tables or clear
  queued/uncertain work to bypass recovery guards.
- Preserve the prior release and protected environment/nginx preimages. Restore
  the authoritative environment with admissions disabled and its protected
  release/standalone copies; restore nginx independently, syntax-test and reload
  it. Apply the existing application rollback and confirm the prior process uses
  the restored environment. Blue-green application rollback alone does not undo
  separately applied nginx/environment changes. Rerun the mandatory public
  health/assets sequence and verify that new image admissions are disabled.

Provider sources: [terms](https://flatai.org/flat-ai-inc-terms-of-service/),
[responsible use](https://flatai.org/responsible-use/),
[pricing](https://flatai.org/pricing/). These documents are inputs to the provider
gate, not an assertion that this integration has an official API or public
multi-user capacity approval.
