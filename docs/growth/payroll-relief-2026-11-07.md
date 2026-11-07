# Payroll relief: primary-source review, 2026-11-07

## Release boundary

PR #255 is deployed at `ec2a05fe80d5ab8e271f36dd872ffd541218c60e`. Its canonical production run 42342562588 succeeded on attempt 2; attempt 1 failed a public DNS lookup and rolled back. This does not prove the intermittent resolver problem fixed. Public version and health were rechecked before this follow-up.

This follow-up is an implementation candidate on `codex/payroll-relief-20261107`, not a new deployment. The owner authorized continuing the review; this candidate needs its own exact-head checks and explicit merge/deploy approval. See the [implementation plan](../superpowers/plans/2026-11-07-payroll-relief.md).

## Article 92: bounded support

The official INTA registry publishes [interpretation 232/8296/ص, 1400/08/10](https://regulation.tax.gov.ir/lwvi?lid=txs5000089690&ty=mq), marked valid/permanent when reviewed. It establishes forgiveness of **50% of salary tax**, employment at the location named in the employment order and proven actual work there, and exclusion of mission work. Eligibility is documentary; residence alone is insufficient.

[Circular 99/80](https://regulation.tax.gov.ir/lwvi?lid=txs5000085272&ty=mq), also marked valid/permanent, continues the previous regional list until replacement. The calculator does not establish that a named county, address or employer qualifies today. The user must verify the exact employment location against the official list applicable to the period.

The cumulative calculator supports only ordinary employee income A wholly covered for the entire cumulative period, including every earlier list represented by previous tax. B and D must both be zero. Four confirmations are required in both the form and calculation function: applicable official-list membership, employment-order plus actual-work evidence excluding mission, coverage of all A income and prior lists, and absence of other personal/combined relief. Partial periods, mixed eligible/ineligible income, special income and combined exemptions remain unsupported. The monthly salary calculator's existing regional guard is unchanged.

Order: compute ordinary cumulative tax using the existing 1405 engine, forgive half, then subtract previously computed tax. For A = 100,000,000 toman in month 1, ordinary tax is 7,000,000, forgiveness is 3,500,000 and remaining cumulative tax is 3,500,000. With previous tax of 5,000,000, the signed difference is -1,500,000 and payable is zero. The displayed credit is a reconciliation amount, not a promised refund.

## Article 25: disability relief remains blocked

The [official implementation regulation](https://regulation.tax.gov.ir/lwvi?lid=txs5000086937&ty=mq) and [original government PDF](https://media.dotic.ir/uploads/org/157518814085139800.pdf) require one employed parent or legal guardian, severe/very severe disability, responsibility for costs, and a Welfare Organization certificate identifying the employer/workplace. The certificate and continuing conditions matter; a checkbox alone cannot establish eligibility.

The regulation does not settle the ordering relative to article 84. A secondary transcription of circular 200/98/95, dated 1398/11/14, describes that ordering, but its original issuer copy was not obtained. It is not accepted as implementation authority. [Official legal opinion 7/1400/558](https://regulation.tax.gov.ir/lwvi?lid=txs5000102263&ty=nz) confirms the legal-guardian point, not the missing calculation order. Automatic article 25 computation remains blocked pending a primary ordering source and tests.

## Article 18: family relief remains blocked

The [original family law](https://dotic.ir/news/10763) makes the salary exemption subject to annual budget provision and qualifying children. The [1402 instruction](https://dotic.ir/news/15041) is year-specific; its expanded scope cannot be silently carried into 1405. [INTA's 1403 circular](https://regulation.tax.gov.ir/lwvi?lid=txs5000087849&ty=mq) explicitly notes the absence of that year's budget authority, showing why a filing field alone does not establish entitlement.

[Legal opinion 172187, 1404/10/10](https://dotic.ir/news/20776) establishes use of the latest fertility statistics announced by the Interior Ministry. The [official fertility circular and attachments](https://regulation.tax.gov.ir/lwvi?lid=txs5000136438&ty=mq) provide year-specific 1402/1404 treatment, not independent 1405 budget authority. No automatic current-year family exemption is enabled. Obtain explicit 1405 authority and verify the applicable announced fertility list before implementing this case.

## Evidence and remaining work

Original documents are retained privately, not uploaded with user data or committed as binaries. SHA-256 of the disability regulation PDF: `4e086f7d7eb195f0564f921c161c135666189b7579fc416eec6a23deb48e614e`; latest-fertility legal opinion PDF: `ffbe7fee98c4c8df3eb7005742260c4040998dc06ab1cca1daef953ce63a31c4`.

Verification executed against this candidate:

| Check                                                  | Result                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Focused regional + cumulative unit tests               | PASS, 51 tests including 13 regional cases                                                                               |
| `pnpm ci:quick`                                        | PASS, 271 files / 2,109 tests; lint, typecheck and local-first gate passed                                               |
| `pnpm ci:contracts`                                    | PASS, including licensing and documentation links                                                                        |
| `pnpm build`                                           | PASS; existing Edge Runtime deprecation warning retained                                                                 |
| `pnpm --config.shell-emulator=true predeploy:smoke`    | PASS, canonical standalone / 11 route checks                                                                             |
| Built Chromium payroll + cumulative flows              | PASS, 7 tests, zero retries, widths 1440 and 390                                                                         |
| Final strengthened cumulative flow                     | PASS, 2 tests, zero retries; revoked confirmation and end-of-flow page-error assertion                                   |
| Visual review                                          | PASS, RTL at widths 1440/390 in light/dark; no horizontal overflow; desktop browser viewports, not physical-device proof |
| Independent read-only source/math/scope review         | PASS; minor page-error assertion placement corrected                                                                     |
| Repository secret scan and production dependency audit | PASS, no detected high-risk patterns / no known vulnerabilities                                                          |

Screenshots and command logs remain private outside the repository. A first private screenshot capture used an incorrect consent-button label and timed out; it was corrected to the exact existing label and the four captures then succeeded. No product behavior was changed for that capture.

This is bounded source verification, not universal legal certification. Personal and combined cases remain explicitly blocked; other special payroll regimes are outside this change. Hosted exact-head checks and owner-authorized production verification are separate release gates.
