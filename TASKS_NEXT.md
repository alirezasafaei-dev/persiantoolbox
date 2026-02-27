# PersianToolbox — Next-Phase Backlog (Reality-Based)

This file summarizes the current next-phase execution stance.

- Canonical task list: `TASKS.md`
- Task specifications: `tasks-next/*.md`
- Real phased plan: `docs/ROADMAP_REAL.md`

## Current Truth

- Completed tasks: `24/24`
- Remaining tasks: `0/24`
- NP0 gate closed: all NP0 tasks DONE
- Production runtime is healthy and latest verified deploy is successful.
- Enterprise release automation now includes `node scripts/roadmap/execute.mjs --phase enterprise-release`.
- Deploy workflow snapshot automation is available via `pnpm release:workflow:snapshot`.
- Latest enterprise-release run: `2026-02-27T06:21:28Z` (PASS) with report in `.codex/roadmap-runs/20260227T062128Z/`.
- Active production deploy run: `22475851589` for commit `bff7749` (completed with `success` at `2026-02-27T06:53:40Z`).
- Latest deploy workflow snapshot: `docs/deployment/reports/workflow-deploy-production-run-22475517488-2026-02-27T06-40-51-765Z.md`.
- Production visibility marker rollout in progress: add `GET /api/version`, include `version/commit` in `GET /api/ready`, and show live version in footer.
- Local direct SSH verification from this workstation is blocked (`185.3.124.93:22 -> Connection refused`), so production truth is tracked via GitHub deploy workflow.

## Execution Rule

All NP0/NP1/NP2 tasks are closed for this release train.
No timeline commitments here; only dependency-driven sequencing.
