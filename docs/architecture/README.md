# PersianToolbox Architecture Overview

This directory now starts with a public-facing overview instead of expecting a
new reader to infer the system from RFCs and deploy logs.

## What This Product Is

PersianToolbox is a live Next.js product for Persian-speaking users. The core
design choice is simple:

- sensitive document and text processing should stay in the browser whenever
  practical
- server-side features should exist only where they add real product value
- public marketing, SEO, and operations must not weaken privacy guarantees

That gives the project two clearly separated execution zones.

## Runtime Boundaries

```text
Client boundary (privacy-first)
  ├─ PDF tools
  ├─ image tools
  ├─ text utilities
  ├─ Persian writing studio
  ├─ resume / invoice / contract drafting flows
  └─ local draft persistence and export preparation

Server boundary (product + operations)
  ├─ auth/session handling
  ├─ payments / subscriptions / credit entitlements
  ├─ analytics ingestion after consent
  ├─ admin APIs and site settings
  ├─ health / readiness / version endpoints
  └─ release, deploy, and monitoring workflows
```

## System Shape

```text
Browser
  -> App Router pages and lazy-loaded tool bundles
  -> local storage / in-browser processing
  -> optional consented analytics events

Next.js app
  -> UI routes, metadata, JSON-LD, sitemap, OG generation
  -> API routes for auth, billing, admin, analytics, health

Platform
  -> PostgreSQL for durable product state
  -> Redis for cache / coordination
  -> PM2 for process supervision
  -> nginx for TLS, cache, and upstream switching
  -> blue-green deploy flow for zero-downtime releases
```

## Source-of-Truth Files

Use these files first when evaluating the codebase:

- `lib/tools-registry.ts` — tool inventory, category metadata, public counts
- `app/` — Next.js routes and API surface
- `features/` — client-side tool implementations
- `shared/` and `components/` — shared UI and product infrastructure
- `deploy-blue-green.sh` — production deployment contract
- `docs/ops/deploy-and-risk-log.md` — verified release evidence
- `docs/roadmap.md` — active product and quality roadmap

## Key Engineering Decisions

1. Local-first processing over server-side uploads for user-sensitive content.
2. Strict TypeScript and test-heavy delivery over rapid undocumented changes.
3. Blue-green deploys over destructive restart flows for the live product.
4. SEO as product infrastructure, not an afterthought: JSON-LD, sitemaps,
   topical hubs, and OG image generation are part of the app architecture.
5. Documentation lives beside the product work and release evidence, so claims
   in the public repo can be audited.

## How To Read The Rest Of This Folder

- For active roadmap and current priorities: `docs/roadmap.md`
- For deep technical standards: `docs/technical/README.md`
- For historical RFCs in this folder: the individual `*-rfc.md` files

If you are reviewing the repository as a hiring manager, tech lead, or
contributor, this overview is the quickest path to the system's shape without
needing to read internal execution history first.
