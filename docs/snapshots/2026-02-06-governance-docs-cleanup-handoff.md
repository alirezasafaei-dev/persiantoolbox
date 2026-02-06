# Snapshot: Governance + Docs Cleanup Handoff

Date: 2026-02-06
Branch: main
Status: clean (no uncommitted changes)

## Latest Commits

1. `6e04e74` — docs: improve governance files and remove obsolete documentation
2. `45e6d80` — docs: refresh technical documentation with priority-first roadmap

## What Changed (Final State)

- Governance and policy docs improved:
  - `AGENTS.md`
  - `SECURITY.md`
  - `SKILL.md`
  - `skill.toml`
  - `CONTRIBUTING.md`
  - `CHANGELOG.md`
  - `mcp-config.toml`
- Core documentation remains priority-first and aligned:
  - `docs/roadmap.md`
  - `docs/deployment-roadmap.md`
  - `docs/operations.md`
  - `docs/monetization/roadmap.md`
  - `docs/monetization/task-plan.md`
  - `docs/index.md`
- HTML roadmap boards are priority-based and synced in both paths:
  - `docs/roadmap-board.html` == `public/roadmap-board.html`
  - `docs/deployment-roadmap.html` == `public/deployment-roadmap.html`

## Obsolete Docs Removed

- Dated monetization reports/checklists and phase execution plan.
- Old phase snapshots replaced by focused handoff snapshots.
- `docs/technical-audit-summary.pptx` removed as redundant artifact.

## Current Snapshot Set

- `docs/snapshots/2026-02-06-lighthouse-ci-setup.md`
- `docs/snapshots/2026-02-06-docs-priority-refresh-handoff.md`
- `docs/snapshots/2026-02-06-governance-docs-cleanup-handoff.md`

## Next Chat Start Point

1. Start implementing **Priority 1** from `docs/roadmap.md`:
   - unify DB path (Prisma vs SQL)
   - make clean install deterministic (`pnpm install --frozen-lockfile`)
2. Implement **Priority 1 + 2** from `docs/monetization/task-plan.md`:
   - enforce analytics ingest secret
   - harden consent flows with tests
3. Build missing CI workflow set (beyond Lighthouse) based on `docs/operations.md` gates.

## Suggested Verification Order (Next Chat)

1. `pnpm install --frozen-lockfile`
2. `pnpm ci:quick`
3. `pnpm test:e2e:ci`
4. `pnpm build`
