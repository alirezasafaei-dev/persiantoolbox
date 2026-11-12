# Business-document export release — 2026-11-12

Owner-approved Word PR #272 (`69e44710`) and PDF PR #273 (`712272fd`) were merged and released together as `239fa12d975a0c2c781b34908ec8d41724f81d44` through [canonical run 43297644864](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/43297644864). The workflow completed successfully. Public version and health returned that exact SHA, status ok and ready true after live acceptance.

## Evidence and boundaries

Both PR heads passed all 14 hosted checks. Independent read-only review found no actionable defects in the Word, PDF or CI-memory patches. Combined-source focused checks passed 13 tests; the PDF candidate passed 2,147 unit tests, contracts, build, 11 standalone route checks and 11 Chromium journeys. The Lighthouse heap failure was corrected by matching the existing core-build 4096MB limit; its actual four-URL audit then passed without assertion changes.

Live acceptance passed 48 HTTP checks, 58 browser page/tool checks, 10 desktop/mobile OCR and invoice-download journeys, three isolated native-navigation tests and two synthetic business-PDF download/failure tests. The actual browser-downloaded PDF was parsed, rendered and visually inspected. Word layout was verified using installed Microsoft Word before release; no extra paid Word export after release is claimed.

Initial concurrent checks encountered nginx general-limit HTTP503 responses and one no-JavaScript navigation stability timeout. Both original outcomes were retained. Isolated navigation recheck passed all three tests; the final more slowly paced 58-check browser run passed with no page exceptions, no failed-request events and no503 responses. Only expected guest401 responses remained. No security controls or test assertions were weakened.

The strict deployment report passed security headers, database read/write transaction and fresh-backup checks. Previous release `6818ce81447b4649cd45372b1f11ee2f9ffd8574` remains the rollback target. No migrations were requested. Raw operational details and account evidence stay private outside this public repository.

The PDF tests used synthetic documents and mocked credit/subscription endpoints with real production code, fonts and downloads. No extra production credit or payment was consumed. A live financial refund, physical-phone behavior and post-release paid Word export are NOT_RUN and are not implied by this acceptance. Future financial tests require their own scope; this record authorizes no additional release.

## Follow-up

The approved Word/PDF implementation, review, merge, deployment and nonfinancial live acceptance are closed. Return to the growth roadmap with fresh Search Console evidence; ranking improvements and first-page placement are unproven and are not consequences established by this release. Historical candidate checkpoints remain point-in-time records superseded by this release receipt.

LIVE_VERIFICATION_PASS_WITH_WARNINGS
