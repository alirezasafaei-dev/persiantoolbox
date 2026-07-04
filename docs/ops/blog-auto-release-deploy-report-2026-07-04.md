# Blog Auto Release Deploy Report - 2026-07-04

## Auto-deploy Safety

- deploy-production push trigger removed: yes
- workflow_dispatch retained: yes
- safety PR merged: yes
- safety PR: #116 `fix(ci): make production deployment manual-only`
- safety merge SHA: `a530738a4ecf336638a9564ea273dbb7e548510a`
- deploy workflow status after safety merge: active, manual-only
- production deploy job retained: yes

## PR #115

- PR: #115 `feat(blog): prepare product-grade blog quality fixes`
- branch: `release/blog-product-grade-ready`
- merged: yes
- merge SHA: `edee702686f5d85451a1da4a10a991eced7343a3`
- main lint follow-up SHA: `36247d92260c678dbf3e7a6e9ea9c51c83c64b79`
- changed files summary: blog metadata, blog cards/editorial UI, taxonomy normalization, WebP screenshot pipeline, image audit tooling, blog documentation, generated optimized blog images

## Validation Before Deploy

- typecheck: passed on `36247d92260c678dbf3e7a6e9ea9c51c83c64b79`
- lint: passed with existing warning baseline, 0 errors
- build: passed
- vitest: passed, 148 files and 1238 tests
- blog image audit: passed, 126 posts scanned, 0 errors, 142 warnings
- screenshot dry-run: passed, WebP format planned with quality 85, 1200x630
- local smoke: passed, 11 localhost route checks
- `[object Object]` built blog check: passed, no matches in built blog output

## Deployment

- deploy run: attempted
- deploy method: GitHub Actions `workflow_dispatch` for `.github/workflows/deploy-production.yml`
- deploy SHA requested: `36247d92260c678dbf3e7a6e9ea9c51c83c64b79`
- workflow run: https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/28721156303
- run_migrations value: `false`
- status: failed before runner allocation; no checkout, no VPS deploy, no production mutation
- failure evidence: GitHub annotation said the job was not started because recent account payments failed or the spending limit must be increased

## Production Verification

- pre-deploy `/api/health`: ok, production commit `782d4638b792`
- pre-deploy `/api/version`: version `7.7.0`, production commit `782d4638b792`
- pre-deploy `/`: HTTP 200
- pre-deploy `/blog`: HTTP 200
- pre-deploy `/robots.txt`: HTTP 200
- pre-deploy `/sitemap.xml`: HTTP 200
- post-failed-deploy `/api/health`: ok, still production commit `782d4638b792`
- post-failed-deploy `/api/version`: still production commit `782d4638b792`
- sample article and og:image production checks: not run against new release because deployment did not occur

## Rollback

- rollback needed: no
- rollback executed: no
- rollback result: not applicable; deployment failed before production was touched

## Final State

- production healthy: yes, still on pre-existing commit `782d4638b792`
- origin/main release candidate SHA: `36247d92260c678dbf3e7a6e9ea9c51c83c64b79`
- production deployed to requested SHA: no
- blocker: GitHub Actions hosted runner billing/spending limit prevents manual deploy workflow execution
- production untouched before deploy attempt: yes
- deploy completed intentionally: no

## Manual Follow-up Needed

1. Resolve GitHub Actions billing/spending-limit blocker for `alirezasafaei-dev/persiantoolbox`.
2. Re-run manual workflow dispatch for `deploy-production.yml` using release ref `36247d92260c678dbf3e7a6e9ea9c51c83c64b79`, `run_migrations=false`.
3. After successful workflow completion, run production smoke checks for `/api/health`, `/api/version`, `/`, `/blog`, `/robots.txt`, `/sitemap.xml`, one article page, article `og:image`, and `[object Object]`.
