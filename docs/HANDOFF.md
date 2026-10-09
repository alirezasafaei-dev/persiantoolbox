# PersianToolbox Handoff — updated 2026-10-09

## Current production checkpoint — 2026-10-09 19:57 UTC

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
