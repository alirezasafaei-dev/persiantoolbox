# PersianToolbox Real Roadmap (Current State)

Updated: 2026-04-26

## Completed Baseline

1. NP0/NP1/NP2 backlog is fully closed (`24/24` DONE).
2. Production VPS deploy path is verified healthy.
3. Contract checks, local quality gates, and release report generation are in place.

## Active Phase: Enterprise Release Iteration

Goal: keep every release train reproducible and deployment-safe.

Latest local delivery updates:

1. Footer structure/content aligned with product IA request (3 columns + legal/developer strip).
2. `/asdev` page rebranded and simplified per profile-first direction.
3. Supporting routes added for footer information architecture: `/terms` and `/refer`.
4. `/terms` now includes structured usage constraints and explicit local legal-compliance wording.
5. `/refer` now includes interactive sharing actions (copy, SMS, Telegram) behind user-triggered reveal.
6. Deployment remains manual-gated; no server-side rollout is performed without explicit instruction.
7. `/text-tools/address-fa-to-en` transliteration quality was upgraded in two iterations:
   - phrase overrides + normalization for common Iranian spellings (`Iran`, `Tehran`, `Valiasr`)
   - expanded dictionary and address semantics for postal-grade outputs (`East Azerbaijan`, `Shahid`, `Sub`, directional terms).
8. `/text-tools/address-fa-to-en` v3 is now implemented in codebase:
   - output mode switch (`strict-postal` vs `readable`)
   - inline structured error-report generation for incorrect transliteration feedback
   - direct open-in-map actions for `Neshan` and `Balad`
9. Quality checks for v3 passed locally:
   - `pnpm -s vitest --run features/text-tools/address-fa-to-en.test.ts`
   - `pnpm -s typecheck`
10. SSH access is restored (`deploy@185.3.124.93` via `~/.ssh/id_ed25519`) and staging rollout for v3 is completed on release `20260227T110430Z-staging-v3.0.6-closeout`.
11. Post-deploy staging checks are passing on local upstream and domain (`/api/health`, `/api/version`).
12. Production rollout is completed on release `20260227T110430Z-production-v3.0.6-closeout` with passing checks on upstream and `https://persiantoolbox.ir` (`/api/health`, `/api/version`).
13. Release registration is completed in Git: commit `dd18f02`, annotated tag `v3.0.6`, and both branch/tag pushed to `origin`.
14. Retention policy execution completed locally: `.codex/snapshots` trimmed from `31` to `10` latest snapshots to reduce repetitive maintenance noise.
15. Release-state documentation is now aligned with shipped production version `v3.0.6`, readiness dashboard evidence, and release closeout checklist.
16. Production hardening follow-up completed locally:

- CSP fallback `style-src-attr 'unsafe-inline'` removed from `proxy.ts`
- shared `ProgressBar` replaced inline width styling across high-traffic PDF/image tools
- docs-link quality gate added to `pnpm ci:contracts`
- Lighthouse CI summary artifact generation added for trend visibility
- Playwright salary/security/a11y coverage refreshed and revalidated with system Chrome fallback

17. Production visibility markers are now complete in codebase:

- `GET /api/version` exposes runtime version and commit
- `GET /api/ready` includes runtime `version` + `commit`
- footer shows the live shipped release version for operator-facing verification

18. Enterprise-release replay at `2026-04-26T17:50:54Z` now passes end-to-end:

- `node scripts/roadmap/execute.mjs --phase enterprise-release` status: `passed`
- gates: `ci_contracts`, `security_secrets`, `security_scan`, `release_rc` all passed
- `security_scan` reports `1` moderate vulnerability, handled by current evidence and risk acceptance policy.
- release workflow snapshot generated:
  - `docs/deployment/reports/workflow-deploy-production-run-24958489738-2026-04-26T17-54-01-459Z.md`

19. Next roadmap action is to keep the train in this state and use evidence-only follow-ups only unless new regression appears.

20. Production operations dashboard is now implemented on `/dashboard`:

- `/dashboard` now renders a live ops UI from `/api/admin/ops` (snapshot mode + periodic refresh).
- `/api/admin/ops` exposes production-readiness snapshot (runtime, feature flags, analytics top-k, settings, DB health) with admin/allow-list + optional `OPS_DASHBOARD_TOKEN` auth.
- `pnpm admin:ops:snapshot` added to generate timestamped JSON/MD evidence artifacts in `docs/deployment/reports` for release/incident logs.
- Snapshot automation now supports repeated capture (`--repeat`, `--interval-ms`) and healthy-run gating (`--require-healthy`) for zero-touch evidence windows.
- Follow-up optional: action webhooks on degraded snapshots are available via `OPS_DEGRADED_WEBHOOK` (notify endpoint) and can be wired to PagerDuty/Slack.

Execution path:

1. `node scripts/roadmap/execute.mjs --phase enterprise-release`
2. Capture workflow deployment snapshot:
   - `pnpm release:workflow:snapshot`
3. Verify generated artifacts in:
   - `docs/deployment/reports`
   - `docs/release/reports`
4. Generate production ops evidence on demand:
   - `pnpm admin:ops:snapshot --base-url https://persiantoolbox.ir`
   - `pnpm admin:ops:snapshot --base-url http://127.0.0.1:3000`
   - Health window (6×30s) with hard gate:
     - `pnpm admin:ops:window`
   - Cron-safe wrapper (read envs `OPS_WINDOW_BASE_URL`, `OPS_WINDOW_REPEAT`, `OPS_WINDOW_INTERVAL_MS`, `OPS_DASHBOARD_TOKEN`):
   - `pnpm admin:ops:window:cron` (reads `OPS_WINDOW_REPEAT`, `OPS_WINDOW_INTERVAL_MS`, `OPS_WINDOW_INCLUDE_OUTPUT`, `OPS_DASHBOARD_TOKEN`, `OPS_DEGRADED_WEBHOOK`)

- VPS timer template:
  - `ops/systemd/persian-tools-ops-snapshot-production.service`
  - `ops/systemd/persian-tools-ops-snapshot-production.timer`
  - setup notes: `ops/systemd/README.md`

5. Capture a production health window (6 runs, 30s interval):
   - `pnpm admin:ops:window`

Exit criteria:

1. `enterprise-release` phase passes end-to-end.
2. Release tag is created for the target version.
3. Production symlink/process/health checks match the released commit.
4. Release registry, readiness dashboard, and release checklist all point to the same shipped version and evidence set.

## Production Hardening Status

Completed in current local pass:

1. CSP tightening is done for the remaining `style-src-attr` fallback and covered by unit/E2E checks.
2. Lighthouse trend/budget summary generation is wired into CI artifacts.
3. Docs link checking and broader accessibility smoke coverage are in place as quality gates.

Remaining production work is now follow-up tuning only, not a known release blocker.

## Governance Rules

1. No stage is accepted without executable evidence (tests/contracts/reports).
2. Runtime behavior on VPS is final truth, not docs alone.
3. Keep roadmap, scripts, and reports synchronized after each major step.
