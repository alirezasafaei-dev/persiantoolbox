# FlatAI continuation — 2026-10-11 21:18 UTC

The owner reaffirmed **Cloudflare for chat only**, preserving the isolated
Playwright FlatAI architecture in draft [PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229).
Cloudflare-image PR #239 is closed unmerged and issue #238 is closed. Main is
`54561b080396754fabb3cd7fe18f1ca07d6bc67f`; public health still reports
`f58ef7ad7937de8810df5de4dd3a09ffffdec0f4`, `status=ok`, `ready=true`.
No merge, deployment, upstream email, account creation, network-identity change,
quota configuration change or production configuration change was performed.

## Ordinary Windows browser form — PASS, bounded evidence

The official [image guide](https://flatai.org/ai-image-generator-free-no-signup/)
says some models/features require an eligible account or plan. The current UI
initially selected **Flat AI Ultra**. Through the visible UI, one Standard
selection and one Generate click with a synthetic English cup illustration
produced a visible, complete 832×832 image. The browser displayed Sign in; no
login was performed. Existing browser state was present, so this is not proof
of a pristine anonymous profile or general anonymous availability.

The actual Download button saved a JPEG. The repository's strict decoder fully
decoded its pixels, verified its displayed dimensions and produced a sanitized
832×832 JPEG of 90,527 bytes. The result is kept in the local owner delivery
folder, not the public repository. No cookies or authentication state were
exported. This is Windows in-app-browser evidence, not intended-host acceptance.

## Adapter selection — PASS; Linux access — BLOCKED

The adapter now selects the exact visible Standard button and requires its
active class token before submitting. A missing control or failed selection
stops the flow; it never falls back to another model or retries generation.
Three new tests failed before implementation and passed afterward. Focused
browser/RPC/network/egress tests passed: 33 tests, one Linux-only shell test
skipped on Windows. Independent read-only review found no actionable P0/P1/P2.

A single invocation of the actual updated `generateWithBrowser` ran in WSL
Linux with non-root sandboxed Chromium, dropped capabilities, read-only root,
no published ports, no database credentials, an allowlisted proxy and two
isolated gatewayless browser bridges. The fixture reused the previously
installed pinned Chromium image and installed the current locked dependencies;
it is not evidence of a fresh canonical browser image build.

The fresh browser context selected Standard, submitted once and stopped after
eight seconds with **`signup_required`**, stage `waiting`. No image was generated
and no retry was made. The owned containers and networks were removed and their
absence checked. Production and other Docker services were not changed.

**Selecting Standard does not resolve the Linux access denial.** The different
Windows and Linux observations do not establish whether browser state, provider
policy, environment, time or another factor caused it. No account requirement,
CAPTCHA, quota, identity or provider protection was bypassed.

## Remaining gates — NO-GO

- Resolve permitted upstream signup/access using the ordinary supported flow.
  Do not email the provider, as instructed by the owner. A single successful
  Windows request does not authorize a public multi-user browser service or
  establish its capacity. The current [Responsible Use Policy](https://flatai.org/responsible-use/)
  restricts abusive automated/high-volume usage and bypassing limits.
- Confirm and provision the intended dedicated host through an authorized
  administrative connection. Actual host sandbox/network tests, firewall reload,
  Docker restart, reboot and successful generation/download remain NOT_RUN.
- Reverify the final exact head, perform independent review and obtain explicit
  owner merge/deploy approval before any release. Keep the PR draft and the
  public image feature disabled.
