# Blog Server-First Rendering Plan - 2026-07-04

## Current Problem

`components/features/blog/BlogPost.tsx` is a client component and owns the article shell, article body, table of contents, sharing, bookmarks, reactions, and reading-progress behavior. Static article content is therefore shipped through a heavier client boundary than necessary.

## Why This Is Bad

- Article HTML is mostly static and should be renderable without client JavaScript.
- The current component increases hydration work for long-form content.
- Client-only ownership makes it harder to reason about SEO-critical article structure independently from interactive widgets.

## Proposed Split

- Server-rendered article shell/body:
  - title, summary, dates, author block
  - cover image and caption
  - tags, category, related posts
  - rendered article HTML
  - schema and breadcrumbs remain server-owned
- Client-only widgets:
  - reading progress
  - reaction controls
  - bookmark controls
  - share/copy buttons
  - back-to-top button
  - table-of-contents active-heading tracking

## Migration Steps

1. Create `BlogPostArticle.tsx` as a server component for static article layout.
2. Move the existing interactive widgets into small client components.
3. Pass only serializable props into client widgets.
4. Keep `BlogPost.tsx` as a compatibility wrapper for one release if needed.
5. Remove the wrapper after route-level tests and visual checks pass.

## Test Plan

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm vitest --run`
- Add a metadata/rendering test for an article with cover image and series.
- Add Playwright smoke coverage for one article page on desktop and mobile.

## Risk

- TOC behavior can regress if heading IDs are generated differently.
- Share/bookmark/reaction widgets can lose state if prop boundaries change.
- Styling can drift if the server shell does not preserve current class structure.

## Rollback

Revert the server-first branch or restore the compatibility wrapper as the only route component import. Article URLs and content files should remain unchanged.

## Suggested Future Branch Names

- `feat/blog-server-rendered-article-shell`
- `refactor/blog-client-widgets`
- `test/blog-article-rendering-contracts`
