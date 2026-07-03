# PersianToolbox Handoff - 2026-07-02

## Current Production Status

- Site: `https://persiantoolbox.ir`
- Latest pushed commit: `6608314e fix: complete final seo ux accessibility qa pass`
- Deploy command used: `bash deploy-vps-auto.sh`
- Deploy status: succeeded on 2026-07-02 after explicit approval.
- PM2: `persiantoolbox` restarted successfully and was online after deploy.
- Health: `/api/health` returned `status:"ok"` with database OK and Redis OK.
- HTTP checks: `/` and `/loan` returned 200.
- Redirect checks: `https://www.persiantoolbox.ir/`, `/loan`, and `/loan?x=1` redirected to non-www with path/query preserved.
- Indexing files: `/sitemap.xml` and `/robots.txt` returned 200.
- Canonical smoke checks: homepage canonical was `https://persiantoolbox.ir`; `/loan` canonical was `https://persiantoolbox.ir/loan`.
- Content smoke: fetched homepage and `/loan` HTML had `[object Object]` count `0`.
- Version endpoint: `/api/version` returned version `7.7.0` and `commit:null`; production commit hash is UNVERIFIED from the app. Local code now prepares deploy-time release stamping via `.env.release`, but this is pending an approved production deploy and live verification.

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

## Verified Commands And Results

- `pnpm typecheck` - PASS.
- `pnpm lint` - PASS with 302 warnings, 0 errors.
- `pnpm build` - PASS, 833 pages generated.
- `pnpm vitest --run` - PASS, 1235 tests.
- `bash deploy-vps-auto.sh` - PASS.
- Production curl checks - PASS for homepage, `/loan`, www redirects, sitemap, and robots.
- `/api/health` - OK with database/Redis OK.
- `/api/version` - version `7.7.0`, `commit:null`.

## Local Lighthouse Results

- `/`: Performance 83, Accessibility 100, Best Practices 100, SEO 100.
- `/loan`: Performance 78, Accessibility 100, Best Practices 100, SEO 100.
- `/salary`: Performance 85, Accessibility 100, Best Practices 100, SEO 100.
- `/pdf-tools/compress/compress-pdf`: Performance 89, Accessibility 100, Best Practices 100, SEO 100.

## Remaining Risks / Technical Debt

- UNVERIFIED: production git commit hash in `/api/version`; endpoint currently reports `commit:null`. Local implementation is prepared for the next deploy: `deploy-vps-auto.sh` stamps commit/branch/build time, PM2 loads `.env.release`, and version/ready/health expose those fields.
- CSP enforcement still uses `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` so prerendered Next.js pages keep hydrating. Local code now also emits a nonce-backed `Content-Security-Policy-Report-Only` target without broad script/style `unsafe-inline`; full enforcement is blocked until static inline Next.js scripts/JSON-LD and React inline style attributes are migrated or route-scoped dynamic rendering is explicitly accepted.
- UNVERIFIED: production Lighthouse after deploy.
- `/loan` local Lighthouse Performance was 78. Local optimization is prepared: secondary saved/share widgets are deferred and render-time form rebuilding/stringifying was reduced; pending approved deploy and fresh production Lighthouse.
- 288 lint warnings remain after the latest local cleanup: `no-non-null-assertion` 182, `no-nested-ternary` 85, `react-hooks/exhaustive-deps` 10, `no-img-element` 11. `no-console` is cleared.
- The named build warnings are resolved locally: stale Browserslist data was updated, redundant `/_next/static` Cache-Control override was removed, and Turbopack's admin ops logs NFT trace warning is suppressed via a narrow `outputFileTracingExcludes` entry. `pnpm build` verified these warnings are gone; the unrelated edge-runtime static-generation notice remains.
- Deeper UX/a11y/performance audit still needed for remaining tool pages.
- Production release traceability needs improvement.

## Where To Continue Next

1. Run `git status --short --branch` and confirm the repo is clean.
2. Check production health with `curl -s https://persiantoolbox.ir/api/health`.
3. Deploy only after explicit approval, then verify `/api/version` shows commit/branch/build time.
4. Run production Lighthouse and record scores.
5. Continue CSP hardening: review report-only violations, migrate inline JSON-LD/styles, then enforce nonce/hash CSP without breaking static hydration.
6. Deploy the prepared `/loan` performance optimization after approval, then rerun Lighthouse and compare against the previous local Performance score of 78.
7. Reduce lint warnings in focused batches.
8. Do not redo completed canonical/homepage work unless a regression is found.
