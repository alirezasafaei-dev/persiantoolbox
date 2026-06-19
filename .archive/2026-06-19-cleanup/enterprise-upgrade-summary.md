# Enterprise Upgrade Summary (2026-02-24)

## Scope

Operational hardening pass across product correctness, security, SEO, UI/UX (RTL-first), DX/CI, and documentation accuracy.

## Changes Implemented

### 1) Product + SEO + UX

- Added real guide surfaces based on existing editorial data:
  - `app/guides/page.tsx`
  - `app/guides/[slug]/page.tsx`
  - Result: content is now user-facing/indexable instead of data-only in `lib/guide-pages.ts`.
- Expanded guide content quality and helper accessors:
  - `lib/guide-pages.ts` (richer Persian-first text, FAQ quality, `getGuideBySlug`)
- Included guide routes in sitemap:
  - `app/sitemap.ts`
- Added metadata to redirect pages to keep SEO contract explicit:
  - `app/brand/page.tsx`
  - `app/(tools)/pdf-tools/merge/page.tsx`
- Improved navigation discoverability and Persian locale presentation:
  - `components/ui/Navigation.tsx` (guides link)
  - `components/ui/Footer.tsx` (guides link + Persian formatted year)

### 2) Security + Performance

- Consolidated runtime security ownership to middleware/proxy nonce flow:
  - `proxy.ts`: added modern hardening headers
    - `Cross-Origin-Opener-Policy`
    - `Cross-Origin-Resource-Policy`
    - `Origin-Agent-Cluster`
    - `X-Permitted-Cross-Domain-Policies`
  - removed legacy `X-XSS-Protection`.
- Reduced duplicate/conflicting security header definitions in `next.config.mjs` and retained only route-specific cache/noindex headers there.
- Added immutable cache policy for static fonts:
  - `next.config.mjs` → `/fonts/:path*` cache header.

### 3) Architecture + Cleanup

- Removed unused/dead component:
  - deleted `features/pdf-tools/Placeholder.tsx`

### 4) DX + CI + Governance

- Enforced docs freshness in CI:
  - `.github/workflows/ci-core.yml` now runs `pnpm docs:auto:check` in quality job.
- Added repository-native secret leakage check:
  - `scripts/security/scan-secrets.mjs`
  - `package.json` script: `pnpm security:secrets`
  - enforced in CI security job (`.github/workflows/ci-core.yml`)
- Added dependency maintenance automation:
  - `.github/dependabot.yml` (npm + GitHub Actions weekly updates).
- Added repository file normalization policy:
  - `.gitattributes`

### 5) Documentation Accuracy

- Replaced stale root README with runnable, current operational docs:
  - `README.md`
- Added repo reality audit:
  - `docs/reality-check.md`

## Why It Matters

- Removes SEO/content blind spot (guides were defined but not shipped).
- Reduces security policy drift by removing split-brain header ownership.
- Adds maintainability guardrails (Dependabot + docs CI gate).
- Improves Persian-first UX discoverability and locale consistency.
- Removes dead code to reduce maintenance surface.

## Verification

Run:

```bash
pnpm install
pnpm lint
pnpm test:ci
pnpm build
pnpm typecheck
```

Security/dependency checks:

```bash
pnpm security:secrets
pnpm security:scan
pnpm docs:auto:check
```
