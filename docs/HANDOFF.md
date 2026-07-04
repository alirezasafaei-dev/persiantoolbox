# PersianToolbox Handoff - 2026-07-04

## Current Production Status

- Site: `https://persiantoolbox.ir`
- Latest pushed commit: `931f4b1a docs: record production deploy verification`
- Latest deployed production commit: `122ef429746d` on `main`
- Deploy command used most recently: `bash deploy-vps-auto.sh`
- Deploy status: succeeded on 2026-07-04 after SSH access was restored.
- PM2: `persiantoolbox` restarted successfully with `pm2 restart` and was online after deploy.
- Health: `/api/health` returned `status:"ok"` with database OK, Redis OK, `commit:"122ef429746d"`, `branch:"main"`, and `builtAt:"2026-07-04T14:05:34Z"`.
- HTTP checks: mandatory post-deploy sequence passed for 10 key pages; `/`, `/loan`, `/sitemap.xml`, and `/robots.txt` returned 200 on follow-up checks.
- Redirect checks: `https://www.persiantoolbox.ir/`, `/loan`, and `/loan?x=1` redirected to non-www with path/query preserved.
- Indexing files: `/sitemap.xml` and `/robots.txt` returned 200.
- Canonical smoke checks: homepage canonical was `https://persiantoolbox.ir`; `/loan` canonical was `https://persiantoolbox.ir/loan`.
- Content smoke: fetched homepage and `/loan` HTML had `[object Object]` count `0`.
- Version endpoint: `/api/version` returned version `7.7.0`, `commit:"122ef429746d"`, `branch:"main"`, and `builtAt:"2026-07-04T14:05:34Z"`.

## Completed Work

- Homepage UI/UX and SEO improvements shipped and deployed.
- Canonical non-www enforcement shipped.
- WWW redirect via nginx/proxy verified.
- Sitemap, robots, canonical, OG, and Twitter URL cleanup completed.
- Blog `[object Object]` rendering issue fixed.
- Tool-count consistency documented and tested: registry `97`, active tools `87`, display/indexable tools `86`, label `۸۶`.
- Accessibility fixes shipped: missing H1 on image resize page, mobile nav `inert`, accessible Enamad links, dark-mode contrast, heading order, visible focus checks.
- Mobile overflow fixes shipped for blog/toast/loading surfaces.
- Structured data cleanup and validation completed for audited pages.
- Browser DOM audit completed for key pages.
- Local Lighthouse completed for homepage, `/loan`, `/salary`, and one PDF tool page.
- Build/typecheck/lint/tests passed before commit and deploy.
- Release traceability is now live through `/api/version`, `/api/ready`, and `/api/health`.
- CSP report-only nonce target is live alongside the compatible enforced CSP that still permits `unsafe-inline`.
- Production Lighthouse was archived at `docs/release/reports/lighthouse-production-2026-07-04T1417Z/`.

## Verified Commands And Results

- `pnpm typecheck` - PASS.
- `pnpm lint` - PASS with 288 warnings, 0 errors.
- `pnpm build` - PASS, 833 pages generated.
- `pnpm vitest --run` - PASS, 1238 tests.
- `bash deploy-vps-auto.sh` - PASS; rsync, VPS build, static asset copy, PM2 restart, warmup, and verification completed.
- Mandatory production health sequence - PASS; health OK, 10 key pages HTTP 200, CSS HTTP 200, font HTTP 200.
- `/api/health` - OK with database/Redis OK and release metadata.
- `/api/version` - version `7.7.0`, `commit:"122ef429746d"`, `branch:"main"`, `builtAt:"2026-07-04T14:05:34Z"`.

## Local Lighthouse Results

- `/`: Performance 83, Accessibility 100, Best Practices 100, SEO 100.
- `/loan`: Performance 78, Accessibility 100, Best Practices 100, SEO 100.
- `/salary`: Performance 85, Accessibility 100, Best Practices 100, SEO 100.
- `/pdf-tools/compress/compress-pdf`: Performance 89, Accessibility 100, Best Practices 100, SEO 100.

## Production Lighthouse Results — 2026-07-04

- `/`: Performance 75, Accessibility 100, Best Practices 92, SEO 100; LCP 2.8s, CLS 0.047, TBT 380ms.
- `/loan`: Performance 74, Accessibility 100, Best Practices 92, SEO 100; LCP 2.2s, CLS 0, TBT 960ms.
- Reports: `docs/release/reports/lighthouse-production-2026-07-04T1417Z/`.

## Remaining Risks / Technical Debt

- Production Lighthouse Performance is still below target: `/loan` scored 74 after deploy, with TBT 960ms. This remains the next performance priority.
- CSP enforcement still uses `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` so prerendered Next.js pages keep hydrating. Local code now also emits a nonce-backed `Content-Security-Policy-Report-Only` target without broad script/style `unsafe-inline`; full enforcement is blocked until static inline Next.js scripts/JSON-LD and React inline style attributes are migrated or route-scoped dynamic rendering is explicitly accepted.
- `/loan` local Lighthouse Performance was 78 before deploy; production Lighthouse after deploy scored 74, so further optimization is still needed.
- 288 lint warnings remain after the latest local cleanup: `no-non-null-assertion` 182, `no-nested-ternary` 85, `react-hooks/exhaustive-deps` 10, `no-img-element` 11. `no-console` is cleared.
- The named build warnings are resolved locally: stale Browserslist data was updated, redundant `/_next/static` Cache-Control override was removed, and Turbopack's admin ops logs NFT trace warning is suppressed via a narrow `outputFileTracingExcludes` entry. `pnpm build` verified these warnings are gone; the unrelated edge-runtime static-generation notice remains.
- Deeper UX/a11y/performance audit still needed for remaining tool pages.
- Production release traceability needs improvement.

## Where To Continue Next

1. Run `git status --short --branch` and confirm the repo is clean.
2. Check production health with `curl -s https://persiantoolbox.ir/api/health`.
3. Investigate `/loan` production TBT/Lighthouse Performance and reduce the score gap.
4. Continue monitoring `/api/version`, `/api/ready`, and `/api/health` release metadata after future deploys.
5. Continue CSP hardening: review report-only violations, migrate inline JSON-LD/styles, then enforce nonce/hash CSP without breaking static hydration.
6. Reduce remaining lint warnings in focused batches.
7. Reduce lint warnings in focused batches.
8. Do not redo completed canonical/homepage work unless a regression is found.
