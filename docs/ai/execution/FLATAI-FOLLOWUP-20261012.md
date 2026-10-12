# FlatAI intended-host follow-up — 2026-10-12

Cloudflare remains chat-only. This is a bounded normal-form FlatAI diagnostic,
not publication approval, capacity acceptance or an alternate provider API.

## Verified cause and correction

- A full nine-minute intended-host request received first-party POST responses
  and displayed the normal Generated Image element, but timed out without decoded
  pixels. In-memory DOM metadata showed `complete=true`, dimensions `0x0` and
  exactly the HTTPS host `im.runware.ai`; no URL, cookies or credentials were
  retained. The proxy denied that generated-image CDN.
- Allow only `im.runware.ai:443` in addition to the two existing FlatAI hosts.
  No API/apex/subdomain wildcard is allowed. Public-only DNS validation, rejection
  of mixed answers, pinned dialing and normal-form generation are unchanged.
- A fresh Persian request with the corrected proxy generated and downloaded an
  actual 832x832 JPEG in 129 seconds. Prompt optimizer was on. Strict image
  decoding/dimension validation passed; a sanitized copy was 73,657 bytes.
  The first attempt to preserve that copy with Docker cp failed for the temporary
  filesystem, after successful in-process validation. Do not claim a retained
  deliverable or final-head host acceptance from that transfer attempt.
- These results identify a blocked result host for the later timeout. They do
  not establish the cause of the earlier WSL `signup_required` response or prove
  VPN causation. No access refusal, CAPTCHA, quota or network identity was bypassed.

## Host isolation correction

The intended host assigned IPv6 link-local addresses when isolated bridges came
up. Prepare only the two validated dedicated bridges before startup, disable
automatic address generation and flush only link-scope IPv6. Reject unexpected
topology, IPv4/global addresses, restart policies or live restore before mutation.
Re-inspect strictly after preparation and again after browser health, before
worker admission. Preserve emergency containment and global host networking.

The startup budget is 720 seconds; the regression test accounts for sequential
network command bounds as well as drain, health and guard/Compose overhead.
New network, CDN and budget regressions were observed failing before fixes and
passing afterward. Six host tests passed on the intended Linux host with no skip.
Independent read-only delta review found no remaining P0/P1/P2 findings.
The complete service suite passed 49/49 in a disposable Linux fixture with no
skip; PostgreSQL targeted only the guarded loopback test database. Typecheck,
focused lint/format, docs/licensing, dependency and staged secret checks passed.

## Remaining release gates

Keep PR229 draft, unmerged, undeployed and the public flag disabled. Final-head
CI, retained host output, guarded full-stack admission, firewall reload, Docker
restart/reboot acceptance and bounded reliability/capacity remain required.
Do not restart existing unrelated host services merely to obtain a green gate.
Permitted public multi-user use remains unestablished; do not email the provider.

This update changes no production, identity, quotas, accounts or provider retry
policy. Current exact-head evidence belongs to the PR/delivery report.
