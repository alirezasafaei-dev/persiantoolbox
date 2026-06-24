# Enterprise Runtime Status

Last updated (UTC): 2026-02-24T00:39:28Z
Base commit at capture: `e8235af`

## Implemented baseline

- ASDEV cross-site contract: `/asdev` page is the canonical network hub; footer is product-focused.
- Unified site shell contract for main pages (shared navigation, spacing, and footer behavior).
- Security headers baseline active (CSP, Referrer-Policy, XFO, XCTO, Permissions-Policy); HSTS is enabled only in production runtime.
- `X-Robots-Tag: noindex, nofollow` for `/api/*` and admin surfaces.
- Request/correlation IDs centralized in `proxy.ts`.
- Health endpoints: `/api/health`, `/api/ready`.
- Accessibility baseline: skip-link + `main#main-content` in root layout.
- CI smoke job for mobile `/asdev` added in `.github/workflows/ci-core.yml`.

## Latest real verification

- `pnpm typecheck` -> PASS
- `PLAYWRIGHT_SKIP_FIREFOX=1 pnpm exec playwright test --config=playwright.config.ts --project=chromium --grep "asdev" --reporter=list` -> PASS (1 passed)

## Notes

- Deprecated `middleware.ts` removed to avoid conflict with existing `proxy.ts` (Next proxy convention).
- `tsconfig.json` aligned with proxy-only setup.
