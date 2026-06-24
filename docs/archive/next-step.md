# Next Step

## Snapshot

- generated: 2026-04-27T11:01:19.353Z
- branch: `main`
- upstream: `origin/main`
- ahead/behind: `0/0`
- workspace: only `docs/next-step.md` is untracked
- last commit: `6ddae48` - `chore: add handoff status helper and docs pointer`

## Done Recently

- handoff status generator added in `scripts/handoff-status.mjs`
- handoff template added in `docs/session-continuation-template.md`
- README updated with handoff workflow and command reference
- previous production-hardening slice is already closed and reflected in roadmap/docs

## Current Reality

- repo is effectively clean and synced with upstream
- CSP hardening, docs-link checks, Lighthouse summary artifact, and broader a11y smoke are already done
- remaining work is follow-up optimization, not an active release blocker

## Recommended Next Work

1. Continue from `docs/todo-next.md`
2. Take the highest-value open item first:
   - P1: guide listing/search UX improvements
   - P1: Lighthouse budget thresholds for key Persian routes
   - P1: docs link checker CI gate review/final polish if needed
3. If the goal is release confidence instead of product work, verify the current baseline first:
   - `pnpm ci:quick`
   - `pnpm ci:contracts`
   - `pnpm build`

## Suggested Starting Point

If you want the safest continuation with the best risk/reward, start with this item:

- add Lighthouse budget thresholds and trend reporting review around `/`, `/tools`, `/pdf-tools`, and `/guides`

Why this first:

- it improves release visibility
- it is smaller and less risky than UX refactors
- parts of the summary pipeline already exist, so this is an incremental follow-up

## Files To Read First

- `docs/todo-next.md`
- `docs/ROADMAP_REAL.md`
- `docs/session-continuation-template.md`
- `scripts/handoff-status.mjs`
- `.github/workflows/lighthouse-ci.yml`

## Quick Resume Commands

```bash
git checkout main
git pull --ff-only origin main
pnpm install
pnpm handoff:status
```

For a quick confidence pass before editing:

```bash
pnpm ci:quick
pnpm ci:contracts
```

## If Time Cuts Off Again

Before stopping, update this file with:

- what changed
- what was validated
- exact blocker or reason for stopping
- exact next command for the next session

## One-Line Resume Prompt

```text
From `docs/next-step.md` continue with the next highest-value item in `docs/todo-next.md`. Keep changes minimal, avoid unnecessary refactors, validate only the relevant scope, and refresh the handoff notes before stopping.
```
