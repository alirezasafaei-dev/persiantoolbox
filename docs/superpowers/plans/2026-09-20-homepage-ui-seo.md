# Homepage UI and SEO Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans, if installed, to implement this plan task-by-task. The owner selected Codex CLI as executor; do not switch to subagents automatically. If that skill is unavailable, follow this checked-in plan directly and report the limitation.

**Goal:** Improve homepage character and clarity with small reversible changes, correct verified SEO inconsistencies, and return a reviewable candidate.
**Architecture:** Keep existing Next.js server/client boundaries, routes and tool behavior. Scope presentation to homepage CSS; make shared SEO changes only for verified identity/copy inconsistencies.
**Tech Stack:** Existing Next.js 16, React 19, TypeScript, Tailwind 4, pnpm 9.15.0, Vitest and Playwright. Do not upgrade packages.
**Spec:** [Approved design](../../growth/homepage-ui-seo-2026-09/DESIGN.md).

## Global Constraints
- Preserve URLs, tool calculations, payments, entitlements, storage and analytics consent.
- Persian UI, RTL, dark mode, keyboard access and reduced motion remain supported.
- No new dependencies, global palette replacement, infrastructure mutation, content deletion or bulk SEO rewrites.
- Use pnpm; honor repository licensing and Signed-off-by.
- Work on an isolated branch; never discard the user's work.
- Finish independent tasks when GSC is unavailable; no fabricated traffic, scores or PASS claims.
- Merge and staging/production deployment require a separate explicit owner instruction.
- Program status lives in [TASKS.md](../../growth/homepage-ui-seo-2026-09/TASKS.md).

## Review Focus
1. Narrow RTL viewports and 200% zoom: no overflow or clipped search/CTA; owned by PT-02 visual checks.
2. Dark mode and keyboard focus: contrast and visible focus remain clear; owned by PT-02 a11y checks.
3. Deferred search/hydration: typing and result navigation still work; owned by PT-03 E2E.
4. Multiple schema producers: a consistent brand entity across layout and home; owned by PT-01 runtime graph test.
5. New/returning visitors with consent denied or unknown: no new tracking or overwritten preferences; owned by PT-04 diagnosis and PT-03 regression checks.

---

## PT-00: Establish the working baseline

**Read:** AGENTS.md; docs/HANDOFF.md; docs/roadmap.md; this package; package.json; nested AGENTS.md if any; docs/ops/PRODUCTION_DEPLOY_SAFETY.md.
**Create:** docs/growth/homepage-ui-seo-2026-09/reports/baseline.md.
**Consumes:** current checkout and observed live release.
**Produces:** base SHA, clean isolated worktree, screenshots and measured baseline.

- [ ] Inspect without mutation:
```bash
git status --short --branch
git log -5 --oneline
git remote -v
git diff --stat
git fetch origin
```
- [ ] If the checkout is dirty, leave it intact and create a sibling worktree from the intended base. Do not stash/reset user work. If branch names already exist, inspect them and resume rather than overwrite.
- [ ] Read the documentation branch carrying this package. If it is not yet merged, branch implementation from that branch and use a stacked PR targeting it; otherwise use current origin/main. Never silently omit this package.
- [ ] Record exact base SHA and GET /api/version and /api/health. Do not treat a docs commit as a deployed release.
- [ ] Install existing dependencies with `pnpm install --frozen-lockfile`. Use an existing compatible Node runtime (package requires >=20); no arbitrary environment migration.
- [ ] Capture before screenshots at 360x800, 390x844, 768x1024 and 1440x1000, light and dark, same font/loading/consent state. Capture the initial consent-overlay state separately.
- [ ] Record one controlled baseline Lighthouse batch as described under PT-03; do not compare a development server to a production build.
- [ ] Save non-secret observations and mark PT-00 DONE with paths and SHA.

## PT-01: Correct identity and privacy claims

**Modify:** components/HomePage.tsx, app/layout.tsx, lib/seo.ts, lib/brand.ts only if needed, components/ui/ConsentBanner.tsx for copy only.
**Read:** app/trust/page.tsx and its referenced data, lib/home-copy.ts, tests/unit/home-seo.test.ts, tests/unit/seo-jsonld-contract.test.ts.
**Create:** tests/e2e/home-schema-consistency.spec.ts.
**Consumes:** BRAND and existing metadata/JSON-LD.
**Produces:** one unambiguous Organization/WebSite identity and truthful copy, preserving CollectionPage/FAQ/ItemList.

