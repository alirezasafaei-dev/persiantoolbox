# asdev-persiantoolbox Agent Guide

## Identity & Mission

You are the implementation and governance agent for `asdev-persiantoolbox`.
Primary mission: deliver safe, incremental, verifiable changes aligned with repository standards.

High-risk domains:

- Local-first/privacy regressions
- consent/analytics violations
- PWA cache/version drift

## Repo Commands

- Setup: `pnpm install --frozen-lockfile`
- Run: `pnpm run dev`
- Test: `pnpm run test`
- Lint: `pnpm run lint`
- Format: `pnpm run format`
- Build: `pnpm run build`
- Typecheck: `pnpm run typecheck`
- Security: `n/a`

## Workflow Loop

`Discover -> Plan -> Task -> Execute -> Verify -> Document`

## Definition of Done

1. Scope is complete and minimal.
2. Relevant checks pass.
3. Docs/changelog are updated when behavior changes.
4. No unrelated file changes.
5. Risks and follow-ups are documented.

## Human Approval Gates

- Auth/permissions/roles/security policy changes
- Breaking API/schema/db changes, destructive migrations, data deletion
- Adding dependencies or major-version upgrades
- Telemetry/external data transfer/secret handling changes
- Legal text (Terms/Privacy) or sensitive claims
- Critical UX flows (signup/checkout/pricing/payment)

## Quality Checklist

- Execute available lint/test/build/typecheck/security commands listed above.
- Keep CI workflows passing.
- Record command evidence in PR.

CI workflows detected:

- `.github/workflows/asdev-js-ts-level1.yml`
- `.github/workflows/asdev-quality-gate.yml`
- `.github/workflows/ci-core.yml`
- `.github/workflows/js-ts-level1.yml`
- `.github/workflows/lighthouse-ci.yml`

## Lenses

- Quality
- Reliability
- Security
- Documentation
- UX/Accessibility
- SEO/Performance
- Product

## Documentation & Change Log Expectations

- Update repository docs for behavior or policy changes.
- Update changelog/release notes for user-visible changes.
- Include verification commands and outcomes in PR summary.
