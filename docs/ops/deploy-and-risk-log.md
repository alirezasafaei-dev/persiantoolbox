# Deploy and Risk Log — PersianToolbox

## 2026-07-05 — CSS recovery after incomplete 7.8.0 deploy, deploy script hardening, full live site testing

**Deployed:** YES (manual recovery + successful `bash deploy-vps-auto.sh`)
**Risk:** MEDIUM (live production CSS breakage + build transient + script changes)
**Production:** https://persiantoolbox.ir
**Deploy command:** manual VPS recovery then `bash deploy-vps-auto.sh`

### Diagnosis & Root Causes
- Live site served HTML referencing old CSS hash (e.g. `0_2agma0chojd.css` → 404) while current build had `2zl7eqzrd30v1.css`.
- Nginx cache (`X-Cache-Status: HIT`) was serving stale HTML from previous build (purge in script used `find -delete || true` which could silently fail).
- `.next/standalone/` was polluted with full source tree (app/, deploy scripts, etc.) from prior bad copy ops — caused BUILD_ID mismatch and asset inconsistency. `ls .next/standalone/` showed 60+ files instead of clean server.js + .next + public.
- During one build attempt: transient OG image prerender timeout (`fetch failed ETIMEDOUT` on date-difference opengraph-image) aborted the build.
- PM2 was serving old process; verification in script had passed in past but state regressed.

### Changes Made
**Live recovery (via SSH):**
- `pm2 stop`, `rm -rf .next`, full rebuild with correct `NODE_OPTIONS`, `NEXT_PUBLIC_*`, `RELEASE_*` envs.
- `rm -rf .next/standalone/.next/static`, `cp -r .next/static ...`, public copy, `chmod -R o+rX`.
- Aggressive cache purge: `find /var/cache/nginx/persiantoolbox -type f -delete`, `rm -rf .../pages .../api`, `mkdir`, `chown www-data`, `nginx -t && reload`.
- `pm2 restart ecosystem.config.js --update-env`, wait health loop, warmup.

**Deploy script hardening (deploy-vps-auto.sh + quick-deploy.sh):**
- Added explicit `server.js` existence check after build.
- `mkdir -p .next/standalone/.next` before static copy.
- Pollution guard: after copy, detect source files (app/, lib/, AGENTS.md, package.json, deploy-*.sh) in `.next/standalone/` top level and auto `find ... -exec rm -rf`.
- Robust nginx purge:
  - No silent `|| true` hiding sudo errors.
  - Explicit `rm -rf` on subpaths + recreate + `chown www-data`.
  - `nginx -t` check + report success/failure.
  - Echo "Purging nginx cache..." and results.
- Report `X-Cache-Status` during outer verification.
- Better error messages pointing to full script re-run.

**Build resilience:**
- Added `try { new ImageResponse(...) } catch { fallback simple ImageResponse }` in `lib/og-image.tsx:createToolOgImage`.
- Prevents one transient rasterizer/emoji/font/internal fetch error from killing entire production build (866+ pages + OGs).

### Verification Performed (deep live testing)
- Full New Agent Checklist + QA gate (typecheck, lint 0 errors, 1262 vitest tests PASS).
- Post-deploy mandatory sequence: health OK, 10+ key pages 200, CSS/font/worker 200, sitemap/robots 200, www redirect, canonicals.
- Broad status sweeps: all core pages, categories (pdf, date, business, career, writing, seo, contract, validation, finance), flagship tools, SEO tools — 200.
- Content inspection (open_page + grep): no [object Object] on sampled pages, proper H1/titles, schema present (BlogPosting etc.), forms/inputs in tools.
- Headers: CSP, HSTS, security headers good on multiple pages (desktop + mobile UA).
- Server-side (SSH): standalone clean (only expected files), assets counts correct, PM2 online, recent logs analyzed.
- Blog dynamic + articles: 200 + schema.
- 404, redirects, query params, cold vs cached behavior checked.
- Lighthouse production run and archived.

