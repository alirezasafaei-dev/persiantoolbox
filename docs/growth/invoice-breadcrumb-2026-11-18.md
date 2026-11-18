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
