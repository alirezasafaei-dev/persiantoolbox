# Analytics Storage (Self‑Hosted, Local‑First)

This project supports **same‑origin**, **consent‑gated** analytics ingestion via `POST /api/analytics`.

## Storage modes

Storage mode is selected by `ANALYTICS_STORAGE`:

- `postgres` (recommended for production and scale): aggregated counters stored in Postgres tables.
- `file` (single-host fallback): aggregated summary is cached in-memory and flushed to `ANALYTICS_DATA_DIR/summary.json` on a debounce (not on every request).

If `ANALYTICS_STORAGE` is not set:

- Postgres is used when `DATABASE_URL` is configured.
- Otherwise `file` mode is used.

## Contracts / privacy

- No third-party runtime endpoints are used.
- Client-side tracking is blocked unless consent is granted (`consentGranted: true` contract).
- Server sanitizes metadata and strips query/hash from paths.

## Operational notes

- For Postgres mode, run `pnpm db:migrate` so analytics tables are present (`scripts/db/schema.sql`).
- In production, set `ANALYTICS_INGEST_SECRET`; `proxy.ts` injects it only into the internal `/api/analytics` request so the secret is never shipped to the browser.
- Optional rate limit knobs (effective when DB is available):
  - `ANALYTICS_RATE_LIMIT`, `ANALYTICS_RATE_WINDOW_MS`
  - `ANALYTICS_MAX_BODY_BYTES`
