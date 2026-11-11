# Services internal discovery — 2026-11-10

## Evidence and correction

The live `/services` page responds HTTP 200, declares itself canonical, has no noindex and is included in the sitemap. Read-only Search Console inspection nevertheless has no recorded crawl time. Bounded source search found no internal href to the page, and the live homepage/about/contact/asdev/case-studies entry points contained no services link. Sitemap presence does not replace useful crawlable navigation.

Add the existing `/services` destination to `footerPageLinks` with label `خدمات`, within the existing site-exploration section. This reuses shared footer rendering without a new menu, page, dependency, redesign or unsupported traffic/indexing claim.

The focused Footer regression failed before the change because the services anchor was absent. After the one-line registry change, all 13 Footer/RTL navigation tests passed. Build, contracts and canonical 11-route smoke passed. Real Chromium checks at 390px and 1440px confirmed the anchor in raw homepage HTML, exactly one accessible footer link, successful click to services, one settled self-canonical and successful hard refresh with no page errors. Visual screenshots were reviewed. The initial immediate canonical assertion observed transitional old/new metadata during client navigation; waiting for exactly one canonical passed without a source workaround. Independent review found no navigation/accessibility/security issue. Lint, TypeScript and local-first checks passed. The complete suite passed 2,109 tests in 271 files with two workers and unchanged timeout/assertion limits. Raw candidate screenshots/logs remain outside Git. The initial test-only unsupported `exact` option was caught by the build typecheck and corrected to an anchored name expression before the successful final gates.

The preceding validation describes the original candidate. On 2026-11-11,
production was rechecked at `06fa9f3fec8ebbedbeab7a958136b1cae93e9e01`:
version and health returned HTTP 200, `/services` returned self-canonical HTTP
200, and the homepage still lacked a services anchor. This correction remains
unpublished; the early-input and mobile-navigation repairs are already live.

PR #265's first two hosted attempts failed during browser dependency installation
on Ubuntu mirror DNS resolution, before browser tests ran. The bounded third
attempt of run 43039146302 passed all four Chromium shards, smoke and readiness
on original head `2459e2e7107612b954edfa34ed4d1b80f69c9429`. No checks were
removed or relaxed. That old-head success does not prove integration with the
new main branch. A normal, conflict-free merge of current main is being verified
in a separate managed worktree; the diff against main remains the services link,
its Footer regression and this evidence document. New exact-head hosted checks
and independent review are required before release approval.

Exact-version merge/publication approval is required for PR #265. No repeated
indexing request was submitted, and a link does not establish that Google has
crawled or indexed the page.

## Current-main integration validation — 2026-11-11

The combined candidate passed 2,121 tests in 272 files with two workers and
unchanged assertions/timeouts. Focused Footer/RTL tests passed all 13 cases.
Lint passed with the existing 11 warnings, TypeScript and local-first passed,
and contracts, build and canonical standalone smoke passed all 11 route checks.
Built Chromium checks at 390px and 1440px passed raw HTML anchor presence,
unique accessible footer link, click to services, settled self-canonical,
hard refresh and no page errors. Candidate screenshots were inspected.
Repository secret scanning, gitleaks and production dependency audit passed.
Independent review found no product-code issue; its packaging note was addressed
by staging this updated document with the merge. Final pushed-head CI is still
required; none of these local results establishes publication or Google indexing.
