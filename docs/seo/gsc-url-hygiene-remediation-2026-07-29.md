# GSC URL Hygiene Remediation — 2026-07-29

## Evidence and scope

The 2026-07-29 GSC export and source review identified three literal regex fragments in HowTo JSON-LD and five legacy internal tool URLs. This remediation changes only those proven sources and preserves legacy traffic with one-hop permanent redirects.

## Changes

- HowTo JSON-LD now emits `/tools/vat-calculator`, `/tools/report-generator`, and `/tools/tax-calculator` exactly.
- Internal links now point directly to `/tools/check-penalty`, `/tools/loan-vs-investment`, `/tools/overtime-calculator`, `/tools/leave-calculator`, and `/tools/inflation-calculator`.
- `next.config.mjs` retains only those five legacy aliases as permanent redirects to their canonical routes.
- Root and nested `opengraph-image` routes retain image responses while returning `X-Robots-Tag: noindex, nofollow`.
- Contract tests reject the observed regex fragment, `${provider.id}`, literal placeholder URL segments, and crawler URL method suffixes in source-controlled SEO content.

## Non-goals and ownership boundary

No redirect was added for `${provider.id}` or `*GET` crawler noise because neither is emitted by this repository. The separately owned `alirezasafaei-dev/awesome-free-llm-apis-ir` repository and its live `llm.persiantoolbox.ir` deployment were inspected: a live provider page returned `200` with canonical JSON-LD, sitemap and `llms.txt` contained no literal placeholder, and the literal provider-placeholder path returned `404`. Source templates interpolate `provider.id` at build/runtime, but the literal was not emitted in the inspected live responses, so no cross-repository change is proposed.
