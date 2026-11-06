# Salary tax and insurance source verification

The owner explicitly requested completion of tax/insurance verification after PR253. Reuse the isolated worktree on `codex/salary-tax-insurance-20261106`, based on deployed main `eaa5300e6b54f5f88f8078eab2164b8d4fe38bf9`. No new dependency, network payroll processing, merge or deployment is authorized by this implementation request.

## Design and acceptance

Use primary circulars and issuer explanations, recording provenance and any mirrored original separately. Correct demonstrated defects in the existing monthly employee estimate; do not describe that estimate as a certified annual payroll system. Keep explicit pending scope for cumulative tax, special regimes, benefit entitlement and unclassified additional payments.

1. Verify annual 1405 tax thresholds from circular200/1005 and welfare exclusions from200/1405/59; inspect originals visually and record hashes outside Git. Verify insurance employee rate, daily sevenfold cap and child/mission exclusions from issuer material and original circular1000/1405/493.
2. Add failing regression tests for every tax boundary, exclusions, 29/30/31-day insurance caps, identical shared tax-calculator arithmetic, minimum-wage child insurance and net-to-gross round trips.
3. Introduce a small shared deductions module used by both existing calculators. Derive the cap from the daily minimum, retain fractional toman arithmetic, and explicitly identify the supported regular employee monthly assumptions. Preserve benefit options and exports. Do not silently certify eligibility or other formulas.
4. Update dataset field-level provenance, Persian scope/explanation and API example. Preserve the older whole-dataset date until every pending legal rule is verified. Add a source/coverage audit with PASS/FAIL/NOT_RUN and exact remaining gaps.
5. Run focused tests, full quick/contracts/build/canonical standalone smoke, built-browser salary and tax scenarios, independent review, security and licensing checks. Inspect staged changes before signed commit and push; prepare a draft PR. New owner merge/deploy approval remains required.
