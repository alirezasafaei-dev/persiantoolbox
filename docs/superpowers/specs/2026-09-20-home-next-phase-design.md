# Homepage next-phase design

**Date:** 2026-09-20

**Status:** Owner-approved design; implementation not started

**Scope:** The four open items recorded after the phase-one homepage merge

## Goal

Make the first useful tool path easier to reach on narrow mobile screens, verify and correct search-placeholder contrast only when measurement requires it, and prevent the install invitation from competing with unresolved consent. Preserve the current Persian RTL design, URLs, search behavior, privacy choices, install dismissal, and desktop accessibility. GSC/GEO analysis remains evidence-gated on authorized private data.

No staging or production deployment is authorized by this design. A new PR also requires separate owner merge approval.

## Options considered

### Mobile tool access

1. **Task-first document order (selected):** move the existing «چه کاری می‌خواهید انجام دهید؟» section directly after the hero, before the three value-proof cards. This removes a full stack of mobile cards from the route to the first task without duplicating links or creating visual/DOM-order disagreement.
2. Compact the hero only. This keeps the current content order but produces a smaller improvement and risks making the heading, search, quick links, actions, or trust copy too dense.
3. Add a second mobile-only task launcher inside the hero. This reaches tools quickly but duplicates navigation and analytics surfaces and increases maintenance cost.

The selected approach keeps all content and touch targets. Mobile-only spacing may be reduced where measurement shows unnecessary whitespace, but body text will not be reduced and essential copy will not be hidden or clamped. The same semantic order will be used at all breakpoints so keyboard and screen-reader order match the visual order.

### Consent and install coordination

1. **Gate only the install invitation (selected):** retain the deferred `beforeinstallprompt` event, the existing 45-second delay, install dismissal, and outcome handling, but require a non-null consent state before showing the invitation.
2. Combine consent and installation into one overlay. Rejected because installation and analytics consent are independent decisions.
3. Permanently suppress installation after consent rejection. Rejected because rejecting analytics is not rejecting the install feature.

Both accepted and rejected consent resolve the gate. The install component must never write consent, alter analytics settings, or reinterpret rejection as acceptance.

## Design

### 1. Mobile task access

- Move the existing task-selection section in `components/HomePage.tsx` immediately after `HomeHero`.
- Keep the six existing labels, destinations, icons, and link semantics unchanged.
- Place value-proof cards after the task selector; no content is removed.
- Add stable selectors only where needed for measurement tests, preferring accessible headings and section relationships over test-only IDs.
- Measure the document-top offset of the task heading and first task link at 360×800 and 390×844 before and after the change.
- Acceptance requires a material reduction at both widths, no horizontal overflow, no smaller body text, no hidden essential content, matching DOM/visual order, and retained keyboard reachability and touch targets.
- Capture light and dark screenshots at 360×800 and 390×844 plus a 200% zoom check.

### 2. Search placeholder contrast

- Read computed placeholder foreground and input background colors in both light and dark themes.
- Calculate the WCAG contrast ratio from the rendered colors, including alpha compositing where applicable.
- Require at least 4.5:1 because placeholder text is normal-size instructional text.
- If either theme is below 4.5:1, change only the scoped search placeholder color using existing semantic tokens or a narrowly scoped CSS rule. Do not change global muted text or the search label/focus behavior.
- If both themes already pass, record the measured ratios and make no visual color change.

### 3. Consent/install coordination

`ServiceWorkerRegistration` will treat install eligibility as the conjunction of four independent conditions:

1. a deferred `beforeinstallprompt` event exists;
2. the existing install delay has elapsed;
3. `readAnalyticsConsent()` returns a valid v2 state, regardless of accepted or rejected values;
4. `pwa-install-dismissed` is absent and the app is not already installed.

On mount, the component reads current consent. While consent is unknown it retains the deferred prompt but keeps the install UI hidden. It subscribes to `ANALYTICS_CONSENT_EVENT`; either accepted or rejected detail marks consent resolved and re-evaluates the other gates. The listener is removed on cleanup.

`appinstalled` continues to hide the invitation, clear the deferred event, mark the app installed, and persist dismissal. Manual dismissal and `userChoice` behavior remain unchanged. Invalid or inaccessible local storage is handled conservatively: unreadable consent remains unresolved, and storage failures must not crash the page.

### 4. GSC/GEO evidence gate

- Use only authorized Performance exports for the latest complete 28 days and the preceding 28 days.
- Record property, date ranges, search type, filters, pages, queries, country/device breakdown, and Page indexing reasons.
- Keep raw exports and private queries outside the public repository.
- Produce source-backed priorities only; do not claim ranking growth or invent missing metrics.
- If authorized data is unavailable, retain `BLOCKED` with the exact missing input and complete all independent UI work.

## Testing strategy

Implementation follows red-green-refactor.

- Add a failing homepage E2E assertion for the approved section order and quantitative 360/390 task offsets before moving production markup.
- Add contrast measurement assertions for light and dark placeholders before any scoped color correction. A passing baseline means no production color change is needed; the test and recorded evidence still satisfy the measurement task.
- Add failing component-level tests for the install invitation states: unknown consent after delay stays hidden; accepted after delay is eligible; rejected after delay is eligible; dismissal stays hidden; `appinstalled` cleans up; event listeners are removed.
- Preserve existing homepage search, CTA, overflow, mobile, consent, service-worker contract, and accessibility tests.
- Run focused tests during development, then `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, canonical standalone smoke, relevant Playwright suites, screenshots, and formatting/licensing checks for the final candidate.

## Deliverables and boundaries

- One isolated branch with independently reviewable signed commits: design/plan, mobile and contrast work, consent/install work, and final evidence/docs.
- Update the task board and issue #47 with exact SHA, commands, results, artifacts, blocked inputs, merge state, and deployment state.
- Do not merge, dispatch deployment workflows, or change staging/production without a separate explicit owner instruction.
- Do not modify pricing, payments, tool behavior, analytics consent semantics, global palette, infrastructure, or dependencies.
