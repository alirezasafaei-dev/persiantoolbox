# PersianToolbox — Next-Phase Backlog (Reality-Based)

This file summarizes the current next-phase execution stance.

- Canonical task list: `TASKS.md`
- Task specifications: `tasks-next/*.md`
- Real phased plan: `docs/ROADMAP_REAL.md`

## Current Truth

- Completed tasks: `24/24`
- Remaining tasks: `0/24`
- NP0 gate closed: all NP0 tasks DONE
- Production runtime is healthy and latest verified deploy is successful.
- Enterprise release automation now includes `node scripts/roadmap/execute.mjs --phase enterprise-release`.
- Deploy workflow snapshot automation is available via `pnpm release:workflow:snapshot`.
- Latest enterprise-release run: `2026-02-27T06:21:28Z` (PASS) with report in `.codex/roadmap-runs/20260227T062128Z/`.
- Active production deploy run: `22475851589` for commit `bff7749` (completed with `success` at `2026-02-27T06:53:40Z`).
- Latest deploy workflow snapshot: `docs/deployment/reports/workflow-deploy-production-run-22475517488-2026-02-27T06-40-51-765Z.md`.
- Production visibility marker rollout in progress: add `GET /api/version`, include `version/commit` in `GET /api/ready`, and show live version in footer.
- Footer IA/content refactor completed in codebase: 3-column Persian structure, fixed 2026 copyright line, and left-side developer attribution link.
- `/asdev` profile page rebrand completed in codebase: hero/title/content updated to "علیرضا صفایی مهندس سیستم های وب", header quick-link buttons removed, network/signature sections removed, and collaboration CTA added.
- `/terms` page expanded with structured legal usage sections and explicit Iran-law compliance statement.
- `/refer` page upgraded to interactive share actions: reveal options for copy-link, SMS share, and Telegram share.
- UI routing fix completed for homepage CTAs: "همه ابزارها" now routes to `/topics` (category-first) and "ابزارهای تخصصی" now routes to `/tools/specialized`.
- New dedicated specialized tools route added at `/tools/specialized` to show real categorized tool listings without forcing finance-first context.
- Navbar cleanup completed: "شروع ابزارها" CTA removed from desktop and mobile nav menus.
- `/asdev` hero badge text updated to exact branding string: "Alireza Safaei | Web Systems Engineering".
- `/how-it-works` expanded with workflow steps, output quality checklist, and quick route links.
- Address transliteration quality upgrade completed for `/text-tools/address-fa-to-en`: added phrase overrides for common Iranian names (e.g. `ایران -> Iran`, `ولیعصر -> Valiasr`) and stronger Persian text normalization to reduce spelling errors in output.
- Address transliteration v2 completed: extended Iran-focused dictionary coverage (multi-word provinces/cities/streets), directional/address concepts (`North/South/East/West`, `Crossroad`, `Corner of`), and token-level title handling (`شهید -> Shahid`, `فرعی -> Sub`) for more realistic postal output.
- Address transliteration v3 completed in codebase: dual output modes (`strict-postal`, `readable`), in-tool error-report payload generation, and map-open actions for internal map providers (`Neshan`, `Balad`).
- Validation status for v3:
  - `pnpm -s vitest --run features/text-tools/address-fa-to-en.test.ts` => PASS (`6/6`)
  - `pnpm -s typecheck` => PASS
- Staging deployment refreshed with address-tool upgrades: release `20260227T110430Z-staging-v3.0.6-closeout` is active on `persian-tools-staging`.
- Local SSH access has been restored and validated: `deploy@185.3.124.93` over port `22` is reachable using `~/.ssh/id_ed25519`.
- Staging deploy for address-tool v3 completed: release `20260227T110430Z-staging-v3.0.6-closeout` is active on `persian-tools-staging` (`/var/www/persian-tools/current/staging`).
- Staging runtime checks after deploy:
  - `http://127.0.0.1:3001/api/health` => `200`
  - `https://staging.persiantoolbox.ir/api/health` => `200`
  - `https://staging.persiantoolbox.ir/api/version` => `200` (`version: 3.0.6`)
- Production deploy completed: release `20260227T110430Z-production-v3.0.6-closeout` is active on `persian-tools-production` (`/var/www/persian-tools/current/production`).
- Production runtime checks after deploy:
  - `http://127.0.0.1:3000/api/health` => `200`
  - `https://persiantoolbox.ir/api/health` => `200`
  - `https://persiantoolbox.ir/api/version` => `200` (`version: 3.0.6`)
- Release registration completed on repository:
  - commit: `dd18f02`
  - tag: `v3.0.6` (annotated)
  - remote sync: `main` and `v3.0.6` pushed to `origin`
- Direct SSH verification to VPS is currently available from this workstation and staging deploy validation is passing.

## Execution Rule

All NP0/NP1/NP2 tasks are closed for this release train.
No timeline commitments here; only dependency-driven sequencing.
