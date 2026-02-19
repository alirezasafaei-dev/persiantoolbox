# PersianToolbox Execution Roadmap (Team-Grade, No Timeline)

This roadmap is the single execution plan to complete PersianToolbox to a production-complete state.
It is phase-based and dependency-based (no calendar dates).

## 1) Execution Principles

1. Reality over documents: runtime behavior and passing gates are the source of truth.
2. No phase skipping: each phase must meet its exit criteria before moving on.
3. Small safe increments: each work package should be deployable and reversible.
4. Evidence-first completion: no task is `DONE` without test/contract/runtime evidence.

## 2) Team Operating Model

- Product/Owner: scope decisions, acceptance sign-off.
- Backend: API contracts, storage, scaling, security headers/logging.
- Frontend: feature surfaces, UX consistency, offline/PWA behavior.
- Platform/DevOps: CI gates, deploy pipeline, VPS runtime parity, rollback safety.
- QA: unit/e2e/contract suites, release evidence validation.

## 3) Global Gates (Always-On)

- `pnpm lint`
- `pnpm typecheck`
- `pnpm ci:quick`
- `pnpm ci:contracts`
- `pnpm build`
- `pnpm gate:deploy` (must pass before release promotion)

## 4) Phase Plan

## Phase 0 — Runtime Parity and Baseline Lock

Goal: make deployed staging/production behavior match intended baseline branch.

Work packages:

1. Confirm deployed app behavior vs local baseline for key routes/APIs.
2. Promote one verified artifact to staging, run smoke + health + headers checks.
3. Promote same artifact to production, re-run same checks.
4. Capture minimal evidence pack under `docs/deployment/reports/`.

Exit criteria:

- staging and production behavior are parity-aligned.
- health endpoints stable and post-deploy checks green.

## Phase 1 — NP0 Closure (Release Blockers)

Goal: close all NP0 blockers and unlock deploy gate.

Work packages:

1. NP0-04: Monetization surface coherence (`/support`, `/ads`, `/plans`, `/account` + related APIs).
2. NP0-05: Response-header and nonce E2E contracts.
3. NP0-06: Multi-instance readiness for site settings/auth/session storage.
4. NP0-07: Offline-guaranteed contract and generated shell asset list.
5. NP0-08: ETag/cache strategy for data endpoints.
6. NP0-09: Internal-link integrity gate for same-origin links.
7. NP0-10: Font pipeline hardening (WOFF2/preload/cache).

Exit criteria:

- all `tasks-next/NP0-*.md` set to `DONE` with evidence.
- `pnpm gate:deploy` passes.

## Phase 2 — NP1 Hardening (Operational Maturity)

Goal: reliability and operability at scale.

Work packages:

1. NP1-01: endpoint-level rate-limit policy + observability metrics.
2. NP1-02: CI workflow deduplication and required-check alignment.
3. NP1-03: request ID propagation + structured logs.
4. NP1-04: canonical/robots/schema CI enforcement.
5. NP1-05: PWA UX completion (install prompt + offline-ready + update notes).
6. NP1-06: secure admin surface re-enable plan.
7. NP1-07: full tool-tier enforcement beyond `/pro` special case.
8. NP1-08: performance budget gates in CI.

Exit criteria:

- all NP1 tasks closed with passing checks.
- CI signals are non-duplicative and actionable.

## Phase 3 — NP2 Product Completion

Goal: depth, quality, and operator tooling.

Work packages:

1. NP2-01: content expansion with editorial guardrails.
2. NP2-02: expanded accessibility gates.
3. NP2-03: data-version UX across all data-backed tools.
4. NP2-04: offline diagnostics UX.
5. NP2-05: local stress harness for burst simulation.
6. NP2-06: one-shot local release-readiness automation.

Exit criteria:

- all NP2 tasks closed and evidenced.
- release process reproducible locally and in CI.

## 5) Delivery Workflow (Per Work Package)

1. Define exact acceptance contract.
2. Implement minimal safe change.
3. Add/update tests and contracts.
4. Run impacted gates locally.
5. Deploy to staging and verify runtime behavior.
6. Promote to production with post-deploy evidence.

## 6) Definition of Complete Project

Project is considered complete when all conditions below are true:

1. `TASKS.md` shows all NP0/NP1/NP2 items as `DONE`.
2. `pnpm gate:deploy` and all global gates pass consistently.
3. Staging and production behavior matches intended feature flags/contracts.
4. Deployment and rollback are repeatable with evidence artifacts.
5. No known dead links, no known critical security/header regressions, and no unresolved release blockers.

## 7) Canonical Tracking Files

- `TASKS.md`
- `TASKS_NEXT.md`
- `tasks-next/*.md`
- `docs/ROADMAP_REAL.md`
- `docs/ROADMAP_EXECUTION.md`
