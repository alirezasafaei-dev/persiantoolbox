# Invoice public-font routing repair

## Observed release defect and bounded design

The published release `0195bbc3164960f54f782d3abe1f541153518dae` computes the synthetic invoice correctly but cannot export its PDF: public `/fonts/Vazirmatn-Regular.ttf` is HTTP404. Both invoice TTFs exist in active source/standalone public directories; direct inactive/active-port retrieval of the regular font returns200. Production Nginx `/fonts/` still aliases the historical checkout. UI WOFF2 checks passed, so the existing release gate missed the defect.

The repair should make the canonical deploy engine reconcile only the known stale production-font location with the active upstream, leaving staging, Next.js immutable static-store routing, cache/auth/CSP and unrelated vhosts unchanged. Before changing config, require exactly one supported production server location, a verified current loopback font response and a protected original-config backup. Use atomic installation, `nginx -t`, graceful reload, public byte/checksum verification and restoration on failure. Preserve the repair across future blue/green switches through the existing named upstream. Do not manually copy missing fonts into the stale owner checkout, change TLS, or introduce an independent release entrypoint.

## Required proof before any production action

1. Add behavioral configuration-transform regressions for supported legacy alias, already-correct route, staging preservation, ambiguous/unknown location rejection and required header preservation. Observe RED.
2. Implement the smallest pure config transform plus a canonical-engine-owned reconciliation step with backup/restore and public verification. Confirm safe idempotency, exact affected vhost and no cross-site mutation.
3. Add both invoice TTFs to release asset checks, with HTTP200/nonempty/appropriate MIME validation. Current-release reconciliation must occur before strict public asset verification; no recovery flag is needed to hide missing fonts.
4. Run transformation tests, shell syntax/deployment contracts, full required gates and independent security/correctness review. Secret scans/licensing/DCO before commit/push. Prepare an exact-head reviewable PR.
5. Obtain required owner approval for the new immutable hotfix release, use the canonical deployment workflow, then verify actual live mixed-script invoice download, text extraction/readers and retained rollback identity. No completed/fixed claim before that evidence.

## Implementation checkpoint — 2026-11-06

Steps 1–4 implemented in `codex/invoice-font-route-20261106`; see the [verification report](../../ops/invoice-font-routing-2026-11-06.md). The canonical engine owns the narrow font route reconciliation, protected backup, atomic installation, syntax/reload validation and restoration on failure. The public asset gate now requires both TTFs, valid MIME, nonempty bodies and exact reference bytes. Cross-release rollback/provisioning checks bind the reference to the runtime being checked.

The built standalone Chromium test downloaded the real mixed-script invoice using both actual release fonts. Local verification is not production acceptance. Step 5 remains pending explicit owner merge/deploy approval for the new PR, hosted exact-head checks and post-release live download verification.

Network configuration, salary data freshness and full worker offline isolation are separate work; this repair does not change those systems.
