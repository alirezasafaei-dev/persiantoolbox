# PersianToolbox Documentation

**v7.9.0** — persiantoolbox.ir

This directory contains public engineering, product, operations, and security
documentation for PersianToolbox. The docs are intentionally split between
stable contributor references and historical execution evidence.

## Start Here

- Product and growth roadmap: `docs/roadmap.md`
- Architecture overview for public readers: `docs/architecture/README.md`
- Repository showcase assets: `docs/repository-showcase-assets.md`
- Technical handbook: `docs/technical/README.md`
- Developer guide: `docs/DEVELOPER-GUIDE.md`
- User guide: `docs/USER-GUIDE.md`
- Security policy and secrets handling: `SECURITY.md`, `docs/security-secrets-policy.md`
- Deployment guide: `docs/deployment/production-deployment-guide.md`

## 1) Roadmap and Progress

- Active product roadmap: `docs/roadmap.md`
- Monetization execution roadmap: `docs/product/phased-execution-roadmap-codex.md`
- Deep research report: `deep-research-report-codex.md`
- Task specs (execution units): `tasks-next/`

## 2) Operational Contracts (CI/Release)

- Deploy secrets contract: `docs/deployment/deploy-secrets-contract.md`
- Release state source-of-truth: `docs/release/release-state-registry.md`

## 3) Deployment and Release

- Production deployment guide: `docs/deployment/production-deployment-guide.md`
- VPS deployment notes: `docs/deployment/new-vps-2026-06-09.md`
- Scaling model: `docs/deployment/scaling-model.md`
- Release readiness dashboard: `docs/release/v3-readiness-dashboard.md`
- Deployment reports: `docs/deployment/reports/`
- Release reports: `docs/release/reports/`

## 4) Technical Reference

- Technical handbook: `docs/technical/README.md`
- Financial hub expansion strategy: `docs/technical/01-Architecture/05-finance-market-data-strategy.md`
- ADRs: `docs/technical/adr/`
- Security secrets policy: `docs/security-secrets-policy.md`
- Security audit: `docs/security-audit.md`
- Smoke tests: `docs/technical/smoke-tests.md`
- Agent guidelines: `docs/technical/agent-execution-guidelines.md`
- Agent permissions: `docs/technical/agent-permissions-constraints.md`
- Analytics storage: `docs/technical/analytics-storage.md`

## 5) Domain-Specific Contracts

- Monetization: `docs/monetization/*.json`
- Licensing: `docs/licensing/*`

## 6) Guides

- Developer guide: `docs/DEVELOPER-GUIDE.md`
- User guide: `docs/USER-GUIDE.md`
- Environment guide: `docs/env-guide.md`
- Brand assets guide: `docs/brand-assets-guide.md`
- Session continuation template: `docs/session-continuation-template.md`
- Performance budget: `docs/performance/budget-policy.md`

## 7) Audit and Training

- Audit reports: `docs/audit/`
- Training materials: `docs/training/`

## 8) Archive

- Historical and retired documentation: `docs/archive/`

## 9) Compose

- Compose plans: `docs/compose/plans/`

## Notes

- Historical noise, non-operational docs, and completed checklists were moved to `docs/archive/`.
- Generated log dumps under `docs/deployment/reports/logs/` were removed.
- Some operational reports are kept for auditability. For day-to-day onboarding,
  prefer the Start Here section over reading historical reports.

## Docs Maintenance Rule

- Generated documents/contracts are source-of-truth and must pass `pnpm docs:auto:check`.
- Hand-written docs are: `README.md`, `DEVELOPER-GUIDE.md`, `USER-GUIDE.md`, `env-guide.md`, `brand-assets-guide.md`, `security-audit.md`.
- When behavior/config/routes change, update docs in the same pull request.
