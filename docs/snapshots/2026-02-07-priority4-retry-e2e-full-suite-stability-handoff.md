# Snapshot: Priority 4 Retry E2E Full-Suite Stability

Date: 2026-02-07
Branch: main

## What Was Implemented

- Executed fixture-backed retry E2E with `E2E_RETRY_BACKEND=1` and hardened flaky paths.
- Stabilized retry spec by:
  - exact API-path route interception (`/api/auth/me`, `/api/history`)
  - deterministic recovery-message assertions (`getByText`) after retry success
  - blocking service workers in this spec to reduce interception side effects
- Stabilized offline E2E flows by:
  - making service-worker readiness resilient to transient `Execution context was destroyed`
  - hardening cache-clear verification against race conditions
- Fixed dev-only runtime issue for E2E environment by allowing `unsafe-eval` in CSP only when `NODE_ENV !== production`.

## Validation (Executed)

1. `E2E_RETRY_BACKEND=1 pnpm exec playwright test tests/e2e/account-history-retry.spec.ts --project=chromium --reporter=list` ✅
2. `pnpm exec playwright test tests/e2e/offline.spec.ts --project=chromium --reporter=list` ✅
3. `E2E_RETRY_BACKEND=1 pnpm test:e2e:ci` ✅ (41 passed)
4. `pnpm ci:quick` ✅

## Key Files Updated

- `tests/e2e/account-history-retry.spec.ts`
- `tests/e2e/offline.spec.ts`
- `proxy.ts`
- `docs/roadmap.md`
- `CHANGELOG.md`
- `docs/index.md`

## Next Start Point

1. Add E2E coverage for account-load retry (`/api/auth/me` transient failure to success) with explicit recovery assertion.
2. Audit remaining high-latency E2E cases and standardize retry/poll helpers to reduce test runtime variance.
3. Keep Priority 4 docs/changelog/snapshot sync after each delivered step.
