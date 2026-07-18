# Search Console canonical examples — 2026-07-18

Source: Search Console examples supplied by the property owner.

## Intentional / expected alternates

### Query-state variants of one tool

These URLs represent UI state for the same document studio and should consolidate to the base canonical unless dedicated indexable landing pages are intentionally created:

- `/business-tools/document-studio?type=receipt`
- `/business-tools/document-studio?type=invoice`
- `/business-tools/document-studio?type=proforma`

Current route metadata declares `/business-tools/document-studio` as the canonical.

### Account redirect state

- `/account?redirect=/premium`

This is navigation/auth state, not a standalone search landing page. It should not be indexed separately.

### `www` variants

The examples contain many `https://www.persiantoolbox.ir/...` URLs. These are expected exclusions only if every variant permanently redirects in one hop to the exact apex URL and the final page self-canonicals. The automated production audit sampled 25 `www` variants and found no redirect errors, but the full host rule still belongs in production verification.

## Actionable defect: obsolete SearchAction templates

Search Console discovered literal placeholder URLs:

- `https://persiantoolbox.ir/?q={search_term_string}`
- `https://persiantoolbox.ir/search?q={search_term_string}`

The repository emits `WebSite.potentialAction` / `SearchAction` JSON-LD in both `app/layout.tsx` and `components/HomePage.tsx`. Google removed the sitelinks search box feature in November 2024. Remove the obsolete `potentialAction` blocks while retaining the supported `WebSite` nodes.

## Actionable defect: untrimmed blog tag

Search Console reports:

- `/blog/tag/ استخدام`

The source is confirmed in:

- `content/blog/2026-06-07-hiring-cost-guide.md`

Its frontmatter contains the tag `' استخدام'` with a leading space. Required correction:

1. Change it to `'استخدام'`.
2. Normalize all blog tags at ingestion with Unicode normalization and `trim()`.
3. Deduplicate normalized tags.
4. Permanently redirect a decoded tag whose normalized form differs from the requested route.
5. Ensure metadata, links, breadcrumbs and static params use the normalized/encoded value.

## Historical / needs URL Inspection target

Topic routes reported as alternate include:

- `/topics/validation-tools`
- `/topics/career-tools`
- `/topics/business-tools`
- `/topics/writing-tools`

Current `main` emits self-referencing metadata for `/topics/{category}`. Because the crawl dates are July 5–9 and deployment history changed around that period, inspect one example and record the user-declared and Google-selected canonicals before changing route behavior.

## Duplicate without user-selected canonical

The listed examples are all `www` guide URLs. Treat them as historical host duplicates if current `www` requests permanently redirect to the apex equivalent. Do not add per-page canonical hacks.

## Blocked by robots.txt

`/api/*` exclusions are intentional. The project disallows `/api/` and emits `X-Robots-Tag: noindex, nofollow` for API responses. Do not unblock them.

Malformed discoveries such as `/api/auth/loginPOST` and `/api/data/salary-lawsGET` appear to be crawler inference from endpoint documentation. They are harmless while blocked, but developer documentation should avoid presenting endpoint strings in a way that can be interpreted as navigable URLs.

The placeholder search URL should disappear after obsolete SearchAction markup is removed.

## Dataset warning

The automated rendered-HTML scan of 433 sitemap URLs found zero `Dataset` nodes. Therefore the Search Console warning is likely one of:

- historical markup;
- a non-sitemap URL;
- markup injected by GTM or another runtime layer;
- delayed Search Console reporting.

The affected URL from the Dataset report is still required before adding a `creator` field anywhere.
