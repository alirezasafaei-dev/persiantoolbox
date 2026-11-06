# Salary source correction — partial review, 2026-11-06

## Verified defect and bounded correction

The published salary feed and bundled calculator used a monthly minimum wage of 15,066,904 toman. The original Ministry of Labour circular 6682, dated 1405/01/31, specifies a daily minimum of 5,541,850 rial. For the existing 30-day reference month this is 16,625,550 toman. Daily seniority is 166,667 rial, yielding 500,001 toman for 30 days; the prior 500,000 value silently discarded one toman. Food and marriage amounts in the dataset agree with the circular. Eligibility for those amounts is not certified by this data review.

Primary source: [original Ministry PDF](https://www.mcls.gov.ir/icm_content/media/image/2026/04/%D8%A8%D8%AE%D8%B4%D9%86%D8%A7%D9%85%D9%87%20%D9%85%D8%B2%D8%AF%201405_885380.pdf). Downloaded HTTP 200 and page 1 visually inspected. SHA-256: `3a48fa71fbc7a3219ac8ba5f6a0cc88574493bfc2d69828df68176b8ca7aa65a`. The document itself remains outside Git. These calculations derive from the original source, not a claim copied from another calculator.

Independent review found an additional calculation defect: food allowance was added unconditionally and added a second time when the worker coupon checkbox was enabled. The general salary calculation now includes that optional allowance exactly once. With base15M, housing3M and otherwise-zero/disabled inputs: coupon off gives18M gross, coupon on20.2M gross. The separate minimum-wage mode continues to include the food allowance once.

## Honest provenance and limitations

- Dataset version changes to v2, but `updatedAt=2026-04-26` is deliberately preserved as the older whole-dataset review timestamp. The new `review.reviewedAt=2026-11-06` covers only the listed wage fields; it is not a full legal refresh. Consumers must inspect `review.status`, `verified` and `pending`.
- Salary badge now uses dataset metadata instead of the unrelated hardcoded 2026-06-20 date. The older-data warning is retained. A separate Persian notice gives the specific partial review and pending areas.
- Salary introduction and case-study claims are qualified as estimates, not legal accuracy. No “100% accuracy” or most-used ranking claim is retained for this tool.
- API documentation renders the actual dataset, including all tax brackets and partial-review metadata, instead of publishing a stale v1 example or a misleading abbreviated two-bracket table. `salary-laws-v1` in ETag remains the stable API/cache namespace of this `/v1.json` endpoint, not the payload's review version.
- Tax brackets, insurance rules, housing, transportation, child allowance and eligibility remain pending. The discovered official tax circular [dotic.ir/news/20326](https://dotic.ir/news/20326) returned403. Its protection was not bypassed and third-party tables were not substituted as official verification. Pending values remain inherited assumptions, not newly certified law.
- This bounded change does not certify every formula, the separate tax tool, all benefits or insurance exclusions. Those require primary-source follow-up. Removing a warning or changing its date would conceal that unresolved work.

## Verification checkpoint

Source conversion and metadata regressions were observed failing before implementation. The food checkbox regression likewise failed with the duplicated allowance before the calculation change. Focused checks then passed. Initial full quick gate passed267files/2010tests before the food correction; subsequent full gate passed267files/2011tests after it. Build and contracts passed; canonical standalone smoke passed11routes. Final built-browser Chromium verification passed both minimum-wage outputs and the expanded optional-coupon toggle with zero retries (2/2). Final independent review closed all findings; focused salary tests also passed16/16. Initial smoke/browser attempts made before build completion or while the smoke port was busy failed operationally; after complete build and sequential execution the canonical smoke and both browser cases passed. Earlier browser passes do not stand in for these final results.

Gemini received only a small public-facts conversion/test-matrix task with no tools or repository access. Its one-toman discrepancy label was independently checked and corrected by the lead; agent output was not used as legal authority.

## Release boundary

This is an isolated draft candidate, not a production fix or full legal approval. Full final verification, independent review and hosted exact-head checks are required before integration. Owner approval of PR252 covered the already-deployed invoice font fix, not this separate change. No new merge or deployment has been performed.
