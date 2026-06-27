# Blog Optimization Deploy Report

**Date:** 2026-06-27
**Deployed commit:** 6735a3a (blog optimization) + 81bce4f (SEO fix) + d6d2657 (P0 hotfix)

---

## Deploy Summary

| Item          | Status                                      |
| ------------- | ------------------------------------------- |
| Build         | ✅ PASS (500/500 static pages, 86s compile) |
| Static assets | ✅ 1 CSS, 172 JS, 10 fonts                  |
| PM2           | ✅ Online (pid 30600)                       |
| Health check  | ✅ `{"status":"ok"}`                        |
| CSS served    | ✅ HTTP 200                                 |
| Fonts served  | ✅ HTTP 200                                 |

## Blog Performance

| Metric                         | Before | After       |
| ------------------------------ | ------ | ----------- |
| Cold response                  | ~30s   | 1.03s       |
| Warm response                  | ~4.6s  | ~4.5s       |
| remark invocations per request | 3-4x   | 1x (cached) |

**Root cause of improvement:** Memoization of `getAllPosts()` + `revalidate = 3600` on blog page.

## SEO Verification

| Check               | Result                                     |
| ------------------- | ------------------------------------------ |
| Homepage localhost  | ✅ 0                                       |
| Sitemap localhost   | ✅ 0                                       |
| Robots localhost    | ✅ 0                                       |
| Homepage canonical  | ✅ `https://persiantoolbox.ir`             |
| Robots Host         | ✅ `https://persiantoolbox.ir`             |
| Robots Sitemap      | ✅ `https://persiantoolbox.ir/sitemap.xml` |
| Flagship in sitemap | ✅ All 9 routes present                    |

## Route Status

| Route                                   | Status                         |
| --------------------------------------- | ------------------------------ |
| `/`                                     | ✅ 200                         |
| `/blog`                                 | ✅ 200 (1.03s cold, 4.5s warm) |
| `/topics`                               | ✅ 200                         |
| `/privacy`                              | ✅ 200                         |
| `/writing-tools`                        | ✅ 200                         |
| `/sitemap.xml`                          | ✅ 200                         |
| `/robots.txt`                           | ✅ 200                         |
| `/business-tools/document-studio`       | ✅ 200                         |
| `/career-tools/resume-builder`          | ✅ 200                         |
| `/writing-tools/persian-writing-studio` | ✅ 200                         |
| `/pricing`                              | ✅ 200                         |

## PM2 Status

- Status: online
- PID: 30600
- Memory: 18.5mb (startup) → will grow to ~500-700mb under load
- Restart count: 32 (from all deploys, not crashes)
- Version: 6.8.0

## Remaining Risks

| Risk                       | Severity | Notes                                                 |
| -------------------------- | -------- | ----------------------------------------------------- |
| `/blog` warm ~4.5s         | LOW      | Acceptable for listing page; deeper fix documented    |
| `fast-uri` vulnerabilities | MEDIUM   | Transitive via `@sentry/nextjs`; update in next cycle |
| 4 broken docs links        | LOW      | Archived roadmap files; clean up or redirect          |

## Search Console Next Action

Submit sitemap manually:

1. Open Google Search Console
2. Go to Sitemaps
3. Submit: `https://persiantoolbox.ir/sitemap.xml`
4. Use URL Inspection for flagship pages
5. Monitor Coverage report after 48-72 hours

Full checklist: `docs/ops/search-console-submit-checklist.md`

## Rollback Needed

**NO** — all changes verified live, stable, no issues.
