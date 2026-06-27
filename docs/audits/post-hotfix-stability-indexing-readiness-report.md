# Post-Hotfix Stability & Indexing Readiness Report

**Date:** 2026-06-27
**After P0 hotfix deployment (d6d2657)**

---

## 1. Live Re-verification Results

| Route                                   | Status | Response Time        |
| --------------------------------------- | ------ | -------------------- |
| `/`                                     | ✅ 200 | ~2s                  |
| `/writing-tools`                        | ✅ 200 | ~3s                  |
| `/blog`                                 | ✅ 200 | 4.6s (was ~30s cold) |
| `/topics`                               | ✅ 200 | 3.6s                 |
| `/privacy`                              | ✅ 200 | ~2s                  |
| `/pricing`                              | ✅ 200 | ~2s                  |
| `/business-tools`                       | ✅ 200 | ~2s                  |
| `/business-tools/document-studio`       | ✅ 200 | ~2s                  |
| `/career-tools`                         | ✅ 200 | ~2s                  |
| `/career-tools/resume-builder`          | ✅ 200 | ~2s                  |
| `/writing-tools/persian-writing-studio` | ✅ 200 | ~2s                  |
| `/sitemap.xml`                          | ✅ 200 | ~1s                  |
| `/robots.txt`                           | ✅ 200 | ~1s                  |

| SEO Check                  | Status                                     |
| -------------------------- | ------------------------------------------ |
| Homepage localhost count   | ✅ 0                                       |
| Sitemap localhost count    | ✅ 0                                       |
| Robots localhost count     | ✅ 0                                       |
| Homepage canonical         | ✅ `https://persiantoolbox.ir`             |
| Pricing canonical          | ✅ `https://persiantoolbox.ir/pricing`     |
| Robots Host                | ✅ `https://persiantoolbox.ir`             |
| Robots Sitemap             | ✅ `https://persiantoolbox.ir/sitemap.xml` |
| Flagship routes in sitemap | ✅ All 9 routes present                    |

## 2. Skipped Checks Now Run

| Check                      | Result  | Classification                                                                                                 |
| -------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `quality:links:check`      | ✅ PASS | Internal link integrity verified                                                                               |
| `quality:docs-links:check` | ❌ FAIL | Pre-existing: 4 broken links in `docs/archive/` (archived roadmap files reference non-existent `./roadmap.md`) |
| `gate:local-first`         | ✅ PASS | No off-origin runtime dependency                                                                               |
| `security:secrets`         | ✅ PASS | No high-risk secret patterns                                                                                   |
| `security:scan`            | ❌ FAIL | 4 vulnerabilities in `fast-uri` (transitive via `@sentry/nextjs`): 1 low, 1 moderate, 2 high                   |
| `pwa:sw:validate`          | ✅ PASS | CACHE_VERSION valid: v10-2026-06-17                                                                            |
| `pwa:shell:check`          | ✅ PASS | Shell assets up to date (15 routes/assets)                                                                     |
| `lint`                     | ✅ PASS | 0 errors, 140 warnings                                                                                         |
| `typecheck`                | ✅ PASS | No type errors                                                                                                 |
| `vitest`                   | ✅ PASS | 859/859 tests in 120 files                                                                                     |

## 3. /blog Performance Diagnosis

### Root Cause

`getAllPosts()` in `lib/blog.ts` calls `getPostBySlug()` for EVERY blog post, which runs full remark markdown processing (remarkGfm → remarkRehype → rehypeHighlight → rehypeStringify) for each article. The listing page only needs metadata (title, date, description), not rendered HTML.

Additionally, `getAllPosts()` was called 3-4 times per request:

1. `BlogPage` for post count
2. `BlogList` for post listing
3. `getAllCategories()` (which calls `getAllPosts()` internally)
4. `BlogSidebar` for tags (which calls `getAllPosts()` internally)

### Fix Applied

1. **Memoized `getAllPosts()`** — Added in-memory cache so remark processing runs once per server lifetime, not 3-4 times per request
2. **Added `revalidate = 3600`** to blog page — Next.js caches rendered output for 1 hour

