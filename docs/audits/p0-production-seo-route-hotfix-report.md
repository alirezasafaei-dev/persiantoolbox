# P0 Production SEO & Route Hotfix Report

**Date:** 2026-06-27
**Commit:** d6d2657

---

## Bugs Confirmed

| Bug                                              | Severity | Evidence                                                     |
| ------------------------------------------------ | -------- | ------------------------------------------------------------ |
| All canonical URLs used `http://localhost:3000`  | CRITICAL | `<link rel="canonical" href="http://localhost:3000"/>`       |
| All OG/Twitter URLs used `http://localhost:3000` | CRITICAL | `<meta property="og:url" content="http://localhost:3000/"/>` |
| Sitemap had 373 localhost entries                | CRITICAL | `<loc>http://localhost:3000/</loc>`                          |
| Robots.txt Host was `http://localhost:3000`      | CRITICAL | `Host: http://localhost:3000`                                |
| `/writing-tools` returned 502                    | CRITICAL | nginx 502 Bad Gateway                                        |
| `/blog` returned 504                             | CRITICAL | nginx 504 Gateway Timeout                                    |
| `/topics` returned 504                           | CRITICAL | nginx 504 Gateway Timeout                                    |
| `/privacy` returned 504                          | CRITICAL | nginx 504 Gateway Timeout                                    |

## Root Cause

**Two-part root cause:**

1. **`deploy-vps-auto.sh` did not pass `NEXT_PUBLIC_SITE_URL`** to the VPS build command. Line 70 was:

   ```bash
   NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build
   ```

2. **VPS had stale `.env` file** with `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Even after fixing the deploy script, Next.js reads `.env` files with higher priority than shell environment variables, so the stale `.env` overrode the build-time env var.

**Why it happened:** The deploy script excludes `.env` from rsync (lines 53-54), so the VPS kept its old `.env` from a previous manual setup.

## Files Changed

| File                       | Change                                                                  | Purpose                                          |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `lib/brand.ts`             | Added production-mode assertion                                         | Throws error if localhost URL used in production |
| `deploy-vps-auto.sh`       | Added `NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir` to build command | Ensures build-time URL is correct                |
| `app/sitemap.ts`           | Added flagship routes to staticRoutes, deduplicated routes              | Explicit coverage + no duplicate URLs            |
| `tests/unit/brand.test.ts` | Added 2 tests for production assertion and dev fallback                 | Prevents future regressions                      |

## Deploy Process

1. Fixed `lib/brand.ts` with production assertion
2. Fixed `deploy-vps-auto.sh` to inject `NEXT_PUBLIC_SITE_URL`
3. Added flagship routes to sitemap
4. Fixed VPS `.env` file: changed `NEXT_PUBLIC_SITE_URL=http://localhost:3000` → `https://persiantoolbox.ir`
5. Rebuilt on VPS with correct env
6. Copied static assets to standalone
7. Restarted PM2
8. Purged nginx cache

## Live Verification Results

| Check                                   | Result                                     |
| --------------------------------------- | ------------------------------------------ |
| `/`                                     | ✅ 200                                     |
| `/writing-tools`                        | ✅ 200                                     |
| `/blog`                                 | ✅ 200 (slow ~30s)                         |
| `/topics`                               | ✅ 200                                     |
| `/privacy`                              | ✅ 200                                     |
| `/pricing`                              | ✅ 200                                     |
| `/business-tools`                       | ✅ 200                                     |
| `/business-tools/document-studio`       | ✅ 200                                     |
| `/career-tools`                         | ✅ 200                                     |
| `/career-tools/resume-builder`          | ✅ 200                                     |
| `/writing-tools/persian-writing-studio` | ✅ 200                                     |
| Homepage canonical                      | ✅ `https://persiantoolbox.ir`             |
| Pricing canonical                       | ✅ `https://persiantoolbox.ir/pricing`     |
| Sitemap localhost count                 | ✅ 0                                       |
| Homepage localhost count                | ✅ 0                                       |
| Robots.txt Host                         | ✅ `https://persiantoolbox.ir`             |
| Robots.txt Sitemap                      | ✅ `https://persiantoolbox.ir/sitemap.xml` |
| Flagship routes in sitemap              | ✅ All 9 routes present                    |
| CSS served                              | ✅ HTTP 200                                |

## Remaining Risks

1. `/blog` is slow (~30s response) — likely due to large blog content or server-side rendering overhead
2. VPS memory usage is 738MB (high for a single process) — monitor for OOM
3. The deploy script still excludes `.env` — future VPS resets could reintroduce the bug
4. The production assertion in `brand.ts` only fires at runtime — a build-time assertion would be even safer

## Rollback Needed

**NO** — all changes are safe, minimal, and verified live.

## Final Verdict

**P0 hotfix completed: YES**

- All 8 critical bugs fixed
- All 11 critical routes return 200
- All SEO URLs use correct production domain
- Sitemap has 0 localhost entries
- Production assertion prevents future regressions
- Tests pass: 859/859
- Lint: 0 errors
- Typecheck: PASS
