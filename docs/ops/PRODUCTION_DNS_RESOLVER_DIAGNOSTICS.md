# Production DNS resolver — evidence-first diagnostic runbook

**Status:** Operational follow-up required; **not a declaration of root cause or permission to edit production networking**.  
**Initial incident:** 2026-10-09, during PersianToolbox controlled Blue/Green AI chat deployment.  
**Evidence:** [successful release report](../reports/live-verification/20261009-1957-persiantoolbox.md), [deploy workflow](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/37962079002), [Issue #210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210).

## Observations / what is established

- During earlier controlled release, the **strict public `sw.js` cache/header audit** failed on a bounded DNS timeout **inside** the production VPS. The canonical engine rolled back to healthy Green; the attempted retry was canceled before another switch.
- During the subsequent successful deployment, multiple `curl` lookups inside the VPS succeeded, but isolated bounded name-resolution requests timed out again after approximately 3–4 seconds. The later canonical strict audit **passed** twice; the release succeeded. No application `sw.js` corruption was observed.
- At inspection, Ubuntu `systemd-resolved` was active; `/etc/resolv.conf` pointed to the `127.0.0.53` stub, with search domain `openstacklocal`. `resolvectl status` showed upstream `8.8.8.8` and `4.2.2.4`.
- Normal HTTPS requests from the separate Germany host reached the production domain successfully. Loopback `127.0.0.1:3000` and `127.0.0.1:3004` services reported healthy readiness. Thus an intermittent **VPS-side DNS lookup problem** is observed; exact upstream/network cause and reproducibility rate remain **UNPROVEN**.
- A single successful `getent` / `curl` **does not** close this issue. Avoid asserting outage or server-wide failure solely because one audit lookup timed out.

## Read-only diagnostic sequence

Perform these checks via an authorized shell on **the production VPS** (or a session that proves its hostname). They do not mutate production, DNS, SSH, application services or databases. Use short timeouts and low request counts.

```bash
hostname
date -u +%Y-%m-%dT%H:%M:%SZ
systemctl is-active systemd-resolved
grep -E '^(nameserver|options|search)' /etc/resolv.conf
resolvectl status
```

Compare resolver lookup with the **same public endpoint** used by strict release verification:

```bash
getent ahostsv4 persiantoolbox.ir
for i in 1 2 3; do
  curl -4 --head --fail --silent --show-error \
    --connect-timeout 5 --max-time 15 -o /dev/null \
    -w 'http=%{http_code} dns_s=%{time_namelookup} total_s=%{time_total}\n' \
    https://persiantoolbox.ir/sw.js || echo 'LOOKUP_OR_REQUEST_FAILED'
done
```

To isolate DNS *without disabling TLS certificate verification*, on the server with the **currently verified public IP** and only for diagnosis:

```bash
# Replace <VERIFIED_PUBLIC_IP> with the IP freshly validated via trusted infrastructure.
curl --resolve "persiantoolbox.ir:443:<VERIFIED_PUBLIC_IP>" \
  -I --fail --show-error --connect-timeout 5 --max-time 15 \
  https://persiantoolbox.ir/sw.js
```

This test preserves URL hostname and certificate validation but pins one IP; it does **not** establish general DNS reliability. Compare a direct request from the Germany host or other independent vantage point with the VPS result. Record UTC timestamps, IP, resolver configuration, exit code and bounded latency **without** storing authorization headers or credentials.

## Decision gate before any mitigation

- Collect repeated, timestamped failures first; inspect provider resolver routing and `systemd-resolved` service logs with least privilege. Determine whether DNS failures correlate with provider DNS, transient networking, packet loss, resource contention or local stub conditions. **Do not select a cause by intuition.**
- If a resolver change is justified, treat it as a **separate infrastructure change**: explicitly approved, backed up, prepared with an immediate rollback plan and tested under independent external monitoring. Changing `resolv.conf`, Netplan or upstream nameservers directly during an active Blue/Green release is **not** authorized by this runbook.
- **Never** suppress/skip the mandatory public `sw.js` cache checks, widen CI timeouts indefinitely, turn off TLS verification (`-k`), delete caches, disable firewall, expose private keys, or restart production processes to hide a DNS-only symptom.
- Validate the proposed remediation across repeated VPS lookups and the canonical strict audit, and ensure normal service `/api/health`, `/api/version`, assets and browser journeys remain healthy. Keep existing Green rollback slot until all gates pass.
- Mark DNS **RESOLVED** only after evidence proves the remediation and sustained post-change stability. Otherwise leave **OPEN / INTERMITTENT** and link the observed diagnostics to the risk log.

## Rollback and ownership

- DNS configuration changes have their **own network rollback**, separate from application Blue/Green rollback.
- Application rollback for release regressions follows [Production Deployment Safety](PRODUCTION_DEPLOY_SAFETY.md) with explicit approval; do not change active nginx upstream merely to fix a name-resolution issue.
- Maintain the application release report in [live verification](../reports/live-verification/20261009-1957-persiantoolbox.md) and the operational warning in [deploy and risk log](deploy-and-risk-log.md).
