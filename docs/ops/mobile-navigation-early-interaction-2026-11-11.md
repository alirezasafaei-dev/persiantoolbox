# Mobile navigation before hydration — 2026-11-11

## Reproduction and requirements

On the published payment repair revision, a cold mobile menu click was lost in
one of two normal loads and consistently with external scripts held. A second
click worked. Ready-state navigation passed without JavaScript errors.

The candidate must open the menu and its nested groups before external scripts
arrive, preserve their state through hydration without hydration errors, and
support Escape, keyboard navigation, link activation and route changes afterward.
The real JavaScript-disabled page must expose the menu and follow its links;
extracting a header into a synthetic page is not acceptance evidence.

## Design and tradeoffs

Use native `details`/`summary` disclosures for the mobile menu and its sections.
The browser owns their initial open state. After hydration React synchronizes
the outer disclosure for focus, body-scroll and Escape behavior. Link activation
schedules state updates rather than synchronously hiding the activated anchor.
Keep the existing client `aria-expanded` contract after hydration; before that,
the summary relies on its native accessible expansion state. Only intentionally
mutable disclosure attributes suppress hydration warnings; console errors remain
an acceptance gate.

The real no-JavaScript investigation found the header inside React's hidden
streamed `S:0` segment. The automatic root `app/loading.tsx` boundary wrapped
the whole page shell; its completion requires inline streaming scripts. Removing
that global fallback allows the root page shell to be delivered visibly without
those scripts. Tool, blog and admin loading boundaries remain.

This is a cross-site rendering tradeoff: routes without dedicated loading UI
retain the previous content while the next route resolves, instead of displaying
the global skeleton. Initial responses also wait rather than emitting that root
fallback. Check a deliberately held client navigation to an uncovered route for
visible previous content and eventual destination rendering. This does not
establish that every tool's main function works without JavaScript.

## Evidence and remaining gates

- Both original early-interaction and real no-JavaScript cases failed before
  repair. The native-disclosure-only candidate fixed early input, but the real
  no-JavaScript test remained blocked by the root streamed shell.
- After removing the root fallback and using controlled state only after
  hydration, both real-page cases passed three times each (six executions).
- Final local verification passed: full lint/typecheck/local-first, all 2,120
  Vitest tests in 272 files with two workers, contracts, build, 11 canonical
  standalone smoke checks, documentation checks, repository secret scanning,
  gitleaks and production dependency audit. Lint retains the repository's 11
  existing warnings and has no errors.
- The final three browser cases passed: held-destination client navigation,
  early outer/nested disclosure through hydration and real no-JavaScript link
  navigation. Earlier slow-route harness attempts timed out because prefetching
  prevented the intended delay; the final case awaits the actual click before
  checking the original visible H1 and root URL while the response is held.
- Independent final review found no remaining issues. Hosted checks and owner
  approval are still required before merge/publication; local success is not
  live acceptance.
- No production configuration, payment state, permissions or dependencies change.
  This work is independent of the already-published PR #266 payment repair.
  A new publication still requires explicit owner authorization.
