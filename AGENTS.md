# AGENTS — Persian Tools Engineering Guide

> Scope: This file defines how agents should operate inside this repository.

## Project Context

- **Product:** Persian Tools (Next.js + TypeScript, local-first utilities).
- **Primary goals:** RTL-first UX, WCAG AA baseline, offline-capable PWA, no runtime external dependencies.
- **Core docs:** `docs/index.md`, `docs/project-standards.md`, `docs/operations.md`, `docs/roadmap.md`.

## Non-negotiable Principles

1. **Local-first processing**: data stays in the browser unless explicitly consented.
2. **No runtime external dependencies**: no CDN or third-party scripts for core features.
3. **RTL correctness**: use logical properties (`start/end`) and ensure correct `dir`.
4. **Accessibility baseline**: WCAG 2.1 AA minimum for main user paths.
5. **Privacy by default**: analytics/ads only after explicit consent.

## Repo Conventions

- **App routing:** `app/`
- **Reusable UI:** `components/` and `shared/ui/`
- **Feature logic:** `features/`
- **Shared utilities:** `shared/`
- **Public assets:** `public/` (self-hosted)

## Engineering Standards (Must Follow)

- TypeScript `strict` enabled.
- Avoid `any` unless documented and justified.
- Use design tokens from `shared/constants/tokens.ts`.
- Motion must respect `prefers-reduced-motion`.
- PWA updates require bumping `CACHE_VERSION` in `public/sw.js`.

## Testing & Quality Gates

- Prefer `pnpm ci:quick` for local checks.
- Run `pnpm test:e2e:ci` for risky changes.
- Maintain >= 85% coverage on core tools.
- If touching PWA/consent/ads/security, add or update E2E coverage.

## Documentation Rules

- Update `docs/` when behavior changes.
- Keep README references consistent with actual file paths.
- Add entries to `docs/index.md` when creating new docs.
- Keep roadmaps and plans **priority-first** (not timeline-first).
- Remove obsolete docs when they no longer guide execution.

## Contribution Governance

- External contributions must follow `DCO.md` (`Signed-off-by` required).
- Keep `.github/PULL_REQUEST_TEMPLATE.md` aligned with current DCO policy.

## Security & Privacy

- JSON-LD must be injected with nonce (`proxy.ts` + `next/script`).
- Ads consent must gate ad rendering.
- Analytics ingest must be protected by `ANALYTICS_INGEST_SECRET` when enabled.
- Admin paths require explicit authz checks.

## Agent Workflow

1. Read `docs/project-standards.md` before edits.
2. Use local searches (`rg`) to locate patterns.
3. Keep changes minimal and explain intent in commit notes.
4. Do not remove user changes without explicit approval.
5. If you delete docs, update all references in `docs/index.md` and README.

## Do / Don’t

- ✅ Do: keep assets self-hosted, preserve RTL, add tests for critical paths.
- ✅ Do: prefer deterministic scripts and explicit env variables.
- ❌ Don’t: add external scripts, break offline behavior, or weaken consent flow.
- ❌ Don’t: keep stale snapshots/reports that no longer inform current execution.
