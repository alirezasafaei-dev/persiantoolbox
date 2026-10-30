# Production dependency audit follow-up — 2026-10-30

PR #245's security-audit job failed at `Audit production dependencies` for invoice commit `cef2a88a58df30a7915db7674ac6a381aa9a2602`. Its downloaded audit artifact and a fresh local reproduction both reported five advisories: two Low, three Moderate, zero High/Critical. The JSON audit command exited 1, so a warning-only interpretation was insufficient.

## Correction

- Update the existing `fast-uri` override from 3.1.8 to 3.1.9 and `qs` from 6.16.0 to 6.16.1; regenerate the lockfile and install with `--frozen-lockfile`.
- Raise the existing security-floor regression assertions to those patched versions. They failed before the version changes and passed afterward.
- No dependency was added and no workflow, audit threshold, hook or security control was relaxed.
- Lockfile regeneration also recorded upstream deprecation metadata for the unchanged `@opentelemetry/sdk-trace-base@2.10.0`; its version and integrity remain unchanged.

Upstream references: [fast-uri 3.1.9](https://github.com/fastify/fast-uri/releases/tag/v3.1.9), [qs 6.16.1](https://github.com/ljharb/qs/releases/tag/v6.16.1), [fast-uri advisory](https://github.com/advisories/GHSA-w74x-v6f9-j3xg), [qs advisory](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw).

## Local evidence

- Exact CI command, `pnpm audit --prod --audit-level=high --ignore-registry-errors --json`: exit 0, zero advisories at every severity across 563 production dependencies. This is a point-in-time registry result.
- Focused security-floor and invoice checks: 11 tests passed.
- `pnpm ci:quick`: 258 files / 1,918 tests passed, including lint and type checking.
- `pnpm ci:contracts`: passed documentation and licensing checks.
- `pnpm build`: passed. Canonical `pnpm smoke:local` with PowerShell `SMOKE_HOST=127.0.0.1` / `SMOKE_PORT=3187` (the Windows equivalent of `predeploy:smoke`): exit 0, 11 standalone checks passed.
- Independent code review: no actionable findings in the dependency delta; fresh Linux installation and hosted CI are separate verification steps.

Repository secret checks passed; staged-diff scanning and hosted CI results are recorded with the final candidate. This dependency correction does not establish PDF visual acceptance, production deployment or search-ranking improvement. No merge or deployment is authorized by this report.

## Registry errors must not count as a clean scan

A subsequent local audit using `--ignore-registry-errors` returned exit 0 after a socket error without valid audit metadata. That result was rejected. A strict retry on the unchanged dependency graph returned a valid zero-advisory report for all 564 current production dependencies; no network or system configuration was changed by this repository patch.

Remove `--ignore-registry-errors` from both `security:scan` and hosted auditing. CI now validates the JSON report through `scripts/security/assert-audit-report.mjs` instead of defaulting missing vulnerability metadata to an empty object. Missing/error/malformed reports, empty dependency evidence, invalid severity counters and High/Critical findings fail. The job still preserves the auditor's exit status and the existing High severity threshold; no protection is relaxed.

Thirteen focused validator/CLI/configuration tests and two dependency-floor tests pass. Real saved valid audit evidence exits 0 through the new validator; the actual ECONNRESET response exits 1. JSON text without a report and structured error fixtures also fail. This patch changes security tooling and CI, with no application-runtime or dependency-version changes relative to the preceding invoice checkpoint. Fresh quick/contracts checks and final hosted results belong in the delivery receipt; application build/smoke results must retain their source checkpoint.
