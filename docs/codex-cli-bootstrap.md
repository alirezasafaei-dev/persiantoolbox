# Codex CLI Bootstrap (Local)

Last verified: **2026-02-24**

This project has a local bootstrap flow for Codex CLI so sessions stay stable in long runs and MCP wiring remains aligned with the actual workspace path.

## Applied Configuration

- `model_auto_compact_token_limit = 100000`
  - user config: `~/.codex/config.toml`
  - repo config: `.codex/config.toml`
- project trust entry for:
  - `/home/dev/Project_Me_All/Project_Me/persiantoolbox`
- MCP workspace path aligned in:
  - `mcp-config.toml`
  - `CODEX_WORKSPACE`
  - `PROJECT_PATH`
  - MCP command paths under `node_modules/.bin`

## Installed Codex Skills

- `openai-docs`
- `playwright`
- `security-best-practices`
- `security-threat-model`
- `gh-fix-ci`
- `doc`

Restart Codex after new skill installation so they appear in interactive sessions.

## Toolchain Baseline

- Node.js: `v22.22.0`
- npm: `10.9.4`
- pnpm: `9.15.0`

## Commands

```bash
pnpm codex:bootstrap
pnpm codex:doctor
node scripts/codex/bootstrap.mjs --report docs/codex-bootstrap-status.md
```

- `codex:bootstrap`: apply/fix local config drift.
- `codex:doctor`: read-only gate; non-zero exit on missing prerequisites.
- `docs/codex-bootstrap-status.md`: generated runtime snapshot from current machine state.
