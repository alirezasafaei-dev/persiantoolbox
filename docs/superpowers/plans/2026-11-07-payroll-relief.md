# Payroll relief source review and bounded implementation

Owner approved continuing the outstanding relief review. Use isolated branch `codex/payroll-relief-20261107`, based on deployed main `ec2a05fe`. No new dependencies or document uploads. Implementation approval is not new release authority.

## Design

Keep unsupported personal/combined cases blocked. Add only article 92 for ordinary employee income A entirely covered during the cumulative period. Require confirmation of official applicable-list membership, employment-order/actual-work proof (excluding mission), whole-period and prior-list coverage, and absence of other relief. The tool does not adjudicate a location or certificates. Forgive 50% of cumulative tax, then subtract previous computed tax; do not halve income or previous tax. Preserve the monthly salary region guard. Explain article 25 certificate/ordering limits and article 18 annual-budget/latest-fertility requirements through primary source links.

## Tasks

- [x] Write failing regional unit tests: tax reduction vs base reduction; previous tax after relief; signed credit; all attestations mandatory; B/D rejection; invalid input. Verify ordinary default behavior through the existing browser flow.
- [x] Implement `features/salary/regional-tax.ts` wrapper around unchanged cumulative engine; expose before/relief/after tax and current difference. UI uses existing named result and generic personal guard, plus a separate regional request and four confirmations. Missing confirmations/combined relief suppress result and give explicit recoverable validation.
- [x] Add browser scenarios for missing confirmations, eligible A of 100 million yielding 3.5 million tax, previous tax of 5 million yielding 1.5 million credit, mixed-income guard and recovery. Verify responsive RTL and sources; add provenance without claiming universal review.
- [x] Run focused tests, quick checks, contracts, build, canonical standalone smoke, built Chromium and independent source/code review. Results are in the [audit](../../growth/payroll-relief-2026-11-07.md).
- [ ] Complete security/staged scan, licensing and current GitHub terms review before signed commit/push; prepare a reviewable PR and verify exact-head hosted checks. Do not deploy without concrete owner approval.

## Sources and source limits

Official INTA [article 92 interpretation 232/8296/ص](https://regulation.tax.gov.ir/lwvi?lid=txs5000089690&ty=mq), dated 1400/08/10, is marked valid/permanent in the registry. It requires employment-order location and actual work; mission is explicitly excluded. [Circular 99/80](https://regulation.tax.gov.ir/lwvi?lid=txs5000085272&ty=mq) preserves the prior list until replacement. Require external applicable-list confirmation; do not assert membership from residence.

The [official disability regulation](https://regulation.tax.gov.ir/lwvi?lid=txs5000086937&ty=mq) confirms eligibility conditions. The original INTA 98/95 ordering instruction has not been obtained; secondary transcription is insufficient. Automatic personal relief remains blocked.

The [official fertility circular](https://regulation.tax.gov.ir/lwvi?lid=txs5000136438&ty=mq) specifically addresses 1402/1404 application; it does not establish 1405 budget authority. [Primary legal opinion 172187](https://dotic.ir/news/20776) confirms the latest announced fertility basis. Do not enable an automatic current-year family claim without its authority.
