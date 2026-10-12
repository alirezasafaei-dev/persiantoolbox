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

### Later acceptance completed on 2026-10-12

The source candidate `8c1598cf09721bd595aea3e62f9802793b51a5cd` passed all
17 exact-head GitHub checks. A private loopback Next.js process used the unchanged
image component and API route with the restricted TLS queue connection and
intended-host worker/browser. A fresh Persian prompt produced a real 832x832
JPEG in 438 seconds. The UI displayed it and the actual download link saved
116,292 bytes with successful pixel decoding. Reload while running recovered
the same job; reload after ready recovered the same image and a second download
had an identical hash. Prompt ciphertext was erased on completion. Wrong-Origin
POST returned 403 and a request without the owning session returned 404.
The temporary process and SSH forward were stopped. This is bounded real
frontend/provider proof, not a production-domain secure-cookie deployment test.

That long generation also verified the RPC deadline correction: the previous
fetch transport could stop waiting for headers after 300 seconds while the
adapter allowed nine minutes for generation. Native internal HTTP now keeps a
ten-minute whole-response deadline, caller cancellation, no redirects, bounded
response buffering, image validation and no generation retry. The delayed-header
regression was observed RED then GREEN; all 15 RPC tests and independent delta
review passed. Image quality was partial: the requested scene appeared, but
the book was open despite asking for it closed. No capacity or full prompt
fidelity guarantee follows from this sample.

Authorized dedicated-host maintenance subsequently closed the new queue TLS
listener's cold-boot gap: the boot ID changed, listener and guarded image stack
started automatically, strict browser isolation passed, and all seven real
Iran-to-Germany TLS/least-privilege/negative-access probes passed. Existing
unrelated containers were restored with their original restart policies.
All 33 original command restrictions were restored. Production site health
remained OK at its unchanged release; no production deployment was performed.

Leaf-certificate renewal was exercised against the dedicated image database:
unchanged CA trust, matching new key, hostname validation, explicit successful
PostgreSQL reload and the exact live peer fingerprint were checked. Independent
review identified rollback and temporary-key retention issues; four failure
regressions were RED before correction and GREEN afterward. A real controlled
failure after candidate reload restored and verified the exact original active
leaf. Normal renewal then passed again, as did seven TLS probes and three
25/30/35-second idle-pool probes. Duplicate temporary private keys/CSRs were
removed. No remaining actionable P0/P1/P2 was found in this operational scope.
The protected operator renewal helper and sensitive host evidence stay outside
GitHub; renewal remains an owner-operated procedure, not a scheduled guarantee.

### Still required before public release

Keep PR229 draft, unmerged and the public flag disabled. Permitted public
multi-user unattended use and sustainable capacity remain unestablished;
the original small trial quotas are unchanged. Do not email the provider,
perform bulk capacity probes, rotate identities or bypass its access gates.
Production-domain acceptance, merge/deployment and public enablement require
separate owner release approval. Reverify CI on the new exact head after every
push; the earlier candidate results must not stand in for later-head CI.

This update changes no production, identity, quotas, accounts or provider retry
policy. Current exact-head evidence belongs to the PR/delivery report.
