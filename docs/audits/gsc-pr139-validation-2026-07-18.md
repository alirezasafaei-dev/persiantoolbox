# PR #139 validation record — 2026-07-18

Branch: `seo/gsc-performance-hardening-2026-07-18`

## Scope isolation

Licensing-policy and commercial-license files were removed from this SEO PR. `AGENTS.md` and `CONTRIBUTING.md` were restored exactly from `main`. Licensing ambiguity remains independently tracked in Issue #143 and is not modified by this branch.

## Analyzer evidence

The original Search Console exports were validated locally:

- Performance: 348 clicks, 3,931 impressions, 8.85% CTR.
- Top consolidated path: `/text-tools/address-fa-to-en`.
- Coverage: 418 indexed, 439 not indexed, 48.8% index rate.
- Coverage strict mode correctly fails on the historical 5xx export rows.

## Content verification

The revised address-converter guide renders at the expected blog route, preserves RTL output and the internal tool link, and no longer claims unsupported batch conversion, universal place-name coverage, guaranteed postal acceptance, or free-form conversion that the product does not implement.

## Quality gates

Local branch validation passed:

- TypeScript typecheck
- Vitest: 1,277 tests
- local-first contract
- internal links check
- licensing validator against the current `main` policy
- production build

The following failures were reproduced on `main` and are baseline repository defects rather than regressions introduced by PR #139:

- lint
- performance budgets
- `ci:contracts`
- documentation links

## Production read-only verification

- Four representative `www` paths permanently redirect to the apex host.
- Query strings are preserved.
- TLS is valid.
- Apex canonical tags are self-referencing.
- Three consecutive full sitemap scans checked 433 URLs with zero 5xx and zero canonical mismatch.

## Deployment

No staging or production deployment, PM2 restart, Nginx reload, DNS change, CDN change, or Search Console validation action was performed.