- [ ] Inspect all runtime schema producers and privacy behavior. Confirm claims with /trust implementation; no absolute statement unsupported by tool behavior.
- [ ] Add a runtime regression test that first fails for the old GitHub sameAs and conflicting/multiple brand definitions. Read actual JSON-LD, not source-code substring tests. Example core:
```ts
const nodes = await page.locator('script[type="application/ld+json"]').evaluateAll(
  elements => elements.flatMap(element => {
    const value = JSON.parse(element.textContent || '{}');
    return value['@graph'] || [value];
  }),
);
const organizations = nodes.filter(node => node['@type'] === 'Organization');
expect(organizations).toHaveLength(1);
expect(organizations[0].sameAs).toContain(
  'https://github.com/alirezasafaeigfx/persiantoolbox',
);
expect(JSON.stringify(nodes)).not.toContain('github.com/parsairaniiidev/persiantoolbox');
expect(organizations[0]['@id']).toBeTruthy();
expect(nodes.filter(node => node['@type'] === 'WebSite')).toHaveLength(1);
```
Use Playwright expect.poll or web-first assertions to wait for deferred schema insertion before parsing. Flatten nested entity objects when checking for conflicting definitions; references containing only @id are allowed.
- [ ] Keep site-level Organization/WebSite in layout; give them stable @id and reference them from home rather than redefining. Derive repository URL from BRAND.repository.owner/name, not a second hardcoded identity. Do not guess social accounts.
- [ ] Align siteDescription, visible home FAQ, FAQ JSON-LD and cookie copy with scoped privacy wording. Preserve consent handlers, events and storage. Add assertions for the visible and schema versions of the privacy answer.
- [ ] Run focused unit tests:
```bash
pnpm vitest --run tests/unit/home-seo.test.ts tests/unit/seo-jsonld-contract.test.ts tests/unit/home-copy.test.ts
pnpm exec playwright test tests/e2e/home-schema-consistency.spec.ts --project=chromium
```
- [ ] Inspect root and one tool page for inherited schema consistency. Do not update sitemap dates for unrelated pages or enable FAQ rich-result promises.
- [ ] Commit with `git commit -s`; record SHA and real command results.

## PT-02: Refine homepage hero and cards

**Modify:** components/home/HomeHero.tsx, components/HomePage.tsx; lib/home-copy.ts only for approved plain-language cleanup.
**Create:** components/home/HomeRefresh.module.css (only if scoped utilities are insufficient).
**Existing test:** tests/components/HomeHero.test.tsx.
**Consumes:** existing home-copy, icons, search and navigation.
**Produces:** approved visual direction without route or behavioral changes.

- [ ] Keep root server components server-rendered; do not add 'use client' to HomePage for styling.
- [ ] Replace the trust-pill grid with centered wrapping layout, preserving the labels. Suggested class replacement:
```tsx
className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 pt-2"
```
- [ ] Apply scoped bright surfaces, restrained teal icon accents, clear search border/focus and coherent radius. Preserve existing semantic colors and dark tokens; use the palette in DESIGN.md.
- [ ] Add only lightweight, aria-hidden, pointer-events-none CSS/SVG decoration around the hero edges. Never place decoration over text or create a new JS dependency.
- [ ] Improve existing task-card title/icon/description hierarchy and focus-visible. Keep all hrefs, heading IDs and content sections. Do not refactor unrelated shared components.
- [ ] Use reduced-motion media rules for any new transform transition:
```css
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; transform: none; }
}
```
Use the real module class selected for the card; no unbound CSS selectors.
- [ ] Run `pnpm vitest --run tests/components/HomeHero.test.tsx tests/unit/home-copy.test.ts`. Do not write tests asserting decorative class strings.
- [ ] Capture after screenshots using PT-00 dimensions/states. Verify trust-group centering, line length, no overflow, dark readability, 200% zoom and tab focus. Measure contrast on actual foreground/background combinations.
- [ ] Commit independently with sign-off and mark PT-02 REVIEW, not owner-approved.

## PT-03: Integrated verification and review handoff

**Modify:** tests/e2e/home.spec.ts only to remove false-positive navigation fallback and add meaningful regression coverage.
**Create:** docs/growth/homepage-ui-seo-2026-09/reports/candidate.md.
**Consumes:** PT-01 and PT-02 candidate.
**Produces:** candidate SHA, PR, screenshots, build/test evidence and review report.

