# Deployment Scaling Model (NP0-06)

## Current Decision

- Active mode: `single-vps-stateful`
- `site_settings` persistence: local SQLite (`.data/site-settings.sqlite`)
- sessions/auth/subscriptions/history: Postgres-backed modules and schema available

## Invariants

1. Only one application instance is allowed to write site settings in this mode.
2. Persistent disk for `.data` must be retained across restarts.
3. `DATABASE_URL` is required for session/auth/subscription/history consistency.
4. Multi-instance deployment is blocked unless site settings storage is moved to shared Postgres.

## Multi-Instance Upgrade Path

1. Migrate `site_settings` writes/reads to `scripts/db/schema.sql` table through `lib/server/db.ts`.
2. Disable local SQLite path in runtime config.
3. Re-run auth/session consistency checks under at least two app instances.

## Operational Guardrail

- Any production scale-out (replicas > 1) requires completing the upgrade path first.
