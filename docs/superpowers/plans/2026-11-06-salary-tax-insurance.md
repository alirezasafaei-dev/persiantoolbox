# Salary tax and insurance source verification

The owner explicitly requested completion of tax/insurance verification after PR253. Reuse the isolated worktree on `codex/salary-tax-insurance-20261106`, based on deployed main `eaa5300e6b54f5f88f8078eab2164b8d4fe38bf9`. No new dependency, network payroll processing, merge or deployment is authorized by this implementation request.

## Design and acceptance

Use primary circulars and issuer explanations, recording provenance and any mirrored original separately. Correct demonstrated defects in the existing monthly employee estimate; do not describe that estimate as a certified annual payroll system. Keep explicit pending scope for cumulative tax, special regimes, benefit entitlement and unclassified additional payments.

1. Verify annual 1405 tax thresholds from circular200/1005 and welfare exclusions from200/1405/59; inspect originals visually and record hashes outside Git. Verify insurance employee rate, daily sevenfold cap and child/mission exclusions from issuer material and original circular1000/1405/493.
2. Add failing regression tests for every tax boundary, exclusions, 29/30/31-day insurance caps, identical shared tax-calculator arithmetic, minimum-wage child insurance and net-to-gross round trips.
3. Introduce a small shared deductions module used by both existing calculators. Derive the cap from the daily minimum, retain fractional toman arithmetic, and explicitly identify the supported regular employee monthly assumptions. Preserve benefit options and exports. Do not silently certify eligibility or other formulas.
4. Update dataset field-level provenance, Persian scope/explanation and API example. Preserve the older whole-dataset date until every pending legal rule is verified. Add a source/coverage audit with PASS/FAIL/NOT_RUN and exact remaining gaps.
5. Run focused tests, full quick/contracts/build/canonical standalone smoke, built-browser salary and tax scenarios, independent review, security and licensing checks. Inspect staged changes before signed commit and push; prepare a draft PR. New owner merge/deploy approval remains required.

## Follow-up: qualifying mission allowance

Continue the owner request within the same Draft PR: replace the proven10%-daily-wage defect with one daily fixed wage per qualifying mission day (base input includes fixed job supplements, separately computed seniority is added). Explain article46 eligibility, travel costs and higher contractual entitlements; keep source-specific limitations. Add failing arithmetic regression before changing code, then final gates/browser/review and safe signed commit/push. Region/annual/eligibility findings remain independent pending work.

## Unsupported region guard

Owner authorized autonomous remaining work and publication, subject to readiness. Remove the unverified5% minimum-mode bonus; preserve the visible region option as explicitly unsupported and reject that regime in both calculators instead of silently ignoring it. Do not invent50% relief without current legal applicability and list validation. Source dotic8345 is list continuity, not5%pay authority. Add failing unit regression, browser error/output-clearing/recovery, full gates and review. Full certification remains open; this guard prevents false outputs rather than claiming regime support.

## Completion pass: amounts, eligibility and annual balance

Owner requested complete execution without premature stopping. Verify housing against official9234/1405/02/15 and childamount against issuerarticle86 explanation. Add insured-days input; require720days and a user-supplied count of age/education/medical-eligible children, reject missing/invalideligibility data instead of fabricating. Clarify seniority is same-workshop annualincrement; inherited increments remain included in base input. Add full-year ordinary-rate tax balance using official annualrial table, aggregated taxableannualincome and priorwithheld, beforearticle84generalexemption. Keep month-to-date/proration/specialrates distinct rather than invent them. Use local-only panel, Persianinput, negative/blankrecovery, source links, unitboundaries and builtbrowser proof. Follow review/gates/security then finish approved integration/deployment only if no blocking findings.