- [ ] The current PDF navigation test catches failure and calls page.goto('/pdf-tools'); replace that fallback with direct click and URL assertions so broken navigation fails.
- [ ] Exercise hero search with a real Persian query, select a result, verify its destination and one H1. Exercise the primary CTA and popular-tools anchor. Do not navigate manually to rescue a failed click.
- [ ] Add overflow assertions at 360/390 widths:
```ts
expect(await page.evaluate(
  () => document.documentElement.scrollWidth <= window.innerWidth,
)).toBe(true);
```
- [ ] Run repository gates once on the final code candidate; broaden only for a remaining concrete failure:
```bash
pnpm ci:quick
pnpm ci:contracts
pnpm build
pnpm predeploy:smoke
pnpm exec playwright test tests/e2e/home.spec.ts tests/e2e/home-schema-consistency.spec.ts tests/e2e/a11y-contrast-keyboard.spec.ts tests/e2e/consent-analytics.spec.ts --project=chromium
```
Do not skip failures or change expected output solely to turn tests green. Distinguish pre-existing failures with evidence from baseline. These gates may take time; report progress.
- [ ] Existing Playwright config defaults to a development server. Record that E2E context. Do not set PLAYWRIGHT_PRODUCTION=1 blindly: its existing next start command conflicts with the standalone policy. For production smoke use scripts/quality/run-local-smoke.mjs through predeploy:smoke.
- [ ] For performance comparison, use the same standalone setup as that smoke script, ports outside production, same Chrome version/device/throttling and warm-up. Copy public and .next/static as the canonical smoke script does. Do not expose a new server publicly.
- [ ] Compare medians of 3 Lighthouse mobile runs baseline/candidate. Acceptance budgets: no performance-score drop >3 points, LCP regression >10% or CLS increase >0.02, and no additional homepage JS dependency. These are regression budgets, not a promise of field CWV or a 95 score. If runs are unstable, document variance and rerun only to resolve it. A missing browser leaves performance NOT_RUN and blocks readiness claims, not unrelated work.
- [ ] Store compact reports and screenshots under this package's reports directory or PR artifacts, with no user data. Record exact commands and environment. Update TASKS and HANDOFF to candidate status; never overwrite production SHA with an undeployed SHA.
- [ ] Run `git diff --check`, commit with sign-off, push implementation branch and open a PR (stacked base if documentation is unmerged). Do not merge or deploy.
- [ ] Return REPORT-TEMPLATE fields and the next specific decision needed from the owner.

## PT-04: Diagnose overlays; no behavior change yet

**Read:** components/ui/ClientOverlays.tsx, components/ui/ConsentBanner.tsx, components/ui/SmartCTA.tsx, shared/consent/analyticsConsent.ts, lib/client/popupEngagement.ts.
**Report:** reports/overlay-diagnosis.md.
- [ ] Trace the actual install invitation producer using `rg -n "نصب اپلیکیشن|beforeinstallprompt|appinstalled" components shared lib`; do not assume SmartCTA owns it.
- [ ] Reproduce unknown, accepted and rejected consent states in an isolated browser profile, and a returning/dismissed-install visitor. Include timer/scroll conditions.
- [ ] Propose suppressing install invitation while consent is undecided, without treating rejection as acceptance, re-enabling analytics or resetting dismissal. Record exact files and expected event order.
- [ ] Submit diagnosis for owner approval; do not implement timing behavior yet. Do not stop PT-01/PT-02 for this approval.

## PT-05: GSC and GEO evidence, not speculative publishing

**Create when data exists:** reports/search-opportunities.md.
- [ ] Use existing authorized GSC access if functional, otherwise request an export: three recent months, previous-period comparison, query/page/device/country tables plus Page indexing and Sitemaps.
- [ ] Keep raw exports and credentials outside public git. Publish only non-sensitive aggregates; ask before including identifying queries.
- [ ] Record property, timezone, search type, dates, filters and data freshness. Exclude incomplete days and compare equal-length periods; disclose anonymized/missing query rows.
- [ ] Rank opportunities by impressions, position 4–20, CTR relative to similar positions and relevance. Separate brand/non-brand and mobile/desktop; do not infer query-page relationships from unrelated aggregate tables.
- [ ] Select up to five evidenced pages. Each recommendation includes observed metric, intended change, truthful title/description draft, source requirements and success measure.
- [ ] For GEO, define clear tool purpose, inputs/outputs, reproducible example, limitations, official calculation/legal sources where relevant, author and genuine review date. No mass article generation, invented source, guaranteed citation or ranking.
- [ ] Measure optional AI referral traffic and repeat a fixed question sample transparently; GSC Web includes Google AI-feature traffic but does not prove a particular AI citation.
- [ ] If data is unavailable, keep BLOCKED with exact missing input. Continue independent work.

## PT-06: Owner-authorized release only

- [ ] Before any release, obtain explicit authorization for the reviewed immutable SHA and destination.
- [ ] Read docs/ops/PRODUCTION_DEPLOY_SAFETY.md and docs/ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md at execution time. Re-observe server topology rather than copy historical nginx instructions.
- [ ] Use only canonical blue-green engine; backups, inactive-slot checks, complete assets, exact-SHA checks, retained rollback and strict public verification are mandatory.
- [ ] No workflow dispatch, migrations, PM2/nginx mutation, merge or production promotion is authorized by this planning package.
