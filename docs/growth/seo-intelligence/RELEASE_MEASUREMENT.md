# Release measurement

| Change                                                                                                | Public release (UTC)                                       | Landing path                     | Earliest meaningful comparison                                                     | 7 / 14 / 28-day results |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| [#298](https://github.com/alirezasafaei-dev/persiantoolbox/pull/298) Invoice search intent            | 2026-11-21, SHA `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1` | `/tools/invoice-generator`       | Once final data covers 2026-12-05 for the planned 14-day window                    | PENDING_MEASUREMENT     |
| [#304](https://github.com/alirezasafaei-dev/persiantoolbox/pull/304) Certificate title and breadcrumb | 2026-11-27, SHA `62e26a0f0fba754d04302b41460b514d195abc44` | `/career-tools/work-certificate` | Nov 27 post-release crawl observed at 17:50 UTC. Earliest comparison through Dec 4 | PENDING_MEASUREMENT     |
| [#305](https://github.com/alirezasafaei-dev/persiantoolbox/pull/305) Letter field labels              | 2026-11-27, SHA `897ae74b8ec401a0db0c88cbbe0e0c45820d66dd` | `/writing-tools/formal-letter`   | When verified completion instrumentation has 7 finalized days                      | PENDING_MEASUREMENT     |

Baselines use the previous and current matched property windows in [Metrics](metrics-summary.json). Freeze a matched, URL-level reference before grading impact. Report organic changes separately from functional verification.

## Sitemap freshness correction

[PR #307](https://github.com/alirezasafaei-dev/persiantoolbox/pull/307) deployed `55373bc4fc0481238a1f48bd5256a88f532a61e0`. [Strict production verification](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/46078794473) completed at 23:10 UTC on 2026-11-27. The affected routes are address conversion, invoice, work certificate and formal letter. The four URLs remain self-canonical and the sitemap now gives their verified substantive update dates. The hypothesis is improved freshness accuracy. Use the URL aggregates in [Metrics](metrics-summary.json) as the observational baseline. Track the first observed crawl per URL, then compare 7, 14 and 28 settled days starting on the following full day. Status PENDING_MEASUREMENT.
