# Codex Handoff - 2026-04-25

## Current State

- `main` is clean and synced with `origin/main`.
- Branch protection on `main` has been enabled on GitHub.
- The earlier `.gitignore` cleanup was partially rolled back because CI depends on some tracked files under `docs/deployment/reports/` and `docs/release/reports/`.
- Local Codex snapshot noise was removed from Git history tracking by `29e6673`.
- Required tracked release/deploy evidence was restored by `828151a`.

## PR Triage Status

- Merged earlier: `#1`, `#2`, `#3`, `#7`, `#8`, `#10`, `#11`, `#19`
- Closed earlier: `#4`, `#5`, `#6`, `#9`, `#12`, `#15`, `#16`, `#17`, `#18`, `#20`, `#22`, `#23`, `#24`, `#25`, `#27`, `#28`
- Remaining open PRs:
  - `#21` `chore(deps): bump framer-motion from 12.29.2 to 12.38.0`
  - `#26` `chore(deps): bump @openai/codex-shell-tool-mcp from 0.97.0 to 0.116.0`

## Work Already Done On Remaining PRs

- Both PR branches were synced with the latest `main`.
- Both PR branches were updated with generated docs from `pnpm docs:auto` to fix the `quality` check failure caused by `pnpm docs:auto:check`.
- Latest known CI state before handoff:
  - `#21`: `quality`, `contracts`, `build`, `security-audit`, `smoke-asdev`, `CodeQL` passed; `lhci` and `e2e-chromium` were still running.
  - `#26`: `quality`, `contracts`, `build`, `security-audit`, `smoke-asdev`, `CodeQL` passed; `lhci` and `e2e-chromium` were still running.

## Important Constraint

- Do not blanket-ignore or untrack all files in `docs/deployment/reports/` or `docs/release/reports/`.
- CI contracts currently expect at least some of those files to exist and stay tracked.

## Recommended Next Steps

1. Re-check GitHub PR checks for `#21` and `#26`.
2. If both are fully green, approve if needed and merge them.
3. After merges, re-check `git status` and `gh pr list --state open`.
4. If cleanup is still desired, do a narrower pass on generated artifacts without touching CI-required evidence files.
