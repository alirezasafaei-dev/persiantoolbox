# Weekly Review - 2026-02-16

## Automation Scope Executed

- Codex MCP automation smoke started and passed:
  - `bash scripts/mcp-start.sh`
- Release/deploy local automation runs:
  - `pnpm deploy:readiness:run` (passed)
  - `pnpm release:rc:run` (passed)
  - `pnpm release:launch:run` (passed on final rerun)
- Quality and contract gates:
  - `pnpm smoke:local` (passed)
  - `pnpm ci:quick` (passed)
  - `pnpm ci:contracts` (passed)
  - `pnpm lighthouse:ci` (completed with performance warnings)
- Post-deploy style check against production base URL:
  - `pnpm deploy:post:report -- --base-url=https://persiantoolbox.ir ...` (smoke/header passed)

## Current Board State

- Done:
  - P1-D1 hardening checklist review
  - P1-D2 nginx/tls/health validation
  - P1-D4 env contract audit
  - P2-P2 post-deploy confirmation pack
  - P2-P3 retention policy/runbook
- Blocked:
  - P1-D3 staging rollback drill (remote staging execution pending)
  - P1-Q2 performance optimization (multiple Lighthouse warnings)

## Notable Finding

- Launch smoke had transient a11y failure on `/image-tools` in early runs, then passed on final rerun.
- Final passing evidence:
  - `docs/release/reports/launch-smoke-2026-02-16T18-01-49-121Z.json`

## Required Next Action

1. Execute real staging rollback drill window (`ops/deploy/rollback.sh`) and close `P1-D3`.
2. Improve performance routes in `docs/deployment/reports/perf-delta-2026-02-16.md` and re-run `pnpm lighthouse:ci`.
