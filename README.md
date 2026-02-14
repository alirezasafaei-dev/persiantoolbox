# Persian Tools

Persian Tools is a privacy-first toolbox for Persian-speaking users, built with Next.js.

## Core Stack

- Next.js 16
- TypeScript
- pnpm
- Vitest + Playwright

## Local Development

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm vitest --run
pnpm build
```

Run app locally:

```bash
pnpm dev
```

## Quality Gates

```bash
pnpm ci:quick
pnpm test:e2e:ci
pnpm lighthouse:ci
```

## Security

- Disclosure process: `SECURITY.md`
- Header hardening baseline: `proxy.ts`
- Analytics guardrails: `docs/monetization/analytics-guardrails.md`

## Brand & SEO

- Brand page route: `/brand` (`app/brand/page.tsx`)
- Footer attribution contract: `docs/branding/footer-attribution.md`
- About-brand page contract: `docs/branding/about-brand-page.md`
- Technical SEO contract: `docs/seo/technical-seo-contract.md`

## Migration and Operations

- v2 -> v3 migration plan: `MIGRATION.md`
- Redirect map: `docs/migration/redirect-map.csv`
- Deprecation policy: `docs/migration/deprecation-policy.md`
- Feature flags: `docs/migration/feature-flags.md`
- Alerting policy: `docs/observability/alerting-policy.md`
- SLO dashboard contract: `docs/observability/slo-dashboard.md`
- DR test template: `docs/observability/dr-test-report.md`
- Incident playbook: `docs/operations/incident-response-playbook.md`
- Release state registry: `docs/release/release-state-registry.md`
- Release state consistency guardrail: `pnpm release:state:validate`
- Phase reports:
  - `docs/reports/PHASE_0_CLOSURE_REPORT.md`
  - `docs/reports/PHASE_2_SEO_REPORT.md`
  - `docs/reports/PHASE_3_OPS_REPORT.md`
  - `docs/reports/PHASE_4_STANDARDIZATION_REPORT.md`

## Merge Runbook

See: `docs/merge-runbook.md`

## Reviewer Rotation (CODEOWNERS)

See: `docs/reviewer-rotation.md`
