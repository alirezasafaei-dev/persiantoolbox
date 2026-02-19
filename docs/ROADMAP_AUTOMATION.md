# Roadmap Automation

Automation entrypoints for repetitive execution are defined to keep focus on roadmap and reduce manual overhead.

## Commands

- `pnpm roadmap:next`
  - Shows the next pending roadmap task (table output).

- `pnpm roadmap:phase0`
  - Runs Phase 0 verification automation:
    - codex config alignment check
    - local quality gates
    - deploy gate check

- `pnpm roadmap:np0`
  - Runs NP0 closure gates (`local-gates` + `gate:deploy`).

- `pnpm roadmap:vps`
  - Runs VPS health and domain checks through SSH.
  - Default SSH command:
    - `ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes deploy@185.3.124.93`
  - Override with:
    - `ROADMAP_VPS_SSH='ssh ...' pnpm roadmap:vps`

- `pnpm roadmap:run`
  - Full automation flow:
    - resolve next task
    - phase0 verify
    - vps check

- `pnpm roadmap:dry`
  - Dry-run full flow without executing real commands.

- `pnpm docs:auto`
  - Regenerates auto status documentation from real task/report data.
  - Writes:
    - `docs/STATUS_AUTO.md`
    - `docs/status.auto.json`

- `pnpm docs:auto:check`
  - Fails if auto docs are stale (CI-friendly guard).

## Reports

Each run writes JSON/Markdown reports under:

- `.codex/roadmap-runs/<timestamp>/report.json`
- `.codex/roadmap-runs/<timestamp>/report.md`

## No-Interruption Behavior

- fail-fast by default
- optional continuation mode:
  - `node scripts/roadmap/execute.mjs --phase full --continue-on-error`

## Scripts

- `scripts/roadmap/execute.mjs`
- `scripts/roadmap/next-task.mjs`
- `scripts/roadmap/check-codex-config.mjs`
- `scripts/docs/sync-docs.mjs`
- `scripts/docs/docs-sync.config.json`
