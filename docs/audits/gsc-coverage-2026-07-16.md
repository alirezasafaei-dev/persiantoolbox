# Google Search Console coverage audit — 2026-07-16

Source: `persiantoolbox.ir-Coverage-2026-07-16.zip` exported from Google Search Console.
The chart ends on 2026-07-09, which is normal because Coverage/Page indexing data is delayed.

## Executive summary

- Known URLs: **857**
- Indexed: **418**
- Not indexed: **439**
- Index rate: **48.8%**
- Starting index rate on 2026-04-16: **6.5%** (6 of 93)
- Net indexed gain: **+412 URLs**
- Largest one-day gain: **+240 indexed URLs on 2026-06-30**
- All issue rows total **439**, exactly matching the latest not-indexed count.
- The indexation trend is materially positive, but reliability and URL-inventory hygiene remain blockers.

## Prioritized issue inventory

| Priority | Search Console reason | Pages | Share of not indexed | Assessment |
|---|---|---:|---:|---|
| P0 | Server error (5xx) | 33 | 7.5% | Must be investigated from server/proxy/runtime logs and GSC example URLs. Validation is already started. |
| P1 | Discovered – currently not indexed | 153 | 34.9% | Improve crawl paths, remove low-value URL inventory, and verify sitemap `lastModified` signals. |
| P1 | Crawled – currently not indexed | 61 | 13.9% | Review representative templates for thin/duplicate content, intent mismatch, weak internal links, or unstable rendering. |
| P1 | Not found (404) | 30 | 6.8% | Fix internal links and sitemap references. Redirect only when a real equivalent exists; otherwise retain 404/410. |
| P1 | Duplicate without user-selected canonical | 4 | 0.9% | Add deterministic canonical/redirect behavior and eliminate route variants from internal links. |
| P1 | Google chose a different canonical | 1 | 0.2% | Align canonical, sitemap, redirects, internal links, and content signals. |
| P2 | Excluded by `noindex` | 91 | 20.7% | Likely includes admin/auth/search/checkout or intentionally excluded states; validate intent, do not blindly remove `noindex`. |
| P2 | Alternate page with proper canonical | 36 | 8.2% | Usually informational. Ensure canonical targets are 200/indexable and links point to the target URL. |
| P2 | Page with redirect | 16 | 3.6% | Keep legacy redirects, but remove their source URLs from sitemap and internal links. |
| P2 | Blocked by robots.txt | 14 | 3.2% | Validate intent. A robots block prevents crawling; it is not the correct mechanism for removing an already indexed URL. |

## Repository findings

1. `app/robots.ts` intentionally blocks `/admin/`, `/auth/`, `/api/`, `/checkout/`, and `/search?`, and publishes the sitemap URL. This is broadly correct; the 14 robots-blocked rows need URL-level intent review rather than a global robots change.
2. `app/sitemap.ts` builds routes from static pages, categories, guides, blog taxonomies/posts, and `getIndexableTools()`, so the sitemap architecture already excludes tools marked non-indexable.
3. `buildDate` is used as a fallback `lastModified` for many static/category/guide/tag routes. If this value changes every deployment, unchanged URLs appear newly modified and can create crawl churn. Replace synthetic dates with real content dates or omit `lastModified` when unknown.
4. The existing `scripts/quality/audit-sitemap-indexability.mjs` defaults to the first 60 sitemap URLs. That sample can miss failing routes among hundreds of URLs and did not produce durable JSON/Markdown artifacts.
5. Search Console API integration currently exposes performance queries and sitemap status, but the exported summary does not contain URL examples for each Page indexing reason. GSC examples or an exported URL list are required to map 5xx/404/duplicate groups to concrete routes.

## Automated changes in this branch

- Added a scheduled/manual workflow that runs the existing sitemap indexability audit in `--full` mode instead of its 60-URL default, retries the complete audit up to three times, fails on persistent defects, and uploads attempt logs as artifacts.
- Added `scripts/quality/analyze-gsc-coverage-export.mjs` to parse future Search Console ZIP/directory exports and generate a prioritized report.

## Required follow-up after merge

1. Run the full audit against production and inspect all 5xx/request failures.
2. Export or copy the example URLs from each GSC issue group, especially 5xx, 404, discovered, crawled, and duplicate canonical.
3. Correlate 5xx timestamps/routes with PM2, Nginx, Sentry, database, and upstream timeout logs.
4. Fix internal links/sitemap entries before requesting validation in Search Console.
5. After deployment, resubmit `sitemap.xml`, request validation for fixed groups, and compare the next export after Google refreshes the report.