### Results

| Metric                         | Before Fix | After Fix       |
| ------------------------------ | ---------- | --------------- |
| Cold response time             | ~30s       | ~5s (estimated) |
| Warm response time             | ~5s        | 4.6s            |
| remark invocations per request | 3-4x       | 1x (cached)     |

### Remaining Optimization (documented, not implemented)

- Create `getAllPostMetas()` that reads only frontmatter without remark processing
- This would reduce blog listing to <1s (only gray-matter parsing, no markdown rendering)

## 4. Security Scan Details

4 vulnerabilities found in `fast-uri` (transitive dependency via `@sentry/nextjs` → `@sentry/webpack-plugin` → `webpack` → `schema-utils` → `ajv` → `fast-uri`):

| Severity | Advisory                                  | Impact                                                                                |
| -------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Low      | GHSA-... (URL validation bypass)          | Low — fast-uri is used for URL parsing in ajv schema validation, not directly exposed |
| Moderate | GHSA-... (ReDoS)                          | Medium — regex denial of service in URL parsing                                       |
| High     | GHSA-v39h-62p7-jpjc (Prototype pollution) | High — but only affects ajv schema validation, not user-facing                        |
| High     | GHSA-... (Another ReDoS)                  | High — regex denial of service                                                        |

**Classification:** Pre-existing transitive dependency vulnerability. Not user-facing. Fix requires updating `@sentry/nextjs` or its webpack plugin.

## 5. Indexing Readiness Status

| Requirement                           | Status |
| ------------------------------------- | ------ |
| Sitemap returns 200                   | ✅     |
| Sitemap uses correct domain           | ✅     |
| Robots.txt references correct sitemap | ✅     |
| All flagship pages canonical correct  | ✅     |
| No localhost in HTML                  | ✅     |
| All flagship pages in sitemap         | ✅     |
| No noindex on public pages            | ✅     |
| No blocked paths for flagship         | ✅     |
| JSON-LD structured data present       | ✅     |
| OG images configured                  | ✅     |

**Verdict:** Site is ready for Search Console submission.

Manual checklist: `docs/ops/search-console-submit-checklist.md`

## 6. Server Stability Notes

- PM2: Online, 738MB memory usage (within 1GB limit)
- Restart count: 31 (from previous deploys, not from crashes)
- No OOM errors observed
- No 502/504 errors after cache purge
- Nginx cache working correctly (warm responses ~2-4s)

## 7. Remaining Risks

| Risk                       | Severity | Mitigation                                                                |
| -------------------------- | -------- | ------------------------------------------------------------------------- |
| `/blog` slow on cold start | MEDIUM   | Memoization applied; revalidate added; deeper fix documented              |
| `fast-uri` vulnerabilities | MEDIUM   | Update `@sentry/nextjs` in next dependency update cycle                   |
| 4 broken docs links        | LOW      | Archive files reference non-existent `./roadmap.md`; clean up or redirect |
| VPS memory at 738MB        | LOW      | Monitor; swap available; within 1GB limit                                 |
| `/blog` still ~4.6s warm   | LOW      | Acceptable for listing page; deeper optimization documented               |

## 8. Recommended Next Steps

1. **Submit sitemap to Google Search Console** — Follow `docs/ops/search-console-submit-checklist.md`
2. **Monitor indexing** — Check Coverage report after 48-72 hours
3. **Update `@sentry/nextjs`** — Fix fast-uri vulnerabilities in next dependency cycle
4. **Clean up `docs/archive/`** — Fix or remove broken roadmap links
5. **Deep blog optimization** (optional) — Create `getAllPostMetas()` for <1s listing response

## 9. What NOT to Do

- Do NOT resubmit sitemap repeatedly (Google queues once)
- Do NOT use "Inspect and Test Live URL" unless debugging
- Do NOT remove /blog from sitemap (it's slow but functional)
- Do NOT add noindex to slow pages
- Do NOT deploy again unless the blog optimization is ready (current state is stable)
