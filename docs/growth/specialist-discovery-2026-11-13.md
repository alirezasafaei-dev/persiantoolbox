# Specialist section discovery — 2026-11-13

## Audit and bounded change

The live homepage linked `/developers` only in its footer. Neither developers nor
market had a menu entry or a searchable registry entry. Comparing the homepage's
HTML links with the sitemap's 34 root sections found eight without direct home
links: `/ai`, `/compare`, `/use-cases`, `/market`, `/asdev`, `/case-studies`,
`/compatibility`, `/refer`. All eight returned HTTP 200. This does not prove
they lack incoming links throughout the site or explain Google's indexing decisions.

Prioritize the owner's requested developer and market destinations. Keep the
other sections out of this patch pending an individual usefulness/content audit.

- Add developers and market to the existing shared utility menu, covering both
  desktop and mobile navigation. Retain the developer footer link and add market.
- Register both as indexable hubs, with Hybrid and Online-Required processing
  tiers respectively. Tool counts and tool categories remain tool-only.
- Include indexable hubs in site search. Label hub results as specialist sections.
- Show separate specialist cards on `/tools`, including matching cards when the
  query has no ordinary tool results. Category-specific lists remain scoped to
  their selected category.
- Constrain desktop dropdown height and permit scrolling so the added group stays
  reachable on shorter screens. Reuse existing RTL, dark-mode and focus styling.

No new dependency, premium/credit mutation, source provider, or global palette
change is included. Adding navigation does not establish market-data accuracy:
that correction is independently reviewable in PR #284.

## Evidence and remaining gates

Six new regressions failed before implementation and passed after correction.
Twenty focused tests passed across discovery, registry display/indexing, search
and navigation feature-flag suites. The final quick gate passed 2,207 tests in
286 files. Contracts, production build and 11 canonical standalone smoke checks
passed. No timeout or security assertion was weakened.

Standalone Chromium checks passed at 1440×900, 1366×768 and 390×844 (mobile dark
mode): specialist cards, API query, category filtering, global search, keyboard
activation of the developer menu link, dropdown containment and no horizontal
overflow. Desktop/light and mobile/dark specialist cards were visually reviewed.
The public tool count stayed at 101. No paid operation was performed.

Independent source review found no actionable issues. Hosted checks and owner
authorization remain separate gates. This candidate is not deployed and does
not authorize merge or deployment.