**Findings from testing:**
- Styles now load correctly everywhere (the original user-reported issue resolved).
- Site healthy for users.
- Noted in logs (to monitor/fix later): occasional `client reference manifest` for `/blog/[slug]`, one client-reported React #418 hydration on a text tool (from real mobile UA), 500.html load note.
- Cold starts still 20-40s on heavy pages (blog/tools) — normal but documented.

**Production Lighthouse**
Reports in `docs/release/reports/lighthouse-production-2026-07-05T0950Z/`.

### Notes
- Used `bash deploy-vps-auto.sh` (second attempt succeeded after transient OG timeout in first).
- Pollution guard and improved purge fired/verified during the run.
- All per AGENTS.md rules followed (checklist, gates, no auto-deploy without context, sudo for cache, etc.).

## 2026-07-04 — Commit 782d4638b792

**Deployed:** YES
**Risk:** LOW-MEDIUM (`/loan` client hot-path cleanup plus deploy/monitoring hardening)
**Production:** https://persiantoolbox.ir
**Deploy command:** `bash deploy-vps-auto.sh`

### Changes

- `/loan` now avoids motion wrappers in its primary interactive path and server-renders JSON-LD without `next/script` hydration overhead.
- `deploy-vps-auto.sh` public verification now bypasses local proxy environment variables to avoid false curl failures.
- `health-monitor.sh` now uses a lock, retries transient health failures, and retries CSS/PDF worker checks before alerting.
- VPS cron was de-duplicated so only one health monitor entry runs every 5 minutes.

### Verification

- Local focused QA before commit:
  - `pnpm exec eslint 'app/(tools)/loan/page.tsx' components/features/loan/LoanPage.tsx` — PASS
  - `pnpm vitest --run tests/unit/high-traffic-tools-async-state.test.tsx features/loan/loan.logic.test.ts` — PASS, 14 tests
  - `pnpm typecheck` — PASS
  - `pnpm build` — PASS
- Deploy:
  - `bash deploy-vps-auto.sh` — PASS
  - QA gate passed: typecheck, lint with 288 warnings / 0 errors, vitest, PDF worker check
  - rsync succeeded
  - VPS build succeeded
  - Static assets verified: 1 CSS, 185 JS, 10 fonts, PDF worker present
  - PM2 restarted with `pm2 restart`; process came online
  - Deploy script warmup and verification passed
- Mandatory production health sequence:
  - `/api/health` returned OK with database/Redis OK and `commit:"782d4638b792"`
  - 10 key pages returned HTTP 200
  - Homepage CSS returned HTTP 200
  - `Vazirmatn-Bold.woff2` returned HTTP 200
- Additional live checks:
  - `/api/version` returned version `7.7.0`, commit `782d4638b792`, branch `main`, builtAt `2026-07-04T15:11:56Z`
  - Manual VPS health monitor run completed without restarting PM2
  - The 15:20 UTC cron monitor run completed all clear

### Production Lighthouse

Reports archived in `docs/release/reports/lighthouse-production-2026-07-04T1520Z/`.

| Route        | Performance | Accessibility | Best Practices | SEO | LCP  | CLS | TBT   | Notes                                  |
| ------------ | ----------- | ------------- | -------------- | --- | ---- | --- | ----- | -------------------------------------- |
| `/`          | 82          | 100           | 92             | 100 | 2.5s | 0   | 510ms | Improved from previous Performance 75  |
| `/loan` warm | 84          | 100           | 92             | 100 | 1.9s | 0   | 540ms | Improved from Performance 74/TBT 960ms |
| `/loan` cold | 76          | 100           | 92             | 100 | 1.7s | 0   | 540ms | Root document response was 6.6s        |

Lighthouse Chrome logged `Inspector.targetCrashed` during collection, but exited 0 and produced JSON/HTML reports.

