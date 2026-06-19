# Codex Handoff - 2026-04-26 Production Hardening Follow-up

## Done

- Removed the remaining CSP `style-src-attr 'unsafe-inline'` fallback in `proxy.ts`.
- Replaced inline-width progress indicators with shared `shared/ui/ProgressBar.tsx` across affected PDF/image tool flows.
- Added `scripts/quality/check-doc-links.mjs` and wired it into `pnpm ci:contracts` as `pnpm quality:docs-links:check`.
- Added `scripts/quality/summarize-lighthouse-ci.mjs` and attached `docs/release/reports/lighthouse-trend-summary.json` to `.github/workflows/lighthouse-ci.yml` artifacts.
- Expanded Playwright a11y coverage for `/guides`, `/guides/salary-estimation-workflow`, and `/pdf-tools/compress/compress-pdf`.
- Updated salary/security Playwright assertions to match the hardened CSP and localized 1405 salary UI values.
- Synced roadmap/readiness docs so production hardening status is reflected in canonical tracking files.

## Validated

- `node -v` -> `v22.22.0`
- `npm -v` -> `11.6.2`
- `pnpm -v` -> `9.15.0`
- `pnpm exec playwright --version` -> `Version 1.58.1`
- `pnpm -s vitest --run tests/unit/proxy-csp.test.ts features/salary/salary.logic.test.ts tests/unit/salary-laws-contract.test.ts tests/unit/salary-laws-cache-route.test.ts tests/unit/high-traffic-tools-async-state.test.tsx`
- `pnpm quality:docs-links:check`
- `pnpm quality:links:check`
- `pnpm -s typecheck`
- `PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/tools.spec.ts --project=chromium --grep "salary" --reporter=list`
- `PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/security-headers.spec.ts --project=chromium --reporter=list`
- `PLAYWRIGHT_SKIP_FIREFOX=1 PLAYWRIGHT_DISABLE_VIDEO=1 pnpm exec playwright test tests/e2e/a11y.spec.ts --project=chromium --reporter=list`

## Environment Note

- `pnpm exec playwright install chromium ffmpeg` still hit repeated `ECONNRESET` against the Playwright CDN in this environment.
- Local system browsers are available at `/usr/bin/google-chrome` and `/usr/bin/chromium-browser`, and Playwright ran successfully against that fallback path.
- Selenium/WebDriver fallback root is available at `/home/dev/Project/selenium-websrivers` but was not needed because system Chrome was sufficient.

## Restart Point

- Start from `docs/codex-handoff-2026-04-26-prod-hardening-followup.md`
- Snapshot: `.codex/snapshots/20260426T124509Z/`
- Last validated baseline commit before this pass: `55d594b`
