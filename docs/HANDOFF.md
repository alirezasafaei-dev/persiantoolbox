# PersianToolbox Handoff - 2026-07-05

## Current Production Status

- Site: `https://persiantoolbox.ir`
- Latest local commit: `117e240777e1 docs: record performance deploy verification` (pushed to `origin/main`)
- Latest deployed production commit: `117e240777e1` from successful `bash deploy-vps-auto.sh` on 2026-07-05.
- Deploy command used most recently: `bash deploy-vps-auto.sh`.
- Deploy status: performance/deploy automation release verified. PM2 online, standalone clean, live symlink points at the active release.
- Health: `/api/health` OK with `commit:"117e240777e1"`, database OK, Redis OK.
- Full live testing (2026-07-05): all sampled core pages, categories, flagship tools, SEO tools returned 200 with correct CSS hash. No [object Object] in content. Security headers good. 404 + redirects work. Standalone on VPS clean after guards.
- PM2: `persiantoolbox` restarted successfully through the release-based deploy flow and was online after deploy.
- Health: `/api/health` returned `status:"ok"` with database OK, Redis OK, `commit:"117e240777e1"`, `branch:"main"`, and `builtAt:"2026-07-05T12:30:00Z"`.
- HTTP checks: mandatory post-deploy sequence passed for 10 key pages; `/`, `/loan`, `/sitemap.xml`, and `/robots.txt` returned 200 on follow-up checks.
- Redirect checks: `https://www.persiantoolbox.ir/`, `/loan`, and `/loan?x=1` redirected to non-www with path/query preserved.
- Indexing files: `/sitemap.xml` and `/robots.txt` returned 200.
- Canonical smoke checks: homepage canonical was `https://persiantoolbox.ir`; `/loan` canonical was `https://persiantoolbox.ir/loan`.
- Content smoke: fetched homepage and `/loan` HTML had `[object Object]` count `0`.
- Version endpoint: `/api/version` returned version `7.8.0`, `commit:"117e240777e1"`, `branch:"main"`, and `builtAt:"2026-07-05T12:30:00Z"`.
- VPS health monitor: cron was de-duplicated and `health-monitor.sh` now uses a lock plus retry behavior before restarting PM2. The 15:20 UTC monitor run completed all clear.

## Completed Work (2026-07-05 session highlights + prior)

- CSS/styles breakage after incomplete 7.8.0 deploy diagnosed and recovered (stale nginx cache + prior standalone pollution).
- Deploy scripts hardened (deploy-vps-auto.sh, quick-deploy.sh): server.js check, static mkdir, source pollution auto-clean guard, robust nginx cache purge (no silent fail, subdir rm + chown + report), X-Cache-Status in verify.
- Defensive fallback added to `createToolOgImage` (try/catch + simple fallback) to prevent transient OG build failures from aborting full production builds.
- Extensive deep live testing of entire site (curl + UA sim + open_page + SSH logs + status sweeps + content inspection):
  - All key pages, hubs, flagship tools (PDF, resume, writing, document studio, finance, contracts, new SEO tools), blog articles: 200 + correct assets.
  - No widespread render issues; schemas present; security headers good.
  - Server state verified clean.
- Prior work items from 07-04 remain (homepage, canonicals, etc.).
- Tool-count consistency documented and tested: registry `97`, active tools `87`, display/indexable tools `86`, label `۸۶`.
- Accessibility fixes shipped: missing H1 on image resize page, mobile nav `inert`, accessible Enamad links, dark-mode contrast, heading order, visible focus checks.
- Mobile overflow fixes shipped for blog/toast/loading surfaces.
- Structured data cleanup and validation completed for audited pages.
- Browser DOM audit completed for key pages.
- Local Lighthouse completed for homepage, `/loan`, `/salary`, and one PDF tool page.
- Build/typecheck/lint/tests passed before commit and deploy.
- Release traceability is now live through `/api/version`, `/api/ready`, and `/api/health`.
- CSP report-only nonce target is live alongside the compatible enforced CSP that still permits `unsafe-inline`.
- `/loan` hydration work was reduced by removing motion wrappers from the hot path and server-rendering JSON-LD.
- Deploy and health monitor checks were hardened to avoid false failures from local proxy/cold asset checks.
- Production Lighthouse was archived at `docs/release/reports/lighthouse-production-2026-07-04T1520Z/`.
- PWA install-route burst was fixed by removing heavy route documents from shell precache.
- Homepage search is lazy/deferred through `LazyToolSearch`.
- `/blog` initial payload is split: first 12 posts are SSR, full index loads on demand from `/api/blog/posts`.
- Release-based deploy automation is live: isolated release dir, stable live symlink, deploy lock, commit verification, warmup, nginx cache purge, and rollback.

## Verified Commands And Results

- `pnpm typecheck` - PASS.
- `pnpm lint` - PASS with 289 warnings, 0 errors.
- `pnpm build` - PASS, 869 routes/pages generated.
- `pnpm vitest --run` - PASS, 1263 tests.
- `bash deploy-vps-auto.sh` - PASS; QA gate, rsync, VPS build, PM2 restart, warmup, commit verification, nginx cache purge, and public verification completed for commit `117e240777e1`.
- Mandatory production health sequence - PASS; health OK, 10 key pages HTTP 200, CSS HTTP 200, font HTTP 200.
- `/api/health` - OK with database/Redis OK and release metadata.
- `/api/version` - version `7.8.0`, `commit:"117e240777e1"`, `branch:"main"`, `builtAt:"2026-07-05T12:30:00Z"`.

