# Agent Governance — PersianToolbox

## Current priority — 2026-09-20
For the approved homepage/UI/SEO/GEO program, start at [the execution package](docs/growth/homepage-ui-seo-2026-09/README.md), then read its design, implementation plan, task board and prompts.
The owner approved the restrained blue/teal homepage direction and selected Codex CLI as implementer, with ChatGPT coordinating scope and reviewing evidence. Do not restart completed work or re-ask general design approval.

For other tasks, follow the owner's requested scope; [docs/roadmap.md](docs/roadmap.md) indexes growth work. This program does not authorize unrelated backlog execution.

## Roles and working loop
- Owner: product decisions, final visual acceptance, explicit merge/deploy authorization.
- ChatGPT: project direction, prioritization and evidence-based review.
- Codex CLI: inspect, implement, verify, document, sign off commits, push a task branch and prepare a PR.
- The owner relays CLI reports to ChatGPT; do not pretend a persistent agent connection exists.
- Continue authorized independent work until it is reviewable. Resolve routine implementation choices yourself.
- Escalate only concrete scope changes, missing access or actions requiring explicit approval. Record blockers and the smallest next action; do not freeze independent tasks.
- Never label a task complete without evidence. Use PASS, FAIL and NOT_RUN accurately.

## Before editing
```bash
git status --short --branch
git log -5 --oneline
git diff --stat
```
Read docs/HANDOFF.md, the current task plan, package.json and any nested AGENTS.md.
Recheck live /api/version and /api/health for runtime-related work. Historical docs are not current runtime evidence.
Work in an isolated branch/worktree. Preserve existing user changes; no destructive reset, clean or force push.
Use one independently reviewable task at a time. Update task status, attach evidence and commit before moving to the next deliverable.

## Product and implementation rules
- Persian UI, RTL and dark-mode support; preserve keyboard access and responsive layouts.
- Preserve privacy-first/local-first behavior. Do not move documents, resumes, invoices, contracts, PDFs, images or sensitive text to a server without task-specific authorization.
- Preserve existing premium gates, export credits, entitlement checks and tool behavior.
- Use existing product patterns and useToast(); copy confirmation is «کپی شد».
- Prefer scoped homepage styling for this program; no global palette replacement, new dependencies or unrelated refactors.
- Never fabricate testimonials, traffic, ranking, growth, test results or audit scores.
- Use pnpm, not npm/yarn for project commands. Respect packageManager and the lockfile.
- Do not weaken tests, CI gates, CSP, auth, licensing checks or production verification.
- Never print or commit credentials or complete environment files. Raw private GSC exports and sensitive queries do not belong in this public repository.
- Keep the execution worktree clean after signed commits. A dirty unrelated user worktree is left untouched.

## Contribution governance
Every commit requires Signed-off-by under [DCO.md](DCO.md).
Read [individual CLA](docs/licensing/cla-individual.md) or [corporate CLA](docs/licensing/cla-corporate.md) as applicable. Do not bypass pnpm licensing:validate.
Use the authorized contributor identity; do not invent another person's sign-off.

## Verification
Use the task's focused checks during development; run these gates for the final application candidate:
```bash
pnpm ci:quick
pnpm ci:contracts
pnpm build
pnpm predeploy:smoke
```
Run the plan's relevant Playwright checks and visual review as well. Commands and exit codes go into the report; prior successful checks are not today's evidence.
For docs-only changes, verify links, referenced paths, diff scope, formatting and consistency. Do not claim application tests ran when only docs were changed.
Standalone production smoke must use .next/standalone/server.js via the canonical smoke tooling, with copied static/public assets. Do not use next start for that build mode.

## Deployment authority and safety
**NEVER deploy staging or production without explicit owner approval.**
Design approval, PR creation, a plan, or “continue implementation” is not deploy authorization. This package also does not authorize merge.
The current source of truth is [Production Deployment Safety](docs/ops/PRODUCTION_DEPLOY_SAFETY.md), plus [Post-Deploy Live Verification](docs/ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md).
Production mutations run only through ops/deploy/deploy-production-blue-green.sh or documented wrappers that delegate to it. Do not invent a second deploy path.
Require immutable SHA, verified backups, inactive-slot verification, complete assets, rollback retention and strict public verification. Never build in place on the active release, delete the active process or skip candidate/asset checks.
Ports 3002/3003 belong to the portfolio and must not be reused by this project.
Observe current topology at execution time. The July “remove nginx static alias” instruction is historical and conflicts with the newer immutable-store contract; it is not an active instruction. Do not mutate nginx merely because of this documentation correction.

## Key references
- [Current handoff](docs/HANDOFF.md)
- [Growth roadmap](docs/roadmap.md)
- [Program package](docs/growth/homepage-ui-seo-2026-09/README.md)
- [Deployment risk history](docs/ops/deploy-and-risk-log.md)
- [Product roadmap](docs/product/phased-execution-roadmap-codex.md)
- lib/tools-registry.ts; lib/navigation.ts; lib/brand.ts
- shared/ui/ToastProvider.tsx

The previous governance/handoff text is preserved in [the historical snapshot](docs/archive/agent-governance-2026-07-30.md). Its version numbers, process states, test counts and server instructions are not current facts.
