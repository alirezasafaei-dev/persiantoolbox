# V3 Kickoff Execution Plan

Date: 2026-02-12
Baseline: `v2.0.2-stable-20260212` (production run `21954244443`)

## Status

- V2 ship/hardening is complete on `main`.
- Production and staging deploy pipelines are green.
- Domain checks for `https://persiantoolbox.ir` and `https://www.persiantoolbox.ir` are green.

## Preflight (before first V3 code PR)

1. Keep repository name as `persian_tools` on GitHub for now (rename target `persiantoolbox` is currently unavailable).
2. Create branch from stable baseline:
   - `git checkout main && git pull`
   - `git checkout -b feat/v3-phase0-foundation`
3. Confirm no runtime policy regression:
   - local-first/client-only/no external runtime dependency
   - no external CDN/fonts/scripts
   - `connect-src 'self'` only

## Sprint 0 Tasks (execution-ready)

1. Architecture freeze note: document V3 scope boundaries and deferred items.
2. Content/data model audit for new tools and shared utilities.
3. SEO contract for V3 pages (FAQ, App schema, Breadcrumb JSON-LD template).
4. Internal linking matrix update draft.
5. Test strategy update (unit + Playwright smoke targets).

## Sprint 1 Tasks (first implementation batch)

1. Implement first V3 feature slice behind existing tool registry patterns.
2. Add/extend schema helpers without introducing new dependencies.
3. Add TOMAN display formatter coverage for any new finance outputs.
4. Add release-note draft file under `docs/release/`.

## Acceptance Gates Per PR

1. `pnpm run lint`
2. `pnpm run typecheck`
3. `pnpm run test`
4. `pnpm run build`
5. For deployment-affecting PRs: monitor `ci-core`, `deploy-staging`, `lighthouse-ci` in GitHub Actions.

## Release Safety Rules

1. Keep deploy workflow strict mode on.
2. Keep post-deploy report generation on VPS.
3. Preserve rollback artifacts and status file upload behavior.
4. Do not remove backup freshness validation.

## Ready Signal for V3 Start

V3 can start immediately when:

1. `main` is clean and synced.
2. New branch is created from current main.
3. First V3 PR includes verification evidence from lint/typecheck/test/build.