## Local Lighthouse Results

- `/`: Performance 83, Accessibility 100, Best Practices 100, SEO 100.
- `/loan`: Performance 78, Accessibility 100, Best Practices 100, SEO 100.
- `/salary`: Performance 85, Accessibility 100, Best Practices 100, SEO 100.
- `/pdf-tools/compress/compress-pdf`: Performance 89, Accessibility 100, Best Practices 100, SEO 100.

## Production Lighthouse Results — 2026-07-04

- Baseline before the latest `/loan` hot-path cleanup: `/` Performance 75; `/loan` Performance 74, LCP 2.2s, CLS 0, TBT 960ms.
- Latest deployed commit `782d4638b792`: `/` Performance 82, Accessibility 100, Best Practices 92, SEO 100; LCP 2.5s, CLS 0, TBT 510ms.
- Latest deployed commit `782d4638b792`: `/loan` warm Performance 84, Accessibility 100, Best Practices 92, SEO 100; LCP 1.9s, CLS 0, TBT 540ms. Cold run scored 76 because the root document response was 6.6s.
- Reports: `docs/release/reports/lighthouse-production-2026-07-04T1520Z/`.
- Caveat: Lighthouse Chrome logged `Inspector.targetCrashed` during collection, but exited 0 and produced JSON/HTML reports.

## Production Performance Notes — 2026-07-05

- `/blog` HTML payload reduced from about 416KB to about 300KB by deferring the full article index.
- Live curl timings after deploy: `/blog` total about 1.9s, `/writing-tools/persian-writing-studio` about 1.7s, `/tools` about 2.1-2.5s.
- Homepage still ships about 360KB HTML and live TTFB is typically 1.3-1.6s, so the next performance phase should target homepage SSR/cache and below-the-fold splitting.
- `/api/blog/posts` is static/revalidated and only fetched when search/filter/sort/pagination needs the full index.

## Remaining Risks / Technical Debt

- Production Lighthouse Performance is improved but still below the 95+ target: `/loan` warm scored 84 with TBT 540ms, and homepage still has high HTML/TTFB. Continue reducing client work, splitting below-the-fold content, and adding cache/static behavior for public pages.
- CSP enforcement still uses `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` so prerendered Next.js pages keep hydrating. Local code now also emits a nonce-backed `Content-Security-Policy-Report-Only` target without broad script/style `unsafe-inline`; full enforcement is blocked until static inline Next.js scripts/JSON-LD and React inline style attributes are migrated or route-scoped dynamic rendering is explicitly accepted.
- `/loan` local Lighthouse Performance was 78 before deploy; production warm Lighthouse after the latest deploy scored 84, so the immediate regression is resolved and deeper optimization remains.
- 289 lint warnings remain after the latest local cleanup: `no-non-null-assertion`, `no-nested-ternary`, `react-hooks/exhaustive-deps`, and `no-img-element` dominate. `no-console` is cleared.
- The named build warnings are resolved locally: stale Browserslist data was updated, redundant `/_next/static` Cache-Control override was removed, and Turbopack's admin ops logs NFT trace warning is suppressed via a narrow `outputFileTracingExcludes` entry. `pnpm build` verified these warnings are gone; the unrelated edge-runtime static-generation notice remains.
- Deeper UX/a11y/performance audit still needed for remaining tool pages.
- Staging remains down and still needs `deploy-staging.sh` plus full health verification.

## Where To Continue Next

1. Run production Lighthouse mobile after the 2026-07-05 lazy/deferred performance deploy and archive reports for `/`, `/blog`, `/tools`, `/loan`, and one flagship tool page.
2. Continue homepage performance work: reduce 360KB HTML, split/defer below-the-fold sections, and make public landing pages cache/static friendly.
3. Evaluate CDN/full-page cache for public pages; target repeat loads under 1s without breaking auth/admin/private routes.
4. Monitor/fix logged issues from deep testing: client reference manifest for /blog/[slug], occasional hydration #418 reports (e.g. text tools on mobile), 500.html edge cases.
5. Continue CSP hardening: review report-only violations, migrate inline JSON-LD/styles, then enforce nonce/hash CSP without breaking static hydration.
6. Continue monitoring `/api/version`, `/api/ready`, and `/api/health` release metadata after future deploys.
7. Continue `/loan` TBT work toward Lighthouse 95+.
8. Reduce remaining lint warnings in focused batches.
9. Restore and verify staging.
10. Do not redo completed canonical/homepage work unless a regression is found.

**2026-07-05 Testing Notes (from full live audit):**

- Post-recovery + deploy: all sampled pages 200 with matching CSS. Standalone clean thanks to new guards.
- Noted server log warnings (no user impact yet but track): blog dynamic manifest, one client hydration error.
- Cold starts still slow on first hit for heavy pages — expected.
- Recommend adding more automated post-deploy content/asset diff checks in future.
