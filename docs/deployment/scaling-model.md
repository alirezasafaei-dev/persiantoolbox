# Deployment Scaling Model (NP0-06)

## Current Decision

- Active mode: `single-vps-stateful`
- `site_settings` persistence: PostgreSQL via `lib/server/db.ts`
- sessions/auth/subscriptions/history: PostgreSQL-backed

## Invariants

1. Only one application instance is allowed to write site settings in this mode.
2. PostgreSQL is required for all persistence (sessions, auth, subscriptions, history, site_settings).
3. `DATABASE_URL` is required for all data consistency.
4. Multi-instance deployment requires PostgreSQL (no local file-based storage).

## Multi-Instance Upgrade Path

1. Verify all site_settings reads/writes go through `lib/server/db.ts` (PostgreSQL).
2. Run auth/session consistency checks under at least two app instances.

## Operational Guardrail

- Any production scale-out (replicas > 1) requires completing the upgrade path first.
