# Google Search Console coverage audit — 2026-07-16

Source: `persiantoolbox.ir-Coverage-2026-07-16.zip` exported from Google Search Console.
The chart ends on 2026-07-09, which is normal because Page indexing data is delayed.

## Executive summary

- Known URLs: **857**
- Indexed: **418**
- Not indexed: **439**
- Index rate: **48.8%**
- Starting index rate on 2026-04-16: **6.5%** (6 of 93)
- Net indexed gain: **+412 URLs**
- Largest one-day gain: **+240 indexed URLs on 2026-06-30**
- All issue rows total **439**, exactly matching the latest not-indexed count.
- The indexation trend is materially positive, but URL-inventory hygiene and crawl efficiency remain important.

## Prioritized issue inventory

| Priority | Search Console reason | Pages | Share of not indexed | Assessment |
|---|---|---:|---:|---|
| P0 | Server error (5xx) | 33 | 7.5% | Historical incident. Production verification found zero new 5xx during the sustained window and three full sitemap passes. GSC validation was already started. |
| P1 | Discovered – currently not indexed | 153 | 34.9% | Improve crawl paths, remove low-value URL inventory, and verify sitemap `lastModified` signals. |
| P1 | Crawled – currently not indexed | 61 | 13.9% | Review representative templates for thin/duplicate content, intent mismatch, weak internal links, or unstable rendering. |
| P1 | Not found (404) | 30 | 6.8% | Fix internal links and sitemap references. Redirect only when a real equivalent exists; otherwise retain 404/410. |
| P1 | Duplicate without user-selected canonical | 4 | 0.9% | Add deterministic canonical/redirect behavior and eliminate route variants from internal links. |
| P1 | Google chose a different canonical | 1 | 0.2% | Align canonical, sitemap, redirects, internal links, and content signals. |
| P2 | Excluded by `noindex` | 91 | 20.7% | Likely includes admin/auth/search/checkout or intentionally excluded states; validate intent, do not blindly remove `noindex`. |
| P2 | Alternate page with proper canonical | 36 | 8.2% | Usually informational. Ensure canonical targets are 200/indexable and links point to the target URL. |
| P2 | Page with redirect | 16 | 3.6% | Keep legitimate legacy redirects, but remove their source URLs from sitemap and internal links. |
| P2 | Blocked by robots.txt | 14 | 3.2% | Validate intent. A robots block prevents crawling; it is not the correct mechanism for removing an already indexed URL. |

## Repository findings

1. `app/robots.ts` intentionally blocks `/admin/`, `/auth/`, `/api/`, `/checkout/`, and `/search?`, and publishes the sitemap URL. This is broadly correct; robots-blocked rows need URL-level intent review rather than a global robots change.
2. `app/sitemap.ts` builds routes from static pages, categories, guides, blog taxonomies/posts, and `getIndexableTools()`, so the sitemap architecture already excludes tools marked non-indexable.
3. A build date is used as fallback `lastModified` for multiple route types. If that date changes every deployment, unchanged URLs can appear newly modified and create crawl churn. Prefer real content dates or omit `lastModified` when unknown.
4. The existing sitemap audit defaults to a limited sample unless `--full` is passed. A scheduled workflow should always use full mode for production verification.
5. Search Console summary exports do not include complete URL examples for every Page indexing reason. GSC examples or a copied URL list are required for route-level remediation.

## Automated changes

- Added a scheduled/manual workflow that runs the sitemap indexability audit in `--full` mode, retries the complete audit up to three times, and uploads logs.
- Added `scripts/quality/analyze-gsc-coverage-export.mjs` to parse future Search Console ZIP/directory exports and generate prioritized JSON and Markdown reports.

## Incident 138 status

Production investigation classified the 33 GSC 5xx URLs as historical failures from 2026-07-02 through 2026-07-14. The current release was stable during verification:

- zero new 5xx in the latest 48-hour window;
- zero PM2 restarts in the recorded stability window;
- zero OOM events;
- three consecutive full sitemap audits passed for 433 URLs;
- no additional deploy or restart was justified;
- Search Console validation was already running.

Keep the incident in monitoring state until Google completes validation. Reopen route-level investigation only for residual example URLs reported after refresh.

## Required follow-up after merge

1. Run the scheduled full production audit and retain artifacts.
2. Export or copy representative URLs for 404, discovered, crawled, duplicate, and any residual 5xx groups.
3. Fix internal links and sitemap entries before requesting new validations.
4. Review synthetic `lastModified` fallbacks.
5. Compare the next Page indexing export after Google refreshes the report.
