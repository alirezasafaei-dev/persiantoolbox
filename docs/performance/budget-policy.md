# Performance Budget Policy

- Total JS chunks budget: `PERF_BUDGET_TOTAL_KB` (default: `3400`)
- Largest JS chunk budget: `PERF_BUDGET_MAX_CHUNK_KB` (default: `750`)

Validation command:

- `pnpm performance:budgets`

This check is intended to catch bundle regressions with actionable output in CI.
