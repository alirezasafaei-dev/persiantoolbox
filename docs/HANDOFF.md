# PersianToolbox Handoff — updated 2026-11-06

## Salary tax and insurance follow-up - 2026-11-06

Owner-approved PR253 is merged and deployed as `eaa5300e6b54f5f88f8078eab2164b8d4fe38bf9` by successful run42283444662; public version and health were rechecked for this follow-up. The owner now requests full tax/insurance verification. Continue the [source and coverage audit](growth/salary-tax-insurance-2026-11-06.md) and [focused plan](superpowers/plans/2026-11-06-salary-tax-insurance.md) on `codex/salary-tax-insurance-20261106`. Official tax originals are now accessible by ordinary direct HTTPS. Correct demonstrated tax brackets, daily insurance ceilings and payment exclusions in both calculators; preserve explicit pending scope for cumulative settlement, eligibility and special regimes. The audit records additional mission/region defects rather than claiming full certification. Owner explicitly authorized full verification and publication in the follow-up conversation; permission is retained, but release still requires exact-head gates and an honest coverage verdict. Candidate remains undeployed. Completion pass adds source-confirmed housing/child figures, explicit child insurance eligibility and a full-year ordinary-rate aggregate tax balance; in-year withholding and special regimes must not be falsely certified. Older sections below are historical checkpoints.

## Salary source review — 2026-11-06

PR #252 was owner-approved, merged and deployed as `8d86c11669d1f95e25239a99fb4aa848750614be` through successful production run42246080353. The public invoice font/download defect was verified fixed in Chromium desktop and mobile viewport. That historical release does not authorize this new salary work.

Continue the isolated [salary source review](growth/salary-source-review-2026-11-06.md) and [bounded plan](superpowers/plans/2026-11-06-salary-source-review.md). Original Ministry wage circular verified the monthly minimum-wage and daily-seniority discrepancies; review also found a duplicated food allowance. The candidate corrects these, retains explicit partial-review warnings and pending tax/insurance assumptions, and aligns source metadata/API docs. It is not a full legal-data refresh and is not deployed. Sentry triage and raw telemetry remain private outside this public repository; do not commit emails or exploit request bodies.

## Invoice font routing candidate — 2026-11-06

Owner-approved PR #251 is deployed as `0195bbc3164960f54f782d3abe1f541153518dae`; current public version/health were rechecked at 15:06 UTC. Its live invoice PDF export is still blocked by the stale production Nginx font alias: Regular.ttf returns 404. Continue with the [font route repair report](ops/invoice-font-routing-2026-11-06.md) and [bounded plan](superpowers/plans/2026-11-06-invoice-font-routing.md). The isolated `codex/invoice-font-route-20261106` candidate repairs the canonical deployment path and strengthens font verification. Local standalone download passed. The candidate requires its own exact-head hosted checks and owner merge/deploy approval; public repair and download verification remain pending. Do not replay PR #251 or mutate the stale checkout manually.

## Current release checkpoint — 2026-11-06

Owner-approved PR #250 merged as `1b6cccddf2b3bbd1b5981d8bfcdae10c4b51d7a9`. Main workflows succeeded, but detailed browser logs exposed a retry-passing OCR selection failure. Focused canonical standalone runs reproduced it, so production workflow `42204420647` was cancelled during its gate; its deployment job never ran. Public revision after cancellation remains `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`. Recheck live identity before future release operations.

Continue from the [OCR file selection recovery report](growth/ocr-file-hydration-2026-11-06.md) and [focused plan](superpowers/plans/2026-11-06-ocr-file-hydration.md). Preserve the owner checkout and the merged/source PR histories. The follow-up changes require their own exact-head review and owner merge/deploy approval; do not resume the cancelled run or claim that PR #250 is deployed. Historical handoff sections below remain point-in-time records.

## Current production checkpoint — 2026-10-11 15:54 UTC

**Follow-up, 16:14 UTC:** [backup restore and offline checks](ai/execution/FOLLOWUP-20261011.md) passed. The actual archive restored successfully into a disposable Unix-socket-only PostgreSQL cluster on the authorized server; every restored public table was readable and the cluster was removed. Chrome offline send retained the draft without automatic retry; offline reload showed the safe offline page, and online return restored the draft. These two earlier NOT_RUN items below are now superseded by this bounded evidence; physical-device/manual checks and full application recovery remain open. Production SHA is unchanged.

