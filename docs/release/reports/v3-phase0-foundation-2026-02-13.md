# V3 Phase 0 Foundation Pack

- Date: 2026-02-13
- Scope: Sprint 0 execution outputs from `docs/release/v3-kickoff-execution-plan.md`

## 1) Architecture Freeze Note

- Keep `local-first` and `privacy-first` runtime policy unchanged.
- No runtime CDN/scripts/fonts introduced in V3.
- V3 rollout remains reversible via feature flags:
  - `NEXT_PUBLIC_FEATURE_V3_NAV`
  - `FEATURE_V3_REDIRECTS`
  - `FEATURE_V3_ANALYTICS_POLICY`

## 2) Content/Data Model Audit

- Existing canonical tool metadata source remains:
  - `lib/tools-registry.ts`
- Existing IA and migration contracts remain:
  - `docs/migration/redirect-map.csv`
  - `docs/migration/feature-flags.md`
  - `MIGRATION.md`
- Current route surfaces validated as V3-safe baseline:
  - `/tools`, `/topics`, `/plans`, `/about`, `/how-it-works`

## 3) SEO Contract (V3 Pages)

- Maintain existing metadata generator and JSON-LD conventions:
  - `lib/seo.ts`
  - `tests/unit/seo-jsonld-contract.test.ts`
- Any new V3 page must ship:
  - `title`, `description`, canonical path metadata
  - Breadcrumb/FAQ schema where applicable
  - inclusion in sitemap policy when indexable

## 4) Internal Linking Matrix (Draft)

- `topics/*` -> `tools` hub
- `tools` hub -> finance tools (`loan`, `salary`, `interest`)
- category pages (`pdf-tools`, `image-tools`, `date-tools`, `text-tools`, `validation-tools`) -> related tool routes
- authority pages (`about`, `how-it-works`, `privacy`) stay globally discoverable from navigation

## 5) Test Strategy Update

- Baseline gates (required per V3 PR):
  - `pnpm ci:quick`
  - `pnpm ci:contracts`
  - `pnpm test:e2e:ci`
  - `pnpm lighthouse:ci` (non-blocking performance warnings allowed, SEO/a11y must stay green)
- Migration/flag-specific checks:
  - redirect behavior under `FEATURE_V3_REDIRECTS`
  - analytics ingest guardrails under `FEATURE_V3_ANALYTICS_POLICY`
  - navigation switch under `NEXT_PUBLIC_FEATURE_V3_NAV`
