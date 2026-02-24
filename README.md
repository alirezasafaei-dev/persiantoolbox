# PersianToolbox

Local-first Persian web toolbox built with Next.js 16 (RTL-first UI, SEO metadata, offline support, and operational CI gates).

## What Is Shipped

- 51 app pages and 16 API routes under `app/`
- Core tool clusters: PDF, image, finance, date, text
- Feature-flagged account/monetization/admin surfaces
- Security middleware (`proxy.ts`) with CSP nonce + hardening headers
- Contract-based checks for release/deployment/monetization in `docs/*.json`
- Unit/integration tests with Vitest and smoke/e2e coverage with Playwright

## Quick Start

```bash
pnpm install
pnpm lint
pnpm test:ci
pnpm build
pnpm typecheck
```

Development server:

```bash
pnpm dev
```

Codex local bootstrap (auto compact + MCP/skills checks):

```bash
pnpm codex:bootstrap
pnpm codex:doctor
```

## Project Structure

- `app/`: Next.js app router pages + API routes
- `components/`: UI and page components
- `features/`: feature-specific logic and tool implementations
- `lib/`: shared runtime/server modules (SEO, security, policies, data contracts)
- `shared/`: shared utils, analytics, UI primitives, errors
- `tests/`: unit, contract, and e2e tests
- `docs/`: operational contracts, roadmap, licensing, release evidence
- `ops/`: deployment and service runtime assets (nginx/systemd/scripts)

## Quality Gates

- Local quick gate: `pnpm ci:quick`
- Contract gate: `pnpm ci:contracts`
- Security audit: `pnpm security:scan`
- Secret-pattern scan: `pnpm security:secrets`
- Docs sync check: `pnpm docs:auto:check`
- Deploy readiness: `pnpm gate:deploy`

## CI and Automation

- Core CI: `.github/workflows/ci-core.yml`
- Code scanning: `.github/workflows/codeql.yml`
- Deploy gate + staging/production deploy workflows under `.github/workflows/`
- Dependency update automation: `.github/dependabot.yml`

## Documentation

- Docs index: `docs/README.md`
- Reality report: `docs/reality-check.md`
- Enterprise upgrade summary: `docs/enterprise-upgrade-summary.md`
- Next actions: `docs/todo-next.md`

## Governance

- DCO: `DCO.md`
- CLA (individual/corporate): `docs/licensing/cla-individual.md`, `docs/licensing/cla-corporate.md`
