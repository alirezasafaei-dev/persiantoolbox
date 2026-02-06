# Snapshot: Priority 1 DB Unification + Clean Install

Date: 2026-02-07
Branch: main

## What Was Executed

- Priority 1 roadmap item was implemented as SQL-first:
  - removed Prisma-dependent install/build path
  - standardized migration through `scripts/db/schema.sql` and `pnpm db:migrate`
- Server DB layer was made consistent:
  - `lib/server/historyShare.ts` now uses SQL queries directly
  - `lib/server/rateLimit.ts` now uses SQL transactions directly
  - `lib/server/db.ts` no longer exposes Prisma-like stubs
- Schema coverage for used features was completed:
  - `history_share_links`
  - `rate_limits`
  - `rate_limit_metrics`

## Validation Run (Real)

1. `pnpm install --frozen-lockfile` ✅
2. `pnpm ci:quick` ✅
3. `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools pnpm db:migrate` ✅
4. `DATABASE_URL=postgresql://persian_tools:persian_tools_dev@localhost:5432/persian_tools ./scripts/mcp-start.sh` ✅ (9/9)

## Files Touched (Key)

- `package.json`
- `pnpm-lock.yaml`
- `scripts/db/migrate.mjs`
- `scripts/db/schema.sql`
- `lib/server/db.ts`
- `lib/server/historyShare.ts`
- `lib/server/rateLimit.ts`
- `docs/operations.md`
- `docs/roadmap.md`
- `README.md`

## Next Chat Start Point

1. Execute Priority 2 from `docs/roadmap.md`:
   - enforce analytics ingest secret for self-host ingest endpoint
   - consolidate consent/nonce/security behavior checks with tests
2. Add CI workflow gate for deployment-critical checks:
   - `pnpm install --frozen-lockfile`
   - `pnpm ci:quick`
   - `pnpm build`
