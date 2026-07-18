# Google Search Console performance audit — 2026-07-18

## Export scope

- Property: `persiantoolbox.ir`
- Search type: Web
- Period: 2026-04-17 through 2026-07-16
- Page filter: none
- Chart rows: 91
- Page rows: 175
- Query rows: 193

## Property totals

| Metric | Value |
|---|---:|
| Clicks | 348 |
| Impressions | 3,931 |
| CTR | 8.85% |
| Average position | 9.15 |

The most recent 28 days produced 303 clicks and 3,550 impressions, compared with 36 clicks and 331 impressions in the preceding 28-day period. This is approximately +742% click growth and +973% impression growth while average position remained broadly stable.

## Leading pages, consolidated by path

| Path | Clicks | Impressions | CTR | Weighted position |
|---|---:|---:|---:|---:|
| `/text-tools/address-fa-to-en` | 147 | 612 | 24.02% | 5.58 |
| `/` | 58 | 516 | 11.24% | 4.74 |
| `/blog/2026-06-26-ocr-persian-guide` | 21 | 421 | 4.99% | 7.53 |
| `/salary` | 17 | 346 | 4.91% | 9.58 |
| `/tools/persian-ocr` | 15 | 193 | 7.77% | 8.37 |
| `/pdf-tools/edit/add-page-numbers` | 13 | 196 | 6.63% | 7.01 |
| `/tools/check-penalty` | 7 | 177 | 3.95% | 9.65 |
| `/blog/2026-07-08-late-payment-damages-cheque-promissory-note-guide` | 6 | 192 | 3.13% | 11.26 |
| `/date-tools/date-difference` | 0 | 87 | 0.00% | 8.28 |

## Primary conclusion

The Persian-address converter is the current organic acquisition engine. It accounts for roughly 42% of page-level clicks in the export and must be treated as a protected SEO asset.

Do not change its slug, remove its internal links, or perform a broad redesign without a measured rollout and rollback plan. Growth should come from improving adjacent opportunities rather than destabilizing the winning URL.

## Canonical host findings

The export contains 26 paths that appeared under both `persiantoolbox.ir` and `www.persiantoolbox.ir`. Non-canonical host rows account for 31 clicks and 490 page-level impressions.

Repository configuration already treats the apex host as canonical and the checked-in Nginx configuration redirects `www` to the apex host. Because the export covers three months, these rows can be historical. Verify current HTTPS behavior at the CDN/edge before changing application routing.

Acceptance criteria:

1. `https://www.persiantoolbox.ir/:path*` returns a single permanent redirect.
2. The destination is `https://persiantoolbox.ir/:path*` with path and query preserved.
3. No redirect chain or `200` response remains on the `www` host.
4. The apex page returns a self-referencing canonical.

## High-value opportunities

### Salary

- 346 impressions
- 17 clicks
- 4.91% CTR
- position 9.58

Prioritize queries around gross-to-net salary, net-to-gross salary, insurance, tax, and the 1405 tax year. Do not change the `/salary` URL.

### OCR

The OCR guide and OCR tool together exceed 600 impressions. Separate intent clearly:

- Tool: `OCR فارسی آنلاین`, `تبدیل عکس به متن`
- Guide: education, troubleshooting, image quality, and OCR workflow

### Late-payment damages

The calculator and guide together have meaningful first-page/near-first-page visibility but low CTR. Keep the calculator transactional and the article educational, with direct internal links between them.

### Date difference

`/date-tools/date-difference` has 87 impressions, zero clicks, and average position 8.28. This is a low-risk snippet/content quick win. Target phrases such as `محاسبه فاصله دو تاریخ`, `تعداد روز بین دو تاریخ`, and `اختلاف تاریخ شمسی و میلادی`.

## Content integrity finding

The address-converter guide previously described a free-form text box, batch conversion, complete coverage of all Iranian places, and guaranteed international postal formatting. The production tool is a structured form using a curated glossary and transliteration rules. The guide must describe the actual product and require users to review proper nouns and destination-specific postal requirements.

## Operational plan

### P0

- Preserve the winning address-converter URL.
- Verify current `www` HTTPS redirect behavior at the edge.
- Keep production 5xx monitoring active.

### P1

- Align the address guide with the real tool behavior.
- Update meaningful `lastModified` values after content changes.
- Improve `/date-tools/date-difference` snippet and on-page intent coverage.
- Improve salary, OCR, and late-payment clusters without changing URLs.
- Run mobile Core Web Vitals and form-friction checks.

### P2

- Use `scripts/quality/analyze-gsc-performance-export.mjs` for repeatable export analysis.
- Upgrade the internal Search Console dashboard with page/date/device dimensions and period comparison.
- Record deployment and metadata-change annotations so Search Console movement can be correlated with releases.

## Measurement rules

- Record URL, commit SHA, previous metadata, new metadata, target queries, and change date.
- Check for regressions after 7 days.
- Assess direction after 14 days.
- Make the principal SEO decision after a 28-day comparison.
- Avoid changing title, URL, content architecture, and UI simultaneously on the same winning page.
