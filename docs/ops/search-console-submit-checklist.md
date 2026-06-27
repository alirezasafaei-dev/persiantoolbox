# Search Console Submit Checklist — PersianToolbox

**Date:** 2026-06-27
**After P0 hotfix deployment**

---

## Pre-Submission Verification

| Check                                 | Status | Evidence                                                                   |
| ------------------------------------- | ------ | -------------------------------------------------------------------------- |
| sitemap.xml returns 200               | ✅     | `curl -I https://persiantoolbox.ir/sitemap.xml` → 200                      |
| robots.txt references correct sitemap | ✅     | `Sitemap: https://persiantoolbox.ir/sitemap.xml`                           |
| robots.txt Host is correct            | ✅     | `Host: https://persiantoolbox.ir`                                          |
| Homepage canonical correct            | ✅     | `rel="canonical" href="https://persiantoolbox.ir"`                         |
| Flagship pages canonical correct      | ✅     | All use `https://persiantoolbox.ir/...`                                    |
| No localhost in page HTML             | ✅     | `grep -c 'localhost:3000'` → 0                                             |
| All flagship pages in sitemap         | ✅     | business-tools, career-tools, writing-tools + sub-routes present           |
| No noindex on flagship pages          | ✅     | `robots: index, follow` on all public pages                                |
| No blocked robots paths for flagship  | ✅     | Only /admin/, /auth/, /api/, /account/, /checkout/, /dashboard/ disallowed |

## Sitemap Entry Count

Total entries: ~379 (373 original + 6 flagship routes added explicitly)

## Manual Steps

### Step 1: Open Google Search Console

- Navigate to https://search.google.com/search-console
- If property doesn't exist, add it:
  - **Domain property** (recommended): `persiantoolbox.ir` — requires DNS TXT record
  - **URL prefix**: `https://persiantoolbox.ir/` — requires HTML tag, file upload, or Analytics

### Step 2: Submit Sitemap

1. In Search Console, go to **Sitemaps** (left menu)
2. Enter `https://persiantoolbox.ir/sitemap.xml`
3. Click **Submit**
4. Wait for "Success" status (may take a few minutes)

### Step 3: Request Indexing for Key Pages

Use **URL Inspection** tool for each:

1. `https://persiantoolbox.ir/` (homepage)
2. `https://persiantoolbox.ir/business-tools/document-studio` (invoice builder)
3. `https://persiantoolbox.ir/career-tools/resume-builder` (resume builder)
4. `https://persiantoolbox.ir/writing-tools/persian-writing-studio` (Persian editor)
5. `https://persiantoolbox.ir/pricing` (pricing)
6. `https://persiantoolbox.ir/blog` (blog)

For each:

1. Paste URL in URL Inspection
2. Wait for "URL is on Google" or "URL is not on Google"
3. If not on Google, click **Request Indexing**
4. Wait for "Indexing requested" confirmation

### Step 4: Monitor Coverage Report

After 24-72 hours:

1. Go to **Pages** (formerly Coverage) in Search Console
2. Check for:
   - **Valid pages**: Should increase over time
   - **Excluded pages**: Review why pages are excluded
   - **Error pages**: Fix any 404/500/redirect errors
   - **Canonical errors**: Verify Google picks correct canonical
3. Watch for these specific issues:
   - "Duplicate, submitted URL not selected as canonical" — means Google prefers a different canonical
   - "Crawled - currently not indexed" — means Google crawled but chose not to index
   - "Discovered - currently not indexed" — means Google found URL but hasn't crawled yet

### Step 5: Verify Structured Data

1. Go to **Search Results** in Search Console
2. Check for:
   - FAQ rich results (from FAQPage schema)
   - Breadcrumb rich results (from BreadcrumbList schema)
   - SoftwareApplication rich results (from SoftwareApplication schema)
3. Fix any structured data errors

### Step 6: Monitor Search Performance

After 1-2 weeks:

1. Go to **Performance** in Search Console
2. Check:
   - **Total clicks**: Should increase
   - **Total impressions**: Should increase
   - **Average CTR**: Should be 2-5% for tool pages
   - **Average position**: Should improve over time
3. Identify top-performing queries and pages

## Important Notes

- **Do NOT use "Inspect and Test Live URL"** unless you need to debug — it uses a live crawl which may differ from indexed version
- **Indexing can take 1-4 weeks** for new/rebuilt sites
- **Do NOT submit the same URL multiple times** — Google will queue it once
- **Monitor for 404 errors** after sitemap update — old URLs may still be in Google's index
- **Submit sitemap only once** — resubmit only after significant content changes

## Post-Submission Checklist

- [ ] Sitemap submitted in Search Console
- [ ] Homepage requested for indexing
- [ ] 4 flagship product pages requested for indexing
- [ ] Pricing page requested for indexing
- [ ] Blog page requested for indexing
- [ ] Coverage report checked after 48 hours
- [ ] No canonical errors in Coverage
- [ ] Structured data validated
- [ ] Performance report monitored after 1 week
