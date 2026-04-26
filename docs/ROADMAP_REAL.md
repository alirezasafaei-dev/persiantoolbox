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

Execution path:

1. `node scripts/roadmap/execute.mjs --phase enterprise-release`
2. Capture workflow deployment snapshot:
   - `pnpm release:workflow:snapshot`
3. Verify generated artifacts in:
   - `docs/deployment/reports`
   - `docs/release/reports`
4. Publish version and monitor production health checks.

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
