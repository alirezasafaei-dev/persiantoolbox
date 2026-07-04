# Blog Taxonomy Normalization Plan — 2026-07-04

## Current Categories (from content)
- مالی
- متنی
- آموزشی
- ابزار
- حقوقی
- ... (see audit for full)

## Duplicates / Synonyms
- متن / متنی / نگارش → consolidate to "نگارش"
- ابزار / ابزارها → "ابزار"
- راهنما / راهنماها → "راهنما"
- آموزشی / آموزشی? → keep "آموزشی"

## Proposed Canonical
- مالی
- نگارش
- آموزشی
- ابزار
- حقوقی
- PDF و تصویر
- ...

## Migration Map
- Update frontmatter category in articles
- Update links /blog/category/...
- Consider redirects for old category urls if slugs change
- Update getAllCategories and filters in lib/blog.ts if needed

## Risks
- SEO: category pages ranking
- Internal links
- User bookmarks

## Script Proposal
A future script to batch update md frontmatter with mapping.

## Next
After plan approval, implement in controlled PRs preserving URLs.
