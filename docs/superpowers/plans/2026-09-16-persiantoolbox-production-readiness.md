# PersianToolbox Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task.

**Goal:** produce one clean, reviewable release branch that closes security debt, fixes tag indexability, integrates validated SEO work, and passes official release gates without deploying production.

**Architecture:** Build from current `origin/main`, preserve independent SEO intent, use TDD for behavior changes, and verify with the repository's existing CI/release workflows. Avoid broad refactors and duplicate work.

**Tech Stack:** Next.js 16, React 19, TypeScript, pnpm, Vitest, Playwright, GitHub Actions.

**Spec:** current GitHub issues/PRs plus repository AGENTS/README/deploy instructions.

## Global Constraints
- Never deploy production from this branch.
- No gate weakening, fake PASS claims, or unrelated refactors.
- Security audit must report zero production vulnerabilities.
- Sitemap must contain only routes that render indexable pages.
- Integrate validated scopes from PRs #16, #18, #22, #23, #24, #25, #26, #27; avoid duplicate #19/#21 work.
- Every new bugfix follows RED -> GREEN -> regression verification.

---
### Task 1: Tag route indexability
**Files:** `app/blog/tag/[tag]/page.tsx`, focused regression test.
- [ ] Add a failing test for percent-encoded Persian tag params.
- [ ] Confirm it fails because the route does not decode before lookup/render.
- [ ] Add the minimal shared decode behavior used by category routes.
- [ ] Verify focused tests and sitemap/indexability contract.
- [ ] Commit independently.

### Task 2: Integrate validated SEO/correctness work
**Branches:** PR #16, #18, #22, #23, #24, #25, #26, #27.
- [ ] Cherry-pick/replay only production commits and their regression tests onto current main.
- [ ] Resolve overlap by preserving current-main behavior and each PR's proven intent.
- [ ] Prove #19 is contained by #18 and #21 is superseded by #22; do not duplicate them.
- [ ] Run focused tests for every imported scope.
- [ ] Commit integration in reviewable batches.

### Task 3: Final release verification
- [ ] Run production dependency audit and secret scan.
- [ ] Run lint/typecheck/unit/integration/build/contracts/E2E/performance/Lighthouse/CodeQL via official gates.
- [ ] Diagnose only real failures; do not repeat successful expensive gates without a state change.
- [ ] Write `docs/deployment/reports/persiantoolbox-final-readiness-2026-09-16.md` with evidence/run IDs.
- [ ] Push branch, open one final PR, and leave production undeployed.
