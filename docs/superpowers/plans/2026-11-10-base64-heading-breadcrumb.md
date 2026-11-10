# Base64 semantic repair implementation plan

> Execute inline with the executing-plans workflow. Reuse the existing isolated worktree and preserve its pre-existing documentation edits.

**Goal:** Give the existing Base64 page one descriptive H1 and a text-tools structured breadcrumb, while verifying that conversion still works.

**Architecture:** Correct the component's heading hierarchy and rely on the shared registry-generated breadcrumb instead of the duplicate manual list. Use component-scoped responsive utilities to preserve measured typography; do not alter global CSS, dependencies or conversion logic.

**Tech stack:** Next.js App Router, React, TypeScript, Playwright and pnpm 9.15.0.

**Spec/evidence:** The November 10 live release audit found zero H1 elements. A new public HTTP check confirmed zero H1 elements and a BreadcrumbList category pointing to `/tools`, while the tool registry assigns `/text-tools`.

## Constraints

- No new dependencies, broader redesign or unrelated converter changes.
- Preserve local-only conversion, RTL, existing rendered typography and entitlement behavior.
- Existing approval covers PRs #260–#262 only; this new revision needs separate approval before merge/deploy.
- Do not include private GSC exports, credentials or deployment logs.

## Task 1 — Reproduce and repair

- [x] Verify the live defect and registry category; run the existing focused SEO/heading tests as a baseline.
- [x] Add `tests/e2e/base64-tool.spec.ts` covering raw-response and hydrated H1, all top-level/graph BreadcrumbList nodes, Unicode round-trip and heading typography. Parameterize mobile, tablet and desktop widths so standard CI exercises every breakpoint.
- [x] Run the semantic test against the current live release with a private config. Both initial tests failed for absent H1/output H2. Refinement tests also reproduced the intermediate 48px-vs-36px title, duplicate breadcrumb and 36px-vs-30px output regressions. Retain logs outside Git.
- [x] Apply the scoped markup corrections:

```tsx
<h1 className="text-2xl! md:text-3xl! lg:text-4xl! font-bold text-(--text-primary)">
  رمزگذاری Base64
</h1>
<h2 className="text-xl! md:text-2xl! lg:text-3xl! font-bold text-(--text-primary)">خروجی</h2>
```

- [x] Remove the redundant manual BreadcrumbSchema and its unused imports. The existing ToolPageShell/ToolStructuredData emits the sole category from `tool.category`, which points to `/text-tools`.
- [x] Run `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build` and canonical standalone smoke (`pnpm predeploy:smoke` via PowerShell-equivalent environment assignment when needed).
- [x] Run all seven parameterized tests against the newly built standalone runtime in desktop and mobile Chromium. Review screenshots and capture runtime/network errors, distinguishing explicitly identified account prefetch cancellations from actual asset/tool failures.

## Task 2 — Record and prepare review

- [x] Record actual checks, live-vs-candidate status and the bounded GSC recheck in `docs/growth/base64-semantic-repair-2026-11-10.md`; update the current local handoff.
- [ ] Review the entire candidate diff, run formatting and licensing/security checks, inspect staged paths, verify sensitive files remain ignored and check current GitHub policies.
- [ ] Create a signed-off commit and draft PR, then verify checks for its exact final head. Preserve unrelated dirty documentation; do not merge or deploy this new revision.

Google follow-up: the student MVP guide is now submitted and indexed. Services and PDF compression still have no reported crawl; the latest API labels them unknown rather than the earlier discovered state. Do not send duplicate indexing requests or claim a post-release crawl.
