# Blog Taxonomy Normalization Plan - 2026-07-04

## Current Duplicates

The blog currently contains fragmented visible categories for the same content families:

- `متن`, `متنی`, `نگارش`
- `ابزار`, `ابزارها`
- `راهنما`, `راهنماها`
- `آموزش`, `آموزشی`

## Canonical Visible Categories

- `نگارش`
- `ابزارها`
- `راهنما`
- `آموزشی`

## Migration Map

| Current label | Canonical visible label |
| ------------- | ----------------------- |
| متن           | نگارش                   |
| متنی          | نگارش                   |
| نگارش         | نگارش                   |
| ابزار         | ابزارها                 |
| ابزارها       | ابزارها                 |
| راهنما        | راهنما                  |
| راهنماها      | راهنما                  |
| آموزش         | آموزشی                  |
| آموزشی        | آموزشی                  |

## SEO Risks

- Existing category URLs may already be indexed, so article URLs and raw category route params must not be renamed abruptly.
- Duplicated category pages can split internal authority if canonicalization and redirects are changed without crawl evidence.
- A visible-label-only normalization is safer first because article slugs and existing category routes remain available.

## Future Redirect Strategy

1. Measure indexed category URLs in Search Console.
2. Pick canonical category route slugs for each normalized family.
3. Add 301 redirects from legacy category routes to canonical category routes.
4. Update sitemap generation only after redirects are verified.
5. Keep article URLs unchanged.

## Content Migration Plan

1. Keep raw frontmatter categories stable during the first UI normalization pass.
2. Use the image/content audit reports to identify low-risk posts for frontmatter cleanup.
3. Batch frontmatter category edits by normalized family, no more than one family per PR.
4. Validate category pages, sitemap, RSS, and internal links after each batch.
5. Remove compatibility helpers only after redirects and content frontmatter are fully aligned.