### Follow-up

- Continue `/loan` TBT reduction toward Lighthouse 95+.
- Continue CSP migration from report-only nonce target to enforced nonce/hash policy without breaking Next.js hydration.
- Continue reducing lint warnings in focused batches.
- Restore and verify staging.

### Rollback

- Revert `782d4638b792` and `967ac7da5483` if the `/loan` interaction path regresses, then redeploy with `bash deploy-vps-auto.sh`.
- For monitor-only regressions, revert `782d4638b792` and recopy the previous `health-monitor.sh` to the VPS.
- No database or storage migration was introduced.

## 2026-07-04 — Commit 122ef429746d

**Deployed:** YES
**Risk:** MEDIUM-LOW (release metadata, CSP report-only target, `/loan` bundle deferral, build/lint cleanup)
**Production:** https://persiantoolbox.ir
**Deploy command:** `bash deploy-vps-auto.sh`

### Changes

- Release metadata stamping is live for `/api/version`, `/api/ready`, and `/api/health`.
- CSP report-only nonce target is live alongside the compatible enforced CSP.
- `/loan` secondary saved/share widgets are deferred and render-time form rebuilding/stringifying was reduced.
- Build warning cleanup is deployed.
- Lint warnings reduced from 302 to 288; `no-console` is cleared.

### Verification

- Deploy script:
  - `bash deploy-vps-auto.sh` — PASS
  - QA gate passed: typecheck, lint with 288 warnings / 0 errors, vitest, PDF worker check
  - rsync succeeded
  - VPS build succeeded, 833 pages generated
  - Static assets verified: 1 CSS, 185 JS, 10 fonts, PDF worker present
  - PM2 restarted with `pm2 restart`; process came online
  - Deploy script warmup and verification passed
- Mandatory production health sequence:
  - `/api/health` returned OK with database/Redis OK and `commit:"122ef429746d"`
  - 10 key pages returned HTTP 200
  - Homepage CSS returned HTTP 200
  - `Vazirmatn-Bold.woff2` returned HTTP 200
- Additional live checks:
  - `/api/version` returned version `7.7.0`, commit `122ef429746d`, branch `main`, builtAt `2026-07-04T14:05:34Z`
  - `/api/ready` returned ready with the same release metadata
  - CSP report-only header includes a nonce-backed `script-src` and `style-src`
  - `/loan`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200 on retry after cold start

### Production Lighthouse

Reports archived in `docs/release/reports/lighthouse-production-2026-07-04T1417Z/`.

| Route   | Performance | Accessibility | Best Practices | SEO | LCP  | CLS   | TBT   |
| ------- | ----------- | ------------- | -------------- | --- | ---- | ----- | ----- |
| `/`     | 75          | 100           | 92             | 100 | 2.8s | 0.047 | 380ms |
| `/loan` | 74          | 100           | 92             | 100 | 2.2s | 0     | 960ms |

### Follow-up

- Continue `/loan` performance work; production score is still below target and TBT is high.
- Use CSP report-only violations to plan the next nonce/hash enforcement step.
- Continue reducing lint warnings in focused batches.

## 2026-07-03 — Commit 3051b525 deploy attempt

**Deployed:** NO
**Risk:** LOW (deployment stopped before rsync/server mutation)
**Production:** https://persiantoolbox.ir remained healthy on previous deployed build
**Deploy command:** `bash deploy-vps-auto.sh`

### Changes queued on `main`

- Release metadata stamping for `/api/version`, `/api/ready`, and `/api/health`.
- CSP report-only nonce target without broad `unsafe-inline`.
- `/loan` performance optimization by deferring secondary widgets and reducing render-time rebuilding.
- Build warning cleanup.
- Lint warning cleanup from 302 to 288; `no-console` cleared.

### Verification

