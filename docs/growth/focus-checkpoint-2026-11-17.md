# Focus program checkpoint - 2026-11-17

## Authoritative release

The public version and health endpoints were checked on 2026-11-17. Both identify
`15c8680d75bae8dbef4b0ba2ab45abd62d694d69`; health returned HTTP 200 and ready.
The canonical [production workflow](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/43736630922)
was independently rechecked as completed/success at this SHA.

Delivered owner-approved changes:

- [PR #288](https://github.com/alirezasafaei-dev/persiantoolbox/pull/288): strict
  market snapshot validation/public GET access, reference-rate units and
  precision, applying scenarios, and developer/market discovery.
- [PR #290](https://github.com/alirezasafaei-dev/persiantoolbox/pull/290): local
  market tools stay usable while quotes are unavailable.
- [PR #289](https://github.com/alirezasafaei-dev/persiantoolbox/pull/289): two
  employment-certificate wording examples and bank-recipient guidance.

The earlier [specialist discovery audit](specialist-discovery-2026-11-13.md)
and [market validation audit](market-api-validation-2026-11-13.md) describe
candidate-stage evidence. Their undeployed wording is historical. Do not merge
their source PRs separately to repeat the integrated release.

## Live acceptance and limits

The local, ignored 2026-11-17 live-verification report retains the actual
receipts: 18 HTTP checks, 59 broad desktop/mobile browser checks, two focused
viewport runs and eight OCR/hydration tests passed. Focused checks covered market
outage messaging, applying a scenario, local calculation and certificate text.
There were no page exceptions. Anonymous account/trial/subscription HTTP 401s
and one aborted account prefetch were retained as warnings. An initial targeted
harness stall was resolved with bounded waits; that failed attempt was retained.
This checkpoint does not claim these checks were rerun during documentation work.

`/api/market` was rechecked on 2026-11-17 and **still returns HTTP 503**. No
replacement source has yet passed both explicit public-redistribution licensing
and production connectivity qualification. Do not replace failed quotes with
invented values or label this incident fixed. CoinGecko offers a separately
agreed redistribution license; a licensing inquiry is not a license or a
purchase. Contact submission status and private business details stay outside
this public repository.

No additional payment or paid export was performed during this verification.
The overall release verdict remains `LIVE_VERIFICATION_PASS_WITH_WARNINGS`;
it does not certify availability of market data.

## Bounded next actions

1. Keep the approved priorities: address conversion, invoices, work certificates
   and formal letters. Do not expand into generic-tool backlog work.
2. Diagnose the invoice mobile journey before changing metadata. The latest
   authorized, read-only Search Console analysis has final data through
   2026-11-15 and compares two equal 14-day periods with matching weekdays.
   Invoice clicks declined and the device view points to mobile, but page,
   device and query totals do not reconcile exactly. Preserve that limitation;
   the data alone does not prove a mobile implementation defect.
3. Do not attribute the mixed-period traffic changes to the November 13 or 15
   releases. Collect comparable post-release data before evaluating their
   organic impact. Raw exports and private search queries remain outside Git.
4. Resume market-source integration only after rights, units, freshness and
   production-host connectivity are qualified. Preserve the public unavailable
   response and independently usable local tools in the meantime.
5. Keep new changes independently reviewable. Existing source-PR green checks
   do not prove a new candidate or authorize another release. Follow the
   [deployment safety contract](../ops/PRODUCTION_DEPLOY_SAFETY.md) and
   [live acceptance policy](../ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md).

This is a documentation correction. Application tests/build were not rerun for
it; no application or infrastructure behavior is changed.