**Live runtime observed:** `https://persiantoolbox.ir/api/version` → `f58ef7ad7937de8810df5de4dd3a09ffffdec0f4`, version 8.0.0; health/ready passed. Recheck this point-in-time identity in the next session.

- **Completed:** owner-approved AI chat workspace [PR #233](https://github.com/alirezasafaei-dev/persiantoolbox/pull/233), homepage test-readiness [#232](https://github.com/alirezasafaei-dev/persiantoolbox/pull/232) and tools layout stability [#234](https://github.com/alirezasafaei-dev/persiantoolbox/pull/234) are merged. [Official production run 38140816741](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38140816741) succeeded with no migrations or recovery overrides and strict post-deploy reporting.
- **Browser acceptance:** **LIVE_VERIFICATION_PASS_WITH_WARNINGS**. One real Persian chat reply, history opt-in/reload/erase, mobile navigation/dialog/themes, 53 HTML paths, ten actual blog articles, nine tool interactions and 20 static assets verified. Mandatory second requests were 84–196 ms. See [complete date-stamped report](reports/live-verification/20261011-1554-persiantoolbox.md) and [exact-head CI/release evidence](ai/execution/RELEASE.md).
- **Rollback and backup:** previous production `cf370c54afc31e7ececc9f384f572e907a08443b` remains running as the verified rollback target. Fresh database archive integrity and mode `0600` passed; restore rehearsal remains NOT_RUN. Protected production configuration retained mode `0600`; canonical safety audits and cross-site deploy guard passed.
- **Warnings:** no JavaScript page exceptions; eight external trust-seal timeouts, expected unauthenticated trial 401 and navigation aborts recorded. No first-party 5xx or static JS/CSS/font 404 observed. General CI has two retry-passing flaky cases and 20 skipped tests. Historical intermittent DNS timeout cause remains UNPROVEN; no resolver change performed.
- **Remaining:** image [issue #230](https://github.com/alirezasafaei-dev/persiantoolbox/issues/230) is blocked on provider-authorized generation; [PR #229](https://github.com/alirezasafaei-dev/persiantoolbox/pull/229) stays draft/default off. Physical mobile/software keyboard, manual screen reader, true browser zoom 200%, offline acceptance, exhaustive tool journeys and backup restore rehearsal remain NOT_RUN. Billing Free status remains operator-attested; live quota stress was not run.
- **Continuation:** preserve owner checkout changes. Do not repeat the completed chat implementation, merge or deployment. Keep provider authorization and manual acceptance as explicit remaining work; do not bypass the image provider or change production quotas/network/billing silently. Docs-only follow-up commits are not application deployments.

---

## Historical production checkpoint — 2026-10-09 19:57 UTC

**Live runtime observed:** `https://persiantoolbox.ir/api/version` → `cf370c54afc31e7ececc9f384f572e907a08443b`; `/api/health` HTTP 200/ready. This is a **point-in-time** observation, not a substitute for checking live state at the next session.

- **Completed:** [PR #218](https://github.com/alirezasafaei-dev/persiantoolbox/pull/218) fixed legitimate browser Origin validation behind reverse proxy; owner-approved [canonical Blue/Green release run 37962079002 (attempt 3)](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/37962079002) succeeded with `RUN_MIGRATIONS=false` and strict deployment audit.
- **Slots:** Blue:3000 active on `cf370c54afc3`; Green:3004 retained rollback on `07adf70d4486`. Latest backup `persian_tools_predeploy_20261009T193235Z.sql.gz` passed `gzip -t`, not a documented restore rehearsal for this particular archive. Production secrets file remained protected with mode `0600`.
- **Browser acceptance:** Actual Chrome `/ai/chat` posted and displayed a real Persian AI reply (HTTP 200). Canonical Origin invalid body → HTTP 415; foreign Origin → 403. Nine core routes, ten blog articles, main Blog navigation, desktop/mobile chat composer/menu and sampled tools tested. See the [date-stamped complete report](reports/live-verification/20261009-1957-persiantoolbox.md). Verdict **`LIVE_VERIFICATION_PASS_WITH_WARNINGS`**.
- **Open operational follow-up:** intermittent VPS DNS resolution timeout during strict public audits, root cause **not proven**. Use the [read-only DNS diagnostic runbook](ops/PRODUCTION_DNS_RESOLVER_DIAGNOSTICS.md). No production resolver change approved or performed.
- **Other verification limitations:** Cloudflare Workers Free billing tier remains operator-attested, **not Billing-API-verified**; live 429 quota stress and exhaustive tool journeys were **NOT_RUN**. Do not change quotas, provider model, billing tier or production flags without separate review and owner approval.
- **Security clean-up:** temporary Germany-relay SSH authorization and its private/public keys were removed after the release; direct authorized Desktop Commander on VPS was online at last check.
- **Documentation work only:** Subsequent docs commits/PRs are not new application deployments. Preserve deployed SHA provenance; do not deploy a docs-only commit automatically. Continue independent work only within owner-authorized scope.

**Next work:** Track the intermittent DNS issue and optionally plan a separate, rollback-protected infrastructure change; keep issue [#210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210) as evidence context. Use current live read-only checks before any future production intervention. Do not repeat the completed AI chat merge, deployment, or quota migration.

---

## Historical handoff snapshot — 2026-09-21 (not current production state)

## Final deployment review snapshot — 2026-09-21

See [final deployment review](growth/homepage-ui-seo-2026-09/reports/post-merge-handoff.md) for the current evidence. Production is historically verified on `7c9559c569e618f187e3a222d6c6ee1cfdef530b` by run `35562641880`; this snapshot does not authorize a new release action. The former `deviceScaleFactor: 2` assertion is DPR density evidence, not browser zoom; actual browser zoom 200% remains NOT_RUN pending manual verification. The failed run `35551767845` proves 5-second request aborts on SSR/header checks, while a cold-start-only cause remains unproven. GSC/GEO remains BLOCKED pending authorized complete 28-day exports or read-only access.

## Earlier next action — 2026-09-21, historical only

At that date, continue review of PR #61 and the open verification items below; do not restart PT-00 or replay the original implementation plan. Actual browser zoom remains NOT_RUN, GSC/GEO is BLOCKED, and the underlying timeout cause is UNPROVEN. No new merge, deployment or rollback is authorized. Approval for the historical deployment is a separate unresolved evidence question, not an authorization for future actions.

The original assignment, baseline and executor instructions below are preserved for history only.

## Original assignment — historical

Owner approved a restrained homepage refresh (existing blue + limited teal, hero and cards) and asked for repository-resident instructions, rules, roadmap, tasks and CLI prompts.
ChatGPT manages direction/review; Codex CLI implements. Exchange evidence in issue #47; local execution uses the owner's c2 launcher when available. Direct access is limited to active connected sessions.

Start: [execution package](growth/homepage-ui-seo-2026-09/README.md).
Plan: [implementation steps](superpowers/plans/2026-09-20-homepage-ui-seo.md).
Status: [task board](growth/homepage-ui-seo-2026-09/TASKS.md).
Copyable executor instructions: [prompts](growth/homepage-ui-seo-2026-09/PROMPTS.md).

## Original baseline — historical, not current runtime state

- GitHub main at inspection: 7b743046b9f3d652ecfc2d2f2a64274550e2e21f.
- Public /api/version on 2026-09-20 reported the same SHA, version 8.0.0, builtAt 2026-09-18T22:03:01Z.
- Repository documentation update only. UI/SEO implementation has not started in this package.
- No merge, staging deploy or production deploy is authorized by this handoff.
- No current staging SHA was verified.
- GSC Wizard returned payment_required; current GSC metrics remain unavailable. Continue UI and verified SEO fixes; use authorized direct access or owner exports for analysis.

## Original executor action — historical, do not execute again

Inspect checkout and recent history, preserve user changes, create/resume isolated implementation worktree, read package and mark PT-00 IN_PROGRESS.
If this documentation branch is not merged, base implementation on it and open a stacked PR; do not merge it merely to begin work.
When code is ready, return candidate SHA, before/after images, real gate results and PR URL. Do not substitute an undeployed candidate SHA for production state.

## Operational correction

The older handoff and governance snapshot describe conflicting historical deploy topologies. The active contract is [PRODUCTION_DEPLOY_SAFETY.md](ops/PRODUCTION_DEPLOY_SAFETY.md).
It specifies the canonical blue-green engine and immutable shared static store. Observe current server state before an owner-authorized release; do not follow the archived independent legacy-deploy recommendation.
History: [July handoff](archive/handoff-2026-07-07.md) and [July governance](archive/agent-governance-2026-07-30.md).

## Update discipline

Append actual candidate/review/deploy outcomes with UTC time and evidence as work progresses. Never mark the design visually accepted or the release deployed without the corresponding owner decision and verification.
