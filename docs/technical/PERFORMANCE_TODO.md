# Performance TODO (Operational)

## WOFF2 Migration Plan

Goal: replace TTF-first runtime font delivery with WOFF2-first pipeline.

### Exact change points
1. `app/layout.tsx`
- Update font preload links from `font/ttf` to `font/woff2`.
- Keep `crossOrigin="anonymous"` and preload only the critical regular/bold pair.

2. `app/globals.css`
- Update `@font-face` sources to prioritize `.woff2`.
- Keep `font-display: swap` and fallback stack to reduce CLS.

3. `public/fonts/`
- Add generated `.woff2` files for active Persian font family.
- Keep existing `.ttf` only as fallback until migration validation is complete.

4. Validation
- Run `pnpm build` and `pnpm lighthouse:ci`.
- Confirm no regressions in LCP/CLS and no missing font requests.

## PDF Route-Scoped Loading
- Current state already route-scoped in `features/pdf-tools/*` with worker-based processing.
- Keep heavy PDF libs isolated to PDF routes; avoid imports from non-PDF pages.
