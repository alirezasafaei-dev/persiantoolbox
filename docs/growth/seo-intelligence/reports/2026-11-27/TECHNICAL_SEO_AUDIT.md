# Technical SEO audit

The public sitemap returned HTTP 200 with 480 unique URLs. The audit used rate-limited, JavaScript-disabled HTML responses. The four approved pages and sampled PDF destinations returned HTTP 200 and were self-canonical and indexable in the sampled HTML. Persian OCR is at [/tools/persian-ocr](https://persiantoolbox.ir/tools/persian-ocr). Published robots rules allow public content for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended, with restricted routes explicitly excluded. No AI visibility or field Core Web Vitals verdict has been established. The public homepage sitemap date is manually pinned to 2026-09-13. Treat it as a freshness review, pending evidence of a material content change.

[Latest checkpoint](../../LATEST.md)

## HTML crawl coverage

Attempted 275/480 sitemap URLs. HTTP 200 275, other HTTP statuses 0, request errors 0, canonical mismatches 0, noindex 0, missing H1 0, multiple H1 0. Duplicate titles 2 groups and descriptions 2 groups in the sampled HTML. This is a static SSR probe, and any duplicate needs intent review.

The sitemap dates for invoice (2026-09-13) and work certificate (2026-06-30) predate confirmed substantive live updates on 2026-11-21 and 2026-11-27. Update the maintained registry dates and add an emitted-sitemap regression. Avoid stamping every route with the build date.

## Google inspection

All four approved pages, the PDF hub, PDF split, PDF merge, Persian OCR, market API documentation and national ID validation passed inspection. PDF compression is the exception among the inspected priority routes. The live page is crawlable, while the inspection result has no crawl timestamp. Investigate indexing evidence and avoid treating a sitemap entry as Google acceptance.
