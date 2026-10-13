# FlatAI limited production trial — 2026-10-13

The owner-authorized release now serves the image workspace at
`https://persiantoolbox.ir/image-tools/ai-image-generator`. Cloudflare remains
chat-only. The integration uses the ordinary FlatAI Standard browser form,
without an unofficial API, account sharing, identity rotation or protection
bypass. The existing ceilings are unchanged; this is a limited trial, not a
throughput or availability guarantee.

## Release and recovery

- PR #229 merged as `962ec6857a586ba4550a21f488a178a0b1c9c092`.
- All 16 applicable check runs on that main commit succeeded. Server QA passed
  1,892 tests in 254 files, contracts, build and the 11-route standalone smoke.
- Both stages used the canonical blue-green engine on that exact SHA, without
  database migrations. Stage 1 kept admissions disabled; Stage 2 changed only
  the image flag in protected configuration, preserving all other settings.
- Fresh protected configuration/routing/state preimages and a validated runtime
  archive were retained. The preceding disabled release remains the online
  rollback target. Runtime configuration and private evidence are outside GitHub.
- Strict candidate/public asset and deployment safety audits passed. The complete
  mandatory health, ten-page, CSS and font sequence exited zero. Final warm page
  requests took 0.149–0.192 seconds.

## Actual public-domain image acceptance

One identified, non-sensitive Persian request was submitted through the real
public UI. There was no repeated or uncertain provider submission.

- HTTPS guest cookie: Secure, HttpOnly, SameSite=Strict, image-API-only path.
- Foreign Origin and cross-site submission: 403; missing consent: 400.
- Anonymous non-owner status and image retrieval: 404.
- Session, job, image and tested error responses: no-store, with no observed Age.
- Refresh recovered the same queued/running job without resubmission.
- The job reached ready in **96.701 seconds**. The downloaded JPEG decoded to
  **832×832 pixels / 83,845 bytes**; displayed pixels and a repeated API download
  matched the actual download. The complete image was visually inspected.
- A 390×844 mobile viewport reloaded the same image element without another
  submission and had no horizontal overflow. This is browser viewport evidence,
  not a physical-device or manual assistive-technology claim. The mobile
  screenshot retained a footer scroll position; it is not a full-image screenshot.
- Database observation showed one ready job, no active jobs, no retained prompt
  ciphertext for the ready job, and a 1,800-second result-access window. Physical
  deletion after that live window was not accelerated or claimed as observed.
- Fresh ingress inspection confirmed client-IP overwrite, disabled API caching,
  and loopback-only application listeners. Protected environment mode remained
  0600 and the active process received the literal enabled flag.

## Site regression and operations

Fresh Chrome 155 acceptance passed **36/36 checks across 58 URLs**: desktop/mobile
navigation, footer destinations, ten actual blog articles, categories, redirects,
JSON/Base64, address, salary, loan, check penalty, real same-origin OCR, image
resize/download and contract preview. Mobile lazy search also produced an actual
JSON-tool result. No JavaScript page exceptions, static asset failures or critical
same-origin network failures were observed.

The five-minute image readiness timer checks the certificate's 30-day renewal
boundary, required services and worker/browser readiness. Immediate and scheduled
executions passed. The one-year certificate-boundary negative check failed as
expected. The monitor uses an empty Docker CLI configuration and does not read
registry credentials. It records status in systemd/journal; it does not send
external notifications, renew keys, clear circuits or retry provider work.
Certificate renewal remains the owner's tested manual procedure.

## Provider assessment and remaining limits

The current [terms](https://flatai.org/flat-ai-inc-terms-of-service/) permit
commercial output use subject to responsible use. The
[responsible-use policy](https://flatai.org/responsible-use/) prohibits excessive
or abusive automation and bypassing technical limits; it does not state a blanket
ban on all automation. This supports evaluating a bounded normal-form trial; it
does not establish an official API, explicit integration endorsement or
sustainable public capacity. The [pricing page](https://flatai.org/pricing/)
provides no numeric free image allowance. No provider contact or billing change
was made, in accordance with the owner's instruction.

Keep one running job, at most three pending jobs, one active job per guest,
three requests per IP/guest/hour, ten globally/hour and twenty globally/day.
These are application ceilings. Signup, CAPTCHA, provider quota and repeated
failures retain the existing persistent-circuit stop behavior. No bulk capacity
stress was run. Increasing scope requires new capacity evidence and owner review.

Warnings remain: intermittent production-VPS DNS timeout during public audits,
two external trust-seal timeouts, and expected anonymous trial/auth 401 console
messages. The final required health sequence and audits passed without weakening
their guards or changing the resolver. Sustained DNS reliability, high-volume
provider capacity, physical mobile/manual screen-reader acceptance and external
operational alerts are not established by this release.

Full live reports, media, session/job identifiers and operator evidence are
retained privately. This documentation commit is not a new application deployment.

LIVE_VERIFICATION_PASS_WITH_WARNINGS
