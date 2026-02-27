# PersianToolbox Real Roadmap (Current State)

Updated: 2026-02-27

## Completed Baseline

1. NP0/NP1/NP2 backlog is fully closed (`24/24` DONE).
2. Production VPS deploy path is verified healthy.
3. Contract checks, local quality gates, and release report generation are in place.

## Active Phase: Enterprise Release Iteration

Goal: keep every release train reproducible and deployment-safe.

Execution path:

1. `node scripts/roadmap/execute.mjs --phase enterprise-release`
2. Verify generated artifacts in:
   - `docs/deployment/reports`
   - `docs/release/reports`
3. Publish version and monitor production health checks.

Exit criteria:

1. `enterprise-release` phase passes end-to-end.
2. Release tag is created for the target version.
3. Production symlink/process/health checks match the released commit.

## Governance Rules

1. No stage is accepted without executable evidence (tests/contracts/reports).
2. Runtime behavior on VPS is final truth, not docs alone.
3. Keep roadmap, scripts, and reports synchronized after each major step.
