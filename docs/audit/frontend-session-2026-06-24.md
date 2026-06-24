# PersianToolbox Frontend Audit & Improvements Session

**Date**: 2026-06-24
**Scope**: Blog growth, deep frontend audit, homepage enhancement
**PRs**: #73, #74, #75

## Overview

This session covered three work streams: (1) growing the blog, (2) a deep
frontend audit with fixes, and (3) enhancing the homepage. Each produced a
separate PR for review-safe merging.

---

## PR #73 — Blog Growth (`feat/blog-enhancements`)

### Phase 1: Content discovery & syndication

- **Tag browsing**: new SSG route `/blog/tag/[tag]` for tag-based article
  discovery. Sidebar tags, card tags, and post tags are now clickable with
  usage counts.
- **RSS feed**: RSS 2.0 at `/feed.xml` (static, latest 30 posts) for
  subscriptions and crawler discovery, with a link on the blog index.
- **Sidebar**: added "Popular Posts" (top 5) widget and live post/category
  stats on the blog index.

### Phase 2: SEO enrichment

- **Clickable post tags**: consistency with sidebar/cards.
- **Article schema**: enriched `BlogPostSchema` with `image`,
  `dateModified`, `mainEntityOfPage`, and `keywords`.
- **BreadcrumbList JSON-LD**: added to blog post, category, and tag pages.
- **Visible breadcrumb nav** (home › blog › category › post) on post pages.

### New helpers (`lib/blog.ts`)

`getPostsByTag`, `getTagsWithCount`, `getPopularPosts`, `getFeaturedPost`.

### Tests

13 new unit tests (7 tag functions + 6 schema components). Total: 429.

---

## PR #74 — Frontend Audit Fixes (`chore/frontend-audit-fixes`)

Findings from a deep frontend audit (architecture, code quality,
performance, a11y, bundle, DX). The codebase is mature: full strict
TypeScript, strict ESLint with `jsx-a11y`, disciplined lazy-loading,
zero `@ts-ignore`, clean RSC/server boundary.

### Performance (biggest wins)

- **Fonts**: generated woff2 for Vazirmatn (120→50 KB/weight) and NotoSans
  (500→179 KB/weight). Added woff2 as the primary `@font-face` source (TTF
  kept as fallback). Reduced font preload from 5 heavy files to 2 critical
  woff2 (Vazirmatn regular/bold). Vazirmatn remains the primary render font
  (optimized for Persian/web).
- **Dead dependency**: moved `framer-motion` from `dependencies` to
  `devDependencies` — confirmed unused in any production source (only a
  `vi.mock` in one test). Removed the dead webpack alias comment from
  `next.config.mjs`.

### Code quality

- **Buttons**: enabled `react/button-has-type` ESLint rule and added
  `type="button"` to 80 buttons missing an explicit type (prevents
  accidental form submits). `CssMotion.tsx` wrapper handled as a documented
  false positive.
- **console.debug**: converted to `console.log` in `errorTracking` (stripped
  by Terser `pure_funcs` in production).

### UX

- Added `loading.tsx` to `(tools)`, `blog`, `admin` segments.
- Added `error.tsx` to the `(tools)` segment.

### Audit findings NOT addressed (deferred, low priority)

- Large files over 1000 LOC (MonetizationAdminPage, AccountPage,
  OpsDashboardClient, SalaryPage, LoanPage) — candidates for refactoring.
- `export *` barrel imports (minor tree-shaking risk; import discipline is
  already good).
- `Container` is not duplicated — `components/ui/Container.tsx` is a clean
  re-export shim of `shared/ui/Container.tsx`.

---

## PR #75 — Homepage Enhancement (`feat/home-improvements`)

### Data integrity

- Replaced hardcoded "۵۵ ابزار" with dynamic `getDisplayToolsCount()` across
  5 files (`page.tsx` metadata, `SmartCTA`, admin dashboard, `TrustStats`,
  OG image). The registry reports 64 tools; numbers now always match.

### Traffic growth

- New `BlogPreviewSection` server component showing 3 latest blog posts
  (category, date, reading time, tags, CTA to `/blog`). Surfaces 135+
  articles on the homepage to drive top-of-funnel traffic.

### Discovery

- Enriched category cards to show top 3 tools per category as clickable
  chips (was: name + count only) — users reach tools directly from the
  homepage.

---

## Validation Summary

All PRs pass: `pnpm typecheck`, `pnpm lint` (only pre-existing
`app/api/auth/me/route.ts` errors outside scope), `pnpm vitest --run`
(416 tests on main), and `pnpm build` (590 pages after blog PR, 350 on
main). Pre-commit hooks pass.

## Process Notes

- Commits use `commit.gpgsign=false` (local GPG signing was hanging);
  `Signed-off-by` trailers added per AGENTS.md policy.
- A button-type codemod initially corrupted `=>` via an overly broad regex;
  this was caught, reverted, and rewritten with a line-by-line scanner that
  fixed 80 buttons cleanly.
- GPG/Terser/font-tooling (`ttf2woff2`) details are documented for
  reproducibility.

## Next Steps (suggested)

- Refactor large 1000+ LOC client components into sub-components.
- Add a testimonials/reviews section to the homepage.
- Consider `next/font/local` migration for automatic font optimization.
  woff2 files now exist, making this straightforward.
