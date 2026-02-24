# TODO Next (Prioritized)

## P0

1. Add production CSP tightening plan to remove `'unsafe-inline'` for styles via nonce/hash strategy and verify with Playwright security header contracts.
2. Add explicit runtime feature-flag audit report in CI (enabled/disabled matrix by env) to avoid deploy drift on monetization/account/admin surfaces.

## P1

1. Add guide listing/search UX improvements (topic tags, reading time, internal link cards) and measure engagement events.
2. Add Lighthouse budget thresholds per critical Persian routes (`/`, `/tools`, `/pdf-tools`, `/guides`) with trend reporting.
3. Add automated doc link checker for `README.md` + `docs/**` in CI gate.

## P2

1. Add structured observability dashboard contract (SLO/SLA and error-budget docs in repo).
2. Add route-level accessibility smoke checks for top guides and tool pages in Playwright + axe.
