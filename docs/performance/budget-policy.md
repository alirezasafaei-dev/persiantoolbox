# Performance Budget Policy

- Total JS chunks budget: `PERF_BUDGET_TOTAL_KB` (default: `3900`)
- Largest JS chunk budget: `PERF_BUDGET_MAX_CHUNK_KB` (default: `750`)
- Total gzip JS chunks budget: `PERF_BUDGET_TOTAL_GZIP_KB` (default: `1400`)
- Largest gzip JS chunk budget: `PERF_BUDGET_MAX_CHUNK_GZIP_KB` (default: `325`)

Validation command:

- `pnpm performance:budgets`

This check is intended to catch bundle regressions with actionable output in CI.

## Current baseline

The 2026-06-18 Next.js 16 baseline is 3865.8 KB raw and 1340.7 KB gzip across generated chunks, with a 316.2 KB largest gzip chunk. The defaults intentionally leave limited headroom while checking both deploy size and approximate network transfer size. Use the environment variables in CI to tighten thresholds for release-candidate experiments.