- Local pre-deploy gate:
  - `pnpm typecheck` — PASS
  - `pnpm lint` — PASS with 288 warnings, 0 errors
  - `pnpm vitest --run` — PASS, 148 files / 1238 tests
  - `pnpm build` — PASS, 833 pages generated
- Deploy script gate:
  - `bash deploy-vps-auto.sh` — QA gate PASS on both attempts
  - Both attempts failed at `=== Step 1: Rsync files ===`
  - Error: `ssh: connect to host 193.93.169.32 port 22: Connection timed out`
- Connectivity checks:
  - `ssh -i /home/dev13/.ssh/id_ed25519 -o BatchMode=yes -o ConnectTimeout=10 ubuntu@193.93.169.32 'echo ok'` — FAIL, timeout
  - `nc -vz -w 10 193.93.169.32 22` — FAIL, timeout
  - `curl https://persiantoolbox.ir/api/health` — PASS, production healthy
  - `curl https://persiantoolbox.ir/api/version` — returned `commit:null`, confirming the new build is not deployed

### Follow-up

- Restore SSH reachability to `193.93.169.32:22`.
- Rerun `bash deploy-vps-auto.sh`.
- After deploy, run the mandatory production health sequence, verify `/api/version` exposes commit/branch/build time, then run and archive production Lighthouse.

## 2026-07-02 — Local build warning cleanup

**Deployed:** NO
**Risk:** LOW (build configuration and lockfile maintenance only)

### Changes

- Removed the redundant custom `Cache-Control` header for `/_next/static/:path*`; Next.js owns immutable static chunk caching.
- Updated Browserslist data through `pnpm dlx update-browserslist-db@latest`.
- Added a narrow `outputFileTracingExcludes` entry for `/api/admin/ops/logs` so Turbopack no longer traces `next.config.mjs` into that route's NFT list.

### Verification

- `pnpm build` — PASS, 833 pages generated.
- Confirmed the stale Browserslist warning, custom Cache-Control warning, and Turbopack NFT trace warning are gone.
- Existing unrelated Next notice remains: using edge runtime on a page disables static generation for that page.

### Follow-up

- Include this cleanup in the next approved deployment.

## 2026-07-02 — Commit 6608314e

**Deployed:** YES
**Risk:** MEDIUM-LOW (SEO/UX/a11y QA fixes plus CSP compatibility change)
**Production:** https://persiantoolbox.ir
**Deploy command:** `bash deploy-vps-auto.sh`

### Changes

- Final SEO/UX/accessibility QA fixes for homepage and important tool pages.
- Image resize page received a meaningful H1 and intro copy.
- Mobile nav closed state now uses `inert`.
- Enamad seal links received accessible labels.
- Dark-mode contrast and heading order issues fixed.
- Blog/toast/loading mobile overflow risks fixed.
- Tool-count consistency locked to registry `97`, active `87`, display/indexable `86`, label `۸۶`.
- CSP adjusted for verified Next.js hydration; still uses `unsafe-inline`.

### Verification

- Pre-deploy local QA:
  - `pnpm typecheck` — PASS
  - `pnpm lint` — PASS with 302 warnings, 0 errors
  - `pnpm build` — PASS, 833 pages generated
  - `pnpm vitest --run` — PASS, 1235 tests
- Deploy:
  - `bash deploy-vps-auto.sh` — PASS
  - PM2 `persiantoolbox` restarted successfully
  - New process ready on attempt 8
  - Deploy script warmup and verification passed
- Live production checks:
  - `/api/health` returned OK with database and Redis OK
  - `/` and `/loan` returned HTTP 200
  - `www` root, `/loan`, and `/loan?x=1` redirected to non-www with path/query preserved
  - `/sitemap.xml` and `/robots.txt` returned HTTP 200
  - Homepage canonical: `https://persiantoolbox.ir`
  - `/loan` canonical: `https://persiantoolbox.ir/loan`
  - Homepage and `/loan` `[object Object]` count: `0`
  - `/api/version` returned version `7.7.0` and `commit:null`

