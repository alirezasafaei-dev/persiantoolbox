# Docs Index

This directory has been cleaned and organized to keep only active, project-relevant documents.

## 1) Roadmap and Progress

- Real phased roadmap: `docs/ROADMAP_REAL.md`
- Task status matrix: `TASKS.md`
- Task specs (execution units): `tasks-next/`

## 2) Operational Contracts (CI/Release)

- Deploy readiness gates: `docs/deployment-readiness-gates.json`
- Release candidate checklist: `docs/release-candidate-checklist.json`
- Launch checklist: `docs/launch-day-checklist.json`
- Rollback checklist: `docs/rollback-drill-checklist.json`
- Release state source-of-truth: `docs/release/release-state-registry.md`

## 3) Deployment Evidence (trimmed)

- Readiness report (latest retained): `docs/deployment/reports/readiness-2026-02-16T19-27-06-932Z.json`
- Post-deploy sample evidence: `docs/deployment/reports/nginx-tls-health-2026-02-16.md`
- Release evidence (latest retained):
  - `docs/release/reports/rc-gates-2026-02-16T19-27-27-953Z.json`
  - `docs/release/reports/launch-smoke-2026-02-16T19-36-15-545Z.json`

## 4) Technical Reference

- Technical handbook: `docs/technical/README.md`
- ADRs: `docs/technical/adr/`

## 5) Domain-Specific Contracts

- Monetization: `docs/monetization/*.json`
- Licensing: `docs/licensing/*`

## Notes

- Historical noise and non-operational documentation were removed.
- Generated log dumps under `docs/deployment/reports/logs/` were removed.
- Non-core documentation buckets not used by runtime/contracts were removed.
