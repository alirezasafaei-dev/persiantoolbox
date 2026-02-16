# Retention Policy (Cache/Logs/Snapshots) - 2026-02-16

## Targets
- `.next/` build cache artifacts
- `.lighthouseci/` lighthouse run artifacts
- `.mcp-logs/` MCP server logs
- `.codex/snapshots/` session snapshots

## Current Local Footprint (observed)
- `.next`: ~34M
- `.lighthouseci`: ~32M
- `.mcp-logs`: ~108K

## Policy
- Keep last `7` days of `.lighthouseci` run files; archive older files if needed.
- Keep last `10` Codex snapshots in `.codex/snapshots`; archive/delete older snapshots.
- Rotate `.mcp-logs/*.log` weekly and keep max 4 rotations.
- Regenerate `.next` only from clean builds as needed; avoid long-term retention in release artifacts.

## Operational Commands (manual runbook)
- `find .lighthouseci -type f -mtime +7 -delete`
- `ls -1dt .codex/snapshots/* | tail -n +11 | xargs -r rm -rf`
- `find .mcp-logs -type f -name '*.log' -mtime +28 -delete`

## Decision
- Status: `approved-local-runbook`