### Warnings / Follow-up

- Production commit hash is UNVERIFIED from the app because `/api/version` returns `commit:null`.
- CSP enforced policy still uses `unsafe-inline` for static Next.js compatibility. Local code adds a nonce-backed report-only target; use its violations to migrate inline hydration/JSON-LD/style usage before enforcing nonce/hash CSP.
- Production Lighthouse after deploy is UNVERIFIED.
- Previous local Lighthouse `/loan` Performance score was `78`; local optimization is prepared and still needs approved deploy plus fresh production Lighthouse.
- Existing lint warnings remain non-blocking: 288 total after local cleanup (`no-non-null-assertion` 182, `no-nested-ternary` 85, `react-hooks/exhaustive-deps` 10, `no-img-element` 11). `no-console` is cleared.
- The named build warnings are resolved locally: stale Browserslist data was updated, redundant custom Cache-Control was removed, and the Turbopack NFT trace warning was suppressed with a narrow trace exclude. The unrelated edge-runtime static-generation notice remains.

### Rollback

- Revert commit `6608314e` and redeploy with `bash deploy-vps-auto.sh`.
- No database or storage migration was introduced.

## 2026-07-02 — Commit 98512d4b

**Deployed:** YES
**Risk:** LOW (homepage/content/navigation additions only)
**Production:** https://persiantoolbox.ir

### Changes

- Homepage growth pass for free-tool positioning.
- Standardized homepage/live SEO copy around the verified «۸۶ ابزار رایگان» count.
- Added role-based homepage paths for finance/admin users, small businesses, PDF/file users, and writers/students.
- Added direct tool links inside each role path to reduce time-to-tool.
- Updated homepage copy and e2e/unit coverage for the new section.

### Verification

- Local QA before deploy:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm vitest --run` — 147 files, 1,234 tests passed
  - `pnpm build` — 825 pages generated
- Deploy:
  - `bash deploy-vps-auto.sh`
  - VPS build completed; PM2 `persiantoolbox` restarted with `pm2 restart`
  - deploy script warmup and verification passed
- Live production checks:
  - `/api/health` returned `{"status":"ok"}` with database and redis OK
  - 10 key pages returned HTTP 200
  - live CSS chunk returned HTTP 200
  - `Vazirmatn-Bold.woff2` returned HTTP 200
  - homepage HTML contains:
    - «۸۶ ابزار رایگان»
    - «مسیر پیشنهادی برای هر نوع کاربر»
    - «کسب‌وکار کوچک، فروشگاه و فریلنسر»

### Warnings / Follow-up

- Existing lint warnings remain non-blocking but should be reduced in admin/API code:
  `no-nested-ternary`, `react-hooks/exhaustive-deps`, `@typescript-eslint/no-non-null-assertion`.
- Existing build warnings remain non-blocking:
  custom `Cache-Control` for `/_next/static/:path*`, stale Browserslist data, and Turbopack NFT trace warning from admin ops logs route.
- Staging remains down and should be restored separately with `deploy-staging.sh`.
- PM2 restart count is elevated and needs log-based root-cause review.

### Rollback

- Revert commit `98512d4b` and redeploy.
- No database or storage migration was introduced by this homepage change.

## 2026-06-27 — Commit e6243ae

**Deployed:** YES
**Risk:** LOW (additive changes only)

### Changes

- Revenue hardening: transaction-safe credit reserve, stale cleanup, failure refund
- Legacy resume route 301 redirect
- Legacy registry entry marked non-indexable

### DB Changes

- None (tables already exist from previous migration)

### Risks

- Transaction-safe reserve may briefly hold row lock during concurrent exports (acceptable)
- 301 redirect removes legacy route from sitemap (intentional — reduces duplicate content)
- No data loss, no destructive operations

### Rollback

- Revert commit to restore previous behavior
- Legacy redirect removal: just remove the entry from `next.config.mjs` redirects
