# PersianToolbox Real Roadmap (Phased, No Timeline)

This roadmap is based on:

- actual code status in this repository,
- current task states in `tasks-next`,
- real VPS runtime verification (healthy infra, older app behavior deployed).

## Phase 0: Deployment Reality Sync (Mandatory)

Goal: make deployed runtime match current baseline branch before expanding scope.

Scope:

1. Deploy the current stabilized baseline to staging.
2. Validate behavioral diff on staging for feature availability and API disabled contracts.
3. Promote same artifact to production after smoke and rollback checks.

Exit criteria:

- staging + production run same intended baseline behavior.
- post-deploy health and smoke evidence captured.

## Phase 1: NP0 Closure (Release Blockers)

Goal: close all NP0 tasks so deploy gate becomes green.

Work packages:

1. NP0-04 monetization surfaces coherence.
2. NP0-05 response-header + nonce E2E security contracts.
3. NP0-06 multi-instance storage readiness (settings/auth/session).
4. NP0-07 offline-guaranteed contract + SW shell generation.
5. NP0-08 cache strategy for data endpoints.
6. NP0-09 internal-link integrity gate.
7. NP0-10 font pipeline hardening.

Exit criteria:

- `tasks-next/NP0-*` all set to `DONE` with evidence.
- `pnpm gate:deploy` passes.

## Phase 2: NP1 Hardening (Operational Maturity)

Goal: improve reliability, observability, and CI signal quality.

Work packages:

1. NP1-01 endpoint-wise rate-limit strategy + metrics.
2. NP1-02 workflow deduplication (single canonical CI set).
3. NP1-03 request-id + structured logging baseline.
4. NP1-04 SEO CI contracts (canonical/robots/schema).
5. NP1-05 PWA UX completion (install + offline-ready messaging).
6. NP1-06 secure admin re-enable plan.
7. NP1-07 full tool-tier enforcement beyond `/pro` special-case.
8. NP1-08 performance budgets in CI.

Exit criteria:

- all NP1 specs marked DONE with passing contract checks.
- CI signals become non-duplicated and action-oriented.

## Phase 3: NP2 Product Depth

Goal: growth and operator-quality improvements after stability foundation.

Work packages:

1. NP2-01 content expansion with quality guardrails.
2. NP2-02 broader accessibility gates.
3. NP2-03 data version visibility across data-backed tools.
4. NP2-04 offline diagnostics UX.
5. NP2-05 local stress harness for burst simulation.
6. NP2-06 one-shot local release readiness automation.

Exit criteria:

- NP2 list complete with reproducible evidence and docs.

## Governance Rules

1. No task is marked DONE without executable evidence (tests/contracts/reports).
2. Runtime behavior on VPS is the final truth source, not only local docs.
3. Keep docs minimal and live; remove stale artifacts continuously.
