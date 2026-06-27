# Manual Search Console Submission Checklist

**Date:** 2026-06-27
**Warning:** No API key was used. This is a manual checklist only.

---

## Live SEO Check Results

| Check                     | Result                                 |
| ------------------------- | -------------------------------------- |
| Homepage returns 200      | ✅ PASS                                |
| Sitemap returns 200       | ✅ PASS                                |
| Robots returns 200        | ✅ PASS                                |
| Business page returns 200 | ✅ PASS                                |
| Career page returns 200   | ✅ PASS                                |
| Writing page returns 200  | ✅ PASS                                |
| Blog returns 200          | ✅ PASS                                |
| Pricing returns 200       | ✅ PASS                                |
| Canonical domain correct  | ✅ YES (`https://persiantoolbox.ir`)   |
| OG URL correct            | ✅ YES (`https://persiantoolbox.ir`)   |
| Localhost found           | ✅ NO (0 in homepage, sitemap, robots) |
| Important URLs in sitemap | ✅ YES (all flagship routes present)   |

## Manual Sitemap URL

```
https://persiantoolbox.ir/sitemap.xml
```

## Manual URL Inspection List

1. `https://persiantoolbox.ir/`
2. `https://persiantoolbox.ir/business-tools/document-studio`
3. `https://persiantoolbox.ir/career-tools/resume-builder`
4. `https://persiantoolbox.ir/writing-tools/persian-writing-studio`
5. `https://persiantoolbox.ir/blog`
6. `https://persiantoolbox.ir/pricing`

## Steps to Submit Sitemap Manually

1. Open Google Search Console: https://search.google.com/search-console
2. Select the property for `persiantoolbox.ir`
3. Go to **Sitemaps** (left menu)
4. Enter `https://persiantoolbox.ir/sitemap.xml`
5. Click **Submit**
6. Wait for "Success" status

## Steps to Request Indexing

1. Go to **URL Inspection** in Search Console
2. Paste each URL from the list above
3. Wait for Google to check the URL
4. If Google reports the page is available to index, click **Request Indexing**
5. Repeat for all 6 URLs

## Monitoring Schedule

| Time           | Action                                   |
| -------------- | ---------------------------------------- |
| After 24 hours | Check Coverage report for errors         |
| After 48 hours | Verify pages appear in "Valid" count     |
| After 72 hours | Check Search Performance for impressions |
| After 7 days   | Review top queries and CTR               |
| After 2 weeks  | Assess organic traffic growth            |

## Watch For These Issues

- **Wrong canonical** — Google picks a different canonical than expected
- **Blocked by robots** — robots.txt accidentally blocks important pages
- **Server error** — 500/502/504 during Google crawl
- **Discovered but not indexed** — Google found URL but hasn't crawled yet
- **Crawled but not indexed** — Google crawled but chose not to index
- **Duplicate without user-selected canonical** — Google picks wrong duplicate

## Important Notes

- Do NOT submit the same URL multiple times
- Do NOT use "Inspect and Test Live URL" unless debugging
- Indexing can take 1-4 weeks for new/rebuilt sites
- Resubmit sitemap only after significant content changes
