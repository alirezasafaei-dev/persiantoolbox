# PT-00 baseline

- Recorded at: `2026-09-20T17:23:27Z`
- Implementation branch: `codex/pr43-homepage-ui-seo-exec`
- Base SHA: `c201a8fbd070a978538a0d8118263eab5b8b8279`
- Base ref: `origin/docs/homepage-ui-seo-program-20260920` (PR #43 is open, so the implementation PR must target this branch)
- Original checkout preserved: `D:\My_Projects\persiantoolbox`, branch `yolo/prod-readiness-seo-audit`, with its existing modified and untracked files untouched.
- Isolated worktree: `D:\My_Projects\persiantoolbox-pr43-homepage-ui-seo-exec`

## Observed production

At `2026-09-20T17:23:30Z`, both `/api/version` and the earlier `/api/health` observation reported production commit `7b743046b9f3d652ecfc2d2f2a64274550e2e21f`, branch `main`, version `8.0.0`, built at `2026-09-18T22:03:01Z`. The documentation base is not a deployed release.

## Setup and build

- `pnpm install --frozen-lockfile`: PASS (pnpm 9.15.0; lockfile unchanged).
- `pnpm build`: PASS; 656 static pages generated. Existing warnings: deprecated Edge runtime/static-generation notice and four dynamic-filesystem tracing warnings in `app/api/admin/ops/logs/route.ts`.
- Runtime: Next.js standalone, Node `v24.19.0`, bound to `127.0.0.1:3110`; `public` and `.next/static` copied with the canonical smoke helper.

## Screenshots

All screenshots use the same production build and a stored denied consent state, except the separately named initial-consent capture. Each tested viewport had one H1 and `document.documentElement.scrollWidth === window.innerWidth`.

- `reports/baseline/screenshots/before-consent-390x844-light.png`
- `reports/baseline/screenshots/before-{360x800,390x844,768x1024,1440x1000}-{light,dark}.png`

## Lighthouse baseline

Lighthouse `13.5.0`, installed Chrome, default mobile emulation, same warmed standalone URL, three runs:

| Run | Performance | LCP (ms) | CLS | TBT (ms) | FCP (ms) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 77 | 5592.48 | 0 | 73 | 2142.48 |
| 2 | 77 | 5592.20 | 0 | 67 | 2142.20 |
| 3 | 77 | 5581.88 | 0 | 69 | 2131.88 |
| Median | **77** | **5592.20** | **0** | **69** | **2142.20** |

JSON: `reports/baseline/lighthouse/mobile-run-{1,2,3}.json`.

An initial three-run desktop batch was accidentally captured before the mobile preset correction and is retained transparently as `desktop-unplanned-run-{1,2,3}.json`; it is not used for acceptance comparison.
