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
the outer disclosure for focus, body-scroll and Escape behavior. The native
`open` attribute stays uncontrolled: unrelated hydration renders must not reset
a click before its asynchronous toggle event reaches React. Explicit close
actions schedule a separate effect rather than synchronously hiding an activated
anchor. Ordinary state synchronization does not write to the native disclosure.
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

## Hosted follow-up

The first hosted run for `b6f35dad` failed two cases in browser shard 2; all other
executed checks passed. Both failures were reproduced locally. The homepage test
selected the first PDF anchor, which now exists inside a hidden native section;
scope that user action to the main content instead. The blog hydration case
exposed a real timing race in the controlled `open` attribute: an unrelated render
could restore the old closed value before the native toggle event was handled.
The follow-up leaves `open` browser-owned and closes it only for explicit actions.
Both formerly failing tests then passed three times each. Full regression checks
and hosted verification of the follow-up remain required; the earlier hosted run
is retained as a failure, not described as passing.

## Manual verification recovery

For follow-up `a62cf755`, all three PR-triggered workflows remained queued with
zero jobs. API cancellation/force cancellation returned 409, the authenticated
Chrome cancel button failed, and the rerun endpoint returned 403 (already
running). No production change or check override was performed.

The existing manual `deploy-gate` workflow was dispatched on the same head as a
bounded diagnostic (run 43102310084). It allocated a runner and started a real
job while the PR run remained queued. This proves that manual dispatch is a
working alternative at this point; it does not establish GitHub's internal
reason for the stuck PR events or replace E2E/CodeQL acceptance.

Add `workflow_dispatch` to the existing ci-core, CodeQL and Lighthouse workflows
so authorized maintainers can execute their unchanged checks on an exact branch
revision. Jobs, runner labels, assertions, timeouts, permissions, dependencies
and normal PR triggers are unchanged. No production workflow is dispatched by
this recovery. Capture the new exact SHA and verify each manual run's head;
old-head or incomplete checks are not acceptance. Queued historical runs remain
visible and must not be represented as successful or bypassed during merge.

### Recovery results and performance diagnostics

At `70af062670e357af845ae0e68071a91cff802b67`, manual ci-core run
43102721419 and CodeQL run 43102728606 passed. Automatic ci-core run
43102728213 also passed, including all four browser shards. Lighthouse remains
blocking: manual run 43102735105 scored 0.63 on the homepage, with CLS 0.32048
and TBT 346.5 ms; automatic run 43102728017 scored 0.47, with CLS 0 and TBT
1929.5 ms. These are different observed failure mechanisms, not a proven cause.

The same application on local canonical standalone with LHCI 0.13.0 scored
0.95, CLS 0 and TBT 0.5 ms. Local Chrome was 157; hosted Chrome was 156.
That local pass cannot clear either hosted failure. Existing hosted artifacts
contain reports but no performance traces, so enable Lighthouse's `saveAssets`
and retain trace files with the reports for seven days. Generated traces and
DevTools logs are ignored by Git; DevTools network logs are not uploaded.
Assertions, audited routes, run count, browser settings and runner remain
unchanged. Use the new hosted trace to identify a cause before changing product
code; neither an older passing head nor a later isolated pass erases these
failures. PR #267 remains a draft and has not been approved for publication.
