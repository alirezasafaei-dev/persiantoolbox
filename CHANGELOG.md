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
- E2E retry coverage for account/history flows:
  - `tests/e2e/account-history-retry.spec.ts`
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
- Priority 4 UX async-state baseline:
  - `shared/ui/AsyncState.tsx`
  - `tests/unit/async-state.test.tsx`
- Priority 4 regression tests for history async states:
  - `tests/unit/recent-history-card.test.tsx`
- New handoff snapshot:
  - `docs/snapshots/2026-02-07-priority4-ux-async-state-handoff.md`
  - `docs/snapshots/2026-02-07-priority4-history-regression-handoff.md`
  - `docs/snapshots/2026-02-07-priority4-tools-asyncstate-retry-e2e-handoff.md`
  - `docs/snapshots/2026-02-07-priority4-high-traffic-asyncstate-regression-handoff.md`
  - `docs/snapshots/2026-02-07-priority4-roadmap-board-sync-handoff.md`
  - `docs/snapshots/2026-02-07-priority4-wcag-asyncstate-closure-handoff.md`
  - `docs/snapshots/2026-02-07-priority5-seo-pwa-closure-handoff.md`
  - `docs/snapshots/2026-02-07-priority6-monetization-ops-closure-handoff.md`
- JSON-LD contract tests for tool/category/topics/pillar routes:
  - `tests/unit/seo-jsonld-contract.test.ts`
- Service worker cache-version contract test:
  - `tests/unit/sw-cache-version.test.ts`
- Service worker cache-version validation script:
  - `scripts/pwa/validate-sw-version.mjs`
- Monetization review backlog contract artifacts:
  - `docs/monetization/review-backlog.json`
  - `scripts/monetization/validate-review-backlog.mjs`
  - `tests/unit/review-backlog-contract.test.ts`
- Analytics storage security tests:
  - `tests/unit/analytics-store-security.test.ts`
- Codex Cloud heavy-run references added to docs:
  - `docs/codex-audit-playbook.md`
  - `docs/developer-guide.md`
  - `docs/index.md`

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
- Priority 4 UX baseline started:
  - unified `loading/empty/error` states in account/history with reusable async-state component
  - recoverable errors now expose explicit retry actions
- Priority 4 async-state expansion completed for high-traffic tools:
  - `components/features/loan/LoanPage.tsx`
  - `components/features/salary/SalaryPage.tsx`
  - `components/features/date-tools/DateToolsPage.tsx`
  - `components/features/text-tools/TextToolsPage.tsx`
- Unit coverage added for text-tools async error states:
  - `tests/unit/text-tools-page.test.tsx`
- Unit interaction coverage added for validation-tools:
  - `tests/unit/validation-tools-page.test.tsx`
- Unit regression coverage added for AsyncState error rendering in high-traffic tools:
  - `tests/unit/high-traffic-tools-async-state.test.tsx`
- Test setup noise filter for known React async warnings in UI suites:
  - `tests/setup.ts` filters only `not wrapped in act(...)` warnings
- Explicit retry recovery messages added and asserted in E2E flows:
  - `components/features/monetization/AccountPage.tsx`
  - `components/features/history/RecentHistoryCard.tsx`
  - `tests/e2e/account-history-retry.spec.ts`
- Retry E2E matcher stability improved by exact API-path routing and text-based recovery assertions:
  - `tests/e2e/account-history-retry.spec.ts`
- Added account-load retry E2E coverage for `/api/auth/me` transient failure recovery:
  - `tests/e2e/account-history-retry.spec.ts`
- Extracted shared E2E retry helpers and migrated retry specs:
  - `tests/e2e/helpers/retry.ts`
  - `tests/e2e/account-history-retry.spec.ts`
- Extracted shared PWA stability helper for service-worker readiness:
  - `tests/e2e/helpers/pwa.ts`
  - `tests/e2e/offline.spec.ts`
- Account page now exposes explicit recovery notice after successful retry:
  - `components/features/monetization/AccountPage.tsx`
- Added unit contract coverage for account/history state transitions across 401/402/500/timeout:
  - `tests/unit/account-page-retry-contract.test.tsx`
  - `tests/unit/recent-history-card.test.tsx`
- Added CSP guardrail unit tests for environment-specific `unsafe-eval` behavior:
  - `tests/unit/proxy-csp.test.ts`
  - `proxy.ts`
- Priority board visualization synced with actual Priority 4 execution state:
  - `docs/roadmap-board.html`
  - `docs/roadmap.md`
- AsyncState expansion completed for remaining high-impact tool error paths:
  - `features/image-tools/image-tools.tsx`
  - `tests/unit/image-tools-async-state.test.tsx`
- WCAG guardrails expanded on high-traffic routes via Playwright axe checks:
  - `tests/e2e/a11y.spec.ts`
- WCAG contrast regressions fixed for loan flow cards and form placeholders:
  - `components/features/loan/LoanPage.tsx`
  - `app/globals.css`
- JSON-LD generation hardened to avoid empty FAQ entities on category pages:
  - `lib/seo-tools.ts`
- Lighthouse regression baseline tightened and expanded:
  - `lighthouserc.json` enforces `seo/accessibility/best-practices` as error and `performance` as strict warn
  - monitored routes include `/tools`, `/topics`, `/date-tools`
- Service worker versioning contract standardized:
  - `public/sw.js` bumped to `v7-2026-02-07`
  - `tests/e2e/offline.spec.ts` now asserts update message `version` format
  - `package.json` includes `pwa:sw:validate`
- Analytics ingest consent/security contract hardened:
  - `app/api/analytics/route.ts` enforces `metadata.consentGranted=true`
  - `app/api/analytics/route.ts` rejects oversized payloads (`>200` events)
  - `lib/monitoring.ts` stamps consent metadata on client events
- Analytics redaction hardened:
  - `lib/analyticsStore.ts` strips query/hash from paths
  - `lib/analyticsStore.ts` allowlists metadata keys before persistence
- Consent E2E behavior upgraded to assert real deny/accept outcomes:
  - `tests/e2e/consent-analytics.spec.ts`
- Offline E2E stability hardening:
  - `tests/e2e/offline.spec.ts`
  - resilient service-worker readiness retries for transient navigation context resets
  - deterministic cache-clear acknowledgement via `CACHES_CLEARED` service-worker message
- Development-only CSP compatibility for Next.js webpack dev runtime:
  - `proxy.ts` now adds `unsafe-eval` only outside production
- Priority 4 retry behavior validated in browser-level flows for account/history.
- Retry E2E scenarios are gated behind `E2E_RETRY_BACKEND=1` for deterministic fixture-backed execution.
- Client-side timeout guards added for account/history fetch flows to avoid indefinite loading states.
- RTL logical-class cleanup applied on high-traffic financial pages:
  - `components/features/loan/LoanPage.tsx`
  - `components/features/salary/SalaryPage.tsx`

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
