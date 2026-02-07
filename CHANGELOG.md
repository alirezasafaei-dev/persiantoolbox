# Changelog

> Last updated: 2026-02-07

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Documentation handoff snapshot for next chat:
  - `docs/snapshots/2026-02-06-docs-priority-refresh-handoff.md`
- SQL migration runner:
  - `scripts/db/migrate.mjs`
- New handoff snapshot:
  - `docs/snapshots/2026-02-07-priority1-db-unification-handoff.md`
  - `docs/snapshots/2026-02-07-priority2-security-privacy-handoff.md`
  - `docs/snapshots/2026-02-07-priority3-coverage-security-tests-handoff.md`
- Admin authorization helper:
  - `lib/server/adminAuth.ts`
- E2E coverage for consent-driven analytics behavior:
  - `tests/e2e/consent-analytics.spec.ts`
- Analytics guardrails documentation:
  - `docs/monetization/analytics-guardrails.md`
- Core CI workflow for merge gates:
  - `.github/workflows/ci-core.yml`
- Focused security unit test suites:
  - `tests/unit/subscription-webhook.test.ts`
  - `tests/unit/sessions.test.ts`
  - `tests/unit/rate-limit.test.ts`
  - `tests/unit/auth.test.ts`
  - `tests/unit/ads-consent.test.ts`

### Changed

- Core documentation refreshed to priority-first structure (timeline language removed):
  - `docs/roadmap.md`
  - `docs/deployment-roadmap.md`
  - `docs/operations.md`
  - `docs/monetization/roadmap.md`
  - `docs/monetization/task-plan.md`
- Governance docs improved:
  - `AGENTS.md`
  - `SECURITY.md`
  - `SKILL.md`
  - `skill.toml`
  - `CONTRIBUTING.md`
- MCP configuration hardened and aligned with current workspace path:
  - `mcp-config.toml`
- Database path unified to SQL-first and clean install stabilized:
  - `lib/server/db.ts`
  - `lib/server/historyShare.ts`
  - `lib/server/rateLimit.ts`
  - `scripts/db/schema.sql`
  - `package.json`
  - `docs/operations.md`
  - `README.md`
- Priority 2 security baseline implemented:
  - admin route protected by email allowlist
  - production analytics ingest enforces secret
  - client-side analytics gated by consent
- Priority 3 quality baseline completed:
  - coverage scope aligned with core API/server/shared modules
  - coverage thresholds set to `85/85/80/85` (lines/functions/branches/statements)
  - admin auth tests expanded for unauthenticated/non-admin/admin branches

### Removed

- Obsolete dated monetization reports/checklists and phase execution plan.
- Obsolete phase snapshots superseded by the latest handoff snapshot.
- Redundant slide summary file (`docs/technical-audit-summary.pptx`).

## [1.1.0] - 2026-02-05

### Added

- Module-scoped exports (`numbers`, `localization`, `validation`, `finance`, `date-tools`) for tree-shakable consumption.
- Type-safe utilities module exports and library build pipeline.
- Typedoc API documentation generation.
- CI pipelines for linting, testing, security, PR validation, and release automation.
- CI artifact for coverage report in pull requests.
- Dependabot configuration for dependencies and GitHub Actions.
- Benchmarks and examples for Node and browser usage.

### Changed

- Storybook dev stack moved to v9 alpha to align with Next 16 (peer warning acceptable in dev).
- CI now runs full coverage (`pnpm test:ci`) by default.
- API docs and README now document NPM subpath imports.
- Restructured shared utilities into domain-focused modules.
- Improved numeric and Persian localization utilities with stricter normalization.

### Fixed

- Improved input normalization for loose number parsing.

## [1.0.0] - 2026-02-01

### Added

- Initial release with PDF, financial, image, text, and date tools.
