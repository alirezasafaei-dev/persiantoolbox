# PersianToolbox Handoff — updated 2026-09-21

## Final deployment review snapshot — 2026-09-21

See [final deployment review](growth/homepage-ui-seo-2026-09/reports/post-merge-handoff.md) for the current evidence. Production is historically verified on `7c9559c569e618f187e3a222d6c6ee1cfdef530b` by run `35562641880`; this snapshot does not authorize a new release action. The former `deviceScaleFactor: 2` assertion is DPR density evidence, not browser zoom; actual browser zoom 200% remains NOT_RUN pending manual verification. The failed run `35551767845` proves 5-second request aborts on SSR/header checks, while a cold-start-only cause remains unproven. GSC/GEO remains BLOCKED pending authorized complete 28-day exports or read-only access.

## Current next action

Continue review of PR #61 and the open verification items below; do not restart PT-00 or replay the original implementation plan. Actual browser zoom remains NOT_RUN, GSC/GEO is BLOCKED, and the underlying timeout cause is UNPROVEN. No new merge, deployment or rollback is authorized. Approval for the historical deployment is a separate unresolved evidence question, not an authorization for future actions.

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
