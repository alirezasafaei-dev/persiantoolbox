# Performance Budget Policy

- Total JS chunks budget: `PERF_BUDGET_TOTAL_KB` (default: `3600`)
- Largest JS chunk budget: `PERF_BUDGET_MAX_CHUNK_KB` (default: `750`)

Validation command:

- `pnpm performance:budgets`

This check is intended to catch bundle regressions with actionable output in CI.

## Current baseline

The default total budget includes headroom for the current Next.js 16 production build while still failing on larger regressions. Use `PERF_BUDGET_TOTAL_KB` in CI to temporarily tighten or relax the threshold for release-candidate experiments.
