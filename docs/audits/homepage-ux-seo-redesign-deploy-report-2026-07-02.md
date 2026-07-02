# Homepage UX/SEO Redesign + Bug Fixes Deploy Report

**Date**: 2026-07-02
**Branch**: `main`
**Commits**: `9ddfb91e`, `b264210e`
**Deploy**: Production (VPS at 193.93.169.32)

## Changes Made

### 1. Homepage Redesign (`9ddfb91e`)

| File                           | Change                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `components/home/HomeHero.tsx` | Redesigned hero with gradient background, larger heading (lg:text-6xl), cleaner trust bar  |
| `components/HomePage.tsx`      | Added 6 task-based quick-action cards, restructured trust section to compact layout        |
| `lib/home-copy.ts`             | Updated hero title: "ابزارهای فارسی برای کارهای روزمره", subtitle: "سریع، خصوصی، بدون نصب" |
| `app/globals.css`              | Added `.hero-section` gradient background (light/dark), improved focus ring visibility     |
| `proxy.ts`                     | Added www→non-www 308 redirect in middleware, removed www from HSTS hosts                  |
| `tests/unit/home-copy.test.ts` | Updated hero title assertion                                                               |
| `tests/e2e/home.spec.ts`       | Updated hero text assertion                                                                |

### 2. Bug Fixes (`b264210e`)

| File                                             | Change                                                      |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `components/features/blog/BlogCard.tsx:338`      | Defensive series rendering for object-type frontmatter data |
| `components/features/blog/BlogEditorial.tsx:321` | Defensive series rendering for object-type frontmatter data |
| `components/features/salary/SalaryPage.tsx:347`  | Changed second H1 to H2 for proper heading hierarchy        |

## Verification

| Command                   | Result                                        |
| ------------------------- | --------------------------------------------- |
| `pnpm typecheck`          | ✅ PASS (0 errors)                            |
| `pnpm lint`               | ✅ PASS (0 errors, 302 pre-existing warnings) |
| `pnpm vitest --run`       | ✅ PASS (1234/1234 tests)                     |
| `pnpm build`              | ✅ PASS                                       |
| `bash deploy-vps-auto.sh` | ✅ Deploy successful                          |
| Health check              | ✅ `{"status":"ok"}`                          |
| 10 key pages              | ✅ All HTTP 200                               |
| CSS + Font                | ✅ HTTP 200                                   |

## Live Verification (Post-Deploy)

| Check                        | Result                                   |
| ---------------------------- | ---------------------------------------- |
| New hero H1                  | ✅ "ابزارهای فارسی برای کارهای روزمره"   |
| hero-section class           | ✅ Present                               |
| Task cards section           | ✅ "چه کاری می‌خواهید انجام دهید"        |
| New secondary CTA            | ✅ "مشاهده ابزارهای پرکاربرد"            |
| Blog series object rendering | ✅ Fixed — series names render correctly |
| Blog future dates            | ✅ Fixed — all dates = 2026-07-02        |
| Salary H1 count              | ✅ 1 H1 (duplicate fixed)                |
| WWW redirect                 | ✅ nginx 301 + middleware 308            |
| Canonical                    | ✅ `https://persiantoolbox.ir`           |

## Pre-Existing Issues (Not Fixed in This Session)

1. **Blog series object rendering root cause**: Blog posts have `series` as YAML object `{name: '...', order: N}`. The defensive rendering fixes the symptom but the cache may still contain object-type data until next cache rebuild.
2. **Blog future dates root cause**: Filenames contain future dates (e.g., `2026-07-18-...`) but frontmatter `date` is `2026-07-02`. The blog system uses frontmatter dates correctly.
3. **Staging down**: `staging.persiantoolbox.ir` PM2 process is not running.

## Risk Assessment

| Risk                  | Level      | Notes                                        |
| --------------------- | ---------- | -------------------------------------------- |
| WWW redirect          | LOW        | nginx handles it; middleware is safety net   |
| Blog series rendering | LOW        | Defensive fix deployed; may need cache clear |
| CSS cache             | LOW        | Deploy script purges nginx cache             |
| No Lighthouse run     | UNVERIFIED | No Lighthouse CLI available locally          |
