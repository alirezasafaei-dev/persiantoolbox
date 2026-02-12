# DNS Incident Snapshot - Authoritative Inconsistency at .ir

Date (UTC): 2026-02-12
Domain: `persiantoolbox.ir`

## Summary

Application deployment and TLS are healthy, but DNS resolution is intermittent because authoritative `.ir` servers are inconsistent.

## Evidence

### 1) Domain works on major public resolvers

- `dig @1.1.1.1 persiantoolbox.ir A` -> `185.3.124.93`
- `dig @8.8.8.8 persiantoolbox.ir A` -> `185.3.124.93`

### 2) Suggested internal DNS (Mobinhost support) returns NXDOMAIN

- `dig @87.107.110.109 persiantoolbox.ir A` -> `NXDOMAIN`
- `dig @87.107.110.110 persiantoolbox.ir A` -> `NXDOMAIN`

### 3) .ir authoritative set is inconsistent

- `c.nic.ir` -> `NOERROR` with delegation:
  - `NS o.ns.arvancdn.ir`
  - `NS g.ns.arvancdn.ir`
- `b.nic.ir` -> `NXDOMAIN`
- `d.nic.ir` -> `NXDOMAIN`
- (`a.nic.ir` timed out from this network during one probe)

### 4) Arvan authoritative DNS is correct

Both Arvan authoritative NS answer correctly for:

- `persiantoolbox.ir A -> 185.3.124.93`
- `www.persiantoolbox.ir A -> 185.3.124.93`
- `staging.persiantoolbox.ir A -> 185.3.124.93`

## Impact

- Some users/networks can resolve and access website normally.
- Some users/networks get NXDOMAIN intermittently based on which upstream recursive/authoritative path is used.

## Action Required (External)

1. Escalate to NIC.IR / registrar support with this exact evidence and ask for authoritative zone consistency fix across all `.ir` name servers.
2. Keep current deployment as-is (origin and SSL are healthy).
3. Use public resolvers (`1.1.1.1`, `8.8.8.8`) as temporary client-side mitigation where needed.
