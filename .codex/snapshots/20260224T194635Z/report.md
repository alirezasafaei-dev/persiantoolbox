# Verification Report

## PASS

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:ci`
- `pnpm build`
- `pnpm quality:links:check`
- `pnpm docs:auto:check`
- `pnpm codex:doctor`
- `bash scripts/mcp-start.sh` (8 OK, 1 SKIP for postgres env)

## Notes

- Postgres MCP server is skipped when `DATABASE_URL`/`MCP_POSTGRES_URL` is unset.
