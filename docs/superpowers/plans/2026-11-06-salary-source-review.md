# Salary source correction and honest partial review

## Approved scope and design

Continue the owner's request to investigate and repair stale salary data. Use the original Ministry of Labour circular 6682 dated 1405/01/31, obtained from its official public PDF, for verified wage figures. Do not invent source dates or treat a partial wage review as tax/insurance approval. Keep local-first calculations and explicit warnings for unresolved components. Implementation approval is not merge/deploy approval.

1. Add failing source-derived tests: daily rial to 30-day toman conversion, seniority conversion and consistent salary version metadata.
2. Correct only verified wage fields. Store public source URL/hash, review date and explicitly pending tax/insurance/other-benefit scope. Preserve the older complete-review timestamp and warning; show the limited new review separately.
3. Update arithmetic expectations and built-browser minimum-wage assertions. Run focused tests, full gates, standalone smoke and browser verification; request independent review before signed commit/push/PR.
4. Sentry is a separate diagnostic task. Emails prove production association but not request provenance/current frequency. Read current issue details only after authenticated access. Reproduce malformed input locally before any request-validation patch; do not suppress monitoring.

## Blockers

Official tax circular URL discovered at https://dotic.ir/news/20326 returns 403. Do not bypass it or substitute unverified third-party tables. Direct Sentry issue currently redirects to login; owner sign-in requested while independent salary work continues. Raw emails and telemetry remain outside Git and Gemini prompts.
