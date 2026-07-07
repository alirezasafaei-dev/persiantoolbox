# CSP, Mobile, SEO Audit Handoff - 2026-07-04

Branch: `fix-csp-mobile-seo-audit`

Status: changes implemented and locally validated. No push, merge, or deploy was run.

## Scope Completed

- Cleaned CSP report-only behavior in `proxy.ts`.
- Fixed homepage mobile off-canvas/clipped visible elements at 390, 375, and 360 px widths.
- Reduced homepage initial HTML payload.
- Shortened homepage meta description to the requested range.
- Reduced homepage H2 clutter while keeping one H1.
- Renamed unsupported “popular tools” copy to recommended/curated copy.
- Added supplied logo image as generated PNG web assets and wired logo references for manifest/JSON-LD.
- Added/updated tests for CSP and mobile overflow regression.

## Exact Changes

### CSP

- `buildCsp()` keeps the compatible enforced policy with `unsafe-inline` and `upgrade-insecure-requests`.
- Added `buildReportOnlyCsp()` for compatible report-only telemetry without `upgrade-insecure-requests`.
- Report-only policy no longer sends nonce-only `script-src`/`style-src` because inline Next.js scripts/styles are not fully nonce-migrated yet.
- Per-request nonce generation remains in place via `x-nonce` and `x-csp-nonce`.

Files:

- `proxy.ts`
- `tests/unit/proxy-csp.test.ts`
- `tests/e2e/security-headers.spec.ts`

### Mobile Overflow

- `CategoryCard` now uses `min-w-0`, `max-w-full`, `overflow-hidden`, and constrained truncation on nested flex links.
- `CategoryGrid` renders fewer category cards initially while keeping `/topics` as the full map.
- `tests/e2e/mobile-ux.spec.ts` now includes visible-element horizontal overflow detection for homepage mobile.

Files:

- `components/home/CategoryCard.tsx`
- `components/home/CategoryGrid.tsx`
- `tests/e2e/mobile-ux.spec.ts`

### SEO Copy And Headings

- Homepage meta description changed from 215 chars to 144 chars.
- Homepage heading counts changed from `H1/H2/H3 = 1/17/30` to `1/8/35`.
- Secondary homepage sections were demoted from `h2` to `h3` where appropriate.
- “محبوب‌ترین ابزارهای رایگان” changed to “ابزارهای پیشنهادی رایگان”.

Files:

- `lib/home-copy.ts`
- `components/HomePage.tsx`
- `components/home/PopularToolsSection.tsx`
- `components/home/NewToolsSection.tsx`
- `tests/unit/home-copy.test.ts`

### Logo

Source image provided by user:

- Maintainer-provided PNG logo source used to regenerate the public web assets

Generated/updated assets:

- `public/logo.png`
- `public/icon-512.png`
- `public/icon-128.png`
- `public/icon-256.png`
- `public/android-chrome-192.png`
- `public/android-chrome-512.png`
- `public/apple-touch-icon-180.png`
- `public/favicon-16.png`
- `public/favicon-32.png`
- `public/favicon-48.png`
- `public/dark/android-chrome-192.png`
- `public/dark/android-chrome-512.png`
- `public/dark/icon-128.png`
- `public/dark/favicon-32.png`

Logo references updated:

- `app/layout.tsx`
- `app/manifest.ts`
- `app/blog/page.tsx`
- `components/seo/BlogPostSchema.tsx`

## Validation Evidence

Baseline live metrics before edits:

- Homepage HTML: `394469` bytes.
- Blog HTML: `410652` bytes.
- H1/H2/H3: `1/17/30`.
- Meta description: `215` chars.
- CSP messages: desktop `78`, mobile 390 `75`, mobile 375 `75`, mobile 360 `75`.
- Mobile overflow count: 390 `16`, 375 `17`, 360 `25`.

Final local build metrics after edits:

- Homepage HTML: `355127` bytes.
- Blog HTML: `416952` bytes.
- Pricing route: `200`, `90272` bytes.
- Robots: `200`, `275` bytes.
- Sitemap: `200`, `127273` bytes.
- H1/H2/H3: `1/8/35`.
- Meta description: `144` chars.
- CSP messages: desktop `0`, mobile 390 `0`, mobile 375 `0`, mobile 360 `0`.
- Mobile overflow count: desktop `0`, mobile 390 `0`, mobile 375 `0`, mobile 360 `0`.
- Logo check: navbar image resolves through `/icon-128.png`; JSON-LD includes `/logo.png`.

Commands that passed:

```bash
pnpm install
pnpm lint
pnpm typecheck
../../../.archive/scripts/gpu-run.sh pnpm build
../../../.archive/scripts/gpu-run.sh pnpm test -- --run
../../../.archive/scripts/gpu-run.sh pnpm vitest --run tests/unit/home-copy.test.ts tests/unit/proxy-csp.test.ts
```

Observed validation details:

- `pnpm lint` passed with existing baseline warnings: `290` warnings, `0` errors.
- `pnpm test -- --run` passed: `148` files, `1239` tests.
- GPU wrapper used directly from `../../../.archive/scripts/` because package `gpu:*` scripts point to missing files under `../../../scripts/`.

## Known Issues Not Fixed In This Branch

- `package.json` `gpu:*` scripts reference missing `../../../scripts/gpu-run.sh` and `../../../scripts/gpu-browser-run.sh`. Only archived wrappers exist.
- Playwright config forces its own `next dev` server and `reuseExistingServer: false`; targeted e2e was flaky in this environment due leftover port 3100, Sentry proxy timeouts, and baseline manifest conflict logs.
- Existing e2e contrast failures remain outside this branch.
- Existing `/manifest.webmanifest` conflict log remains outside this branch.
- Strict nonce CSP is still not enforceable until inline Next.js scripts/styles are actually migrated.
- Production was not touched.

## Tomorrow Resume Checklist

1. Confirm branch and commit:

```bash
cd /home/dev13/my-project/sites/live/persiantoolbox
git checkout fix-csp-mobile-seo-audit
git status --short --branch
git log --oneline -5
```

2. Re-run quick validation:

```bash
pnpm typecheck
../../../.archive/scripts/gpu-run.sh pnpm build
../../../.archive/scripts/gpu-run.sh pnpm vitest --run tests/unit/home-copy.test.ts tests/unit/proxy-csp.test.ts
```

3. Re-run one-off browser audit if needed:

```bash
pnpm exec next start -H 127.0.0.1 -p 3100
# in another shell, run the GPU-wrapped Playwright metric script from this session or recreate it from final report metrics.
```

4. Before PR/push, decide whether to include a small separate fix for broken `gpu:*` script paths. That is not part of the audit fix itself.

5. Do not deploy from this branch. Deployment remains a separate release step.
