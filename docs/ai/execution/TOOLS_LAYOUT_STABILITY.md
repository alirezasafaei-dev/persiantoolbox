# Tools list layout stability — 2026-10-11

The owner-approved AI workspace was merged in PR #233. Release verification exposed two existing readiness issues: homepage geometry measured before visible layout (fixed in PR #232), and an intermittent large layout shift on `/tools`.

## Evidence

- Main `db1d7ba87fe369ce25be99c1bca760e162da62aa`: [Lighthouse run 38138710498](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38138710498) failed the existing performance minimum of 0.75 with 0.74 on `/tools`.
- Its report recorded CLS 0.351156, with 0.345195 attributed to the quick-category section below the client tool list. FCP was 498ms, LCP 1948ms and TBT zero.
- The preceding main build with identical application code, [run 38137683419](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/38137683419), scored 0.92 with CLS 0.005961. The intervening change affected homepage tests only.
- The route used an empty outer Suspense fallback around a dynamic dashboard that reads search parameters. When the dashboard becomes available after the following section has painted, that section can move substantially.

## Change

Reuse the existing loading skeleton in both Suspense and the dynamic import, and reserve one viewport of minimum height for the dashboard. This keeps the secondary category links below the initial viewport during loading. Filtered or empty results can retain some space; filtering, links, cache behavior and rendering mode remain unchanged.

## Verification

- Production build, typecheck, targeted ESLint, contract checks and bundle budgets: PASS.
- Chromium initial-layout/search tests at 390px and 1440px, repeated three times, retries zero: 6/6 PASS; initial eligible layout-shift sum zero. The test measures real navigation through hydration, not a JavaScript-disabled view.
- Three local desktop Lighthouse runs on the production standalone build: performance 0.89, 0.89, 0.91; accessibility, best practices and SEO each 1.00; CLS 0.005961 in all three runs. Existing score thresholds were retained.
- Independent review: no actionable P0/P1/P2 findings.
- Hosted CI and deployment are subsequent gates; this report does not claim the change is live.

The discarded held-script and JavaScript-disabled harnesses did not reliably represent the streamed route: inline React reveal scripts can run before external scripts, while the disabled-JavaScript shell remains hidden. They are not accepted verification evidence.
