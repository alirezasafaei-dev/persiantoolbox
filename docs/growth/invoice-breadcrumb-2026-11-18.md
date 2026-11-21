# Invoice breadcrumb ownership

The live invoice returned two breadcrumb navigation regions. Both also repeated
home because the renderer inserted home before the supplied home item. The
outer layout marked the parent category as current. Invoice JSON-LD included
both the shared tool BreadcrumbList and an extra route BreadcrumbSchema.

The layout now owns invoice navigation. ToolPageShell has an optional inner
breadcrumb flag with its existing default retained, and only the invoice opts
out. Its extra BreadcrumbSchema is removed. The shared renderer filters supplied
root links, and registered entries use their category/current title, including
existing metadata overrides. Category roots omit a self-link. Badges remain.

Two initial regressions failed before correction. Review identified category
self-links and title divergence; added regressions reproduced both before their
correction. Typecheck caught an overly narrow helper call; selecting the existing
override safely fixed it without broadening the helper or changing dates.

Final focused checks passed 15 tests; independent review passed with no remaining
findings. Production build, contracts and 11 canonical standalone smoke routes
passed. Production-mode Chromium tests passed at 1440px and 390px, asserting one
navigation region, one home link, category link, current invoice, one H1, one
BreadcrumbList and no horizontal overflow.

An earlier full quick run had 2,222 passes and one 5-second Search Console test
timeout; isolated rerun passed all 22 SEO tests. Preserve that failed run rather
than silently treating it as success. Final full-suite results are tracked
separately: the final `pnpm ci:quick` passed 2,224 tests in 289 files. No ranking
or CTR improvement is established by this correction.

This change is independent of the already approved PR #294 release. Its deploy
stopped before server mutation at the unchanged picomatch audit finding; do not
weaken that gate or add this candidate to the old authorization. No dependency,
premium gate or financial processing behavior is changed here.

## Hosted layout follow-up - 2026-11-20

The first hosted candidate failed the cold-font layout test at 768px, with CLS
0.4868. Its trace shows the tools breadcrumb/status bar changing from two rows
to one after font arrival. The same candidate passed locally on Windows with
CLS 0.0043, so that local result did not establish Linux compatibility.

Keep the breadcrumb in its own grid row at every breakpoint, with the status
badges below it. This removes the font-dependent flex-wrap transition without
changing the CLS limit or delaying the test until after font loading. The
production-mode layout tests now pass locally at 320, 360, 390, 768 and 1440px;
CLS ranges from 0 to 0.0045. Both invoice breadcrumb browser tests also pass.
The updated source passes all 2,224 tests in 289 files, contracts, production
build and 11 standalone smoke routes. Visual checks at 390, 768 and 1440px in
light and dark modes show no horizontal overflow. Independent review found no
actionable issues.
Hosted verification must confirm the updated candidate before release approval.

The fresh production dependency audit on 2026-11-20 reports zero vulnerabilities.
The unchanged, owner-approved PR #294 deployment was retried through the original
canonical workflow. Its live acceptance remains separate from this candidate.
