# Services internal discovery — 2026-11-10

## Evidence and correction

The live `/services` page responds HTTP 200, declares itself canonical, has no noindex and is included in the sitemap. Read-only Search Console inspection nevertheless has no recorded crawl time. Bounded source search found no internal href to the page, and the live homepage/about/contact/asdev/case-studies entry points contained no services link. Sitemap presence does not replace useful crawlable navigation.

Add the existing `/services` destination to `footerPageLinks` with label `خدمات`, within the existing site-exploration section. This reuses shared footer rendering without a new menu, page, dependency, redesign or unsupported traffic/indexing claim.

The focused Footer regression failed before the change because the services anchor was absent. After the one-line registry change, all 13 Footer/RTL navigation tests passed. Build, contracts and canonical 11-route smoke passed. Real Chromium checks at 390px and 1440px confirmed the anchor in raw homepage HTML, exactly one accessible footer link, successful click to services, one settled self-canonical and successful hard refresh with no page errors. Visual screenshots were reviewed. The initial immediate canonical assertion observed transitional old/new metadata during client navigation; waiting for exactly one canonical passed without a source workaround. Independent review found no navigation/accessibility/security issue. Lint, TypeScript and local-first checks passed. The complete suite passed 2,109 tests in 271 files with two workers and unchanged timeout/assertion limits. Raw candidate screenshots/logs remain outside Git. The initial test-only unsupported `exact` option was caught by the build typecheck and corrected to an anchored name expression before the successful final gates.

This is separate from PR #264, which preserves early form input. Neither candidate is deployed. Production remains `05b8c05f8d33953b1c4b419ac69cb16bbcf1f7f5`. Exact-version merge/publication approval is required for a future release. No repeated indexing request was submitted, and a link does not establish that Google has crawled or indexed the page.
