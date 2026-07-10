# Post-Deploy Live Verification Policy — PersianToolbox

**Status:** Mandatory  
**Site:** `https://persiantoolbox.ir`  
**Reason:** PersianToolbox has already had post-deploy live regressions affecting assets, blog, navbar, tools, and route loading. Build success is not enough.

## Rule

A PersianToolbox deployment is not complete until the live public site is tested with real browsers and the evidence proves that the critical user journeys work.

Agents must not report `deploy successful`, `site healthy`, `10/10`, or `production stable` unless this policy passes.

## Required live checks after every deploy

### Domains and redirects

- `https://persiantoolbox.ir`
- `https://www.persiantoolbox.ir`
- `http://persiantoolbox.ir` → HTTPS/canonical behavior
- `http://www.persiantoolbox.ir` → HTTPS/canonical behavior
- `/api/ready` or available health endpoint
- `/sitemap.xml`
- `/robots.txt`

### Real browser checks

Must use real browser automation, preferably Playwright:

- desktop Chromium or equivalent
- mobile viewport
- console errors captured
- page errors captured
- failed network requests captured
- screenshots for P0/P1 failures

### Critical pages

- homepage
- blog index
- at least 10 blog posts, or all if fewer
- trust/contact/about/pricing/premium pages if present
- all top-level tool categories
- footer and navbar destinations

### Critical tools

At minimum, interact with these tools if present:

- address
- OCR
- salary
- check penalty
- loan
- base64
- JSON formatter
- image tools
- finance/contract tools with simple sample input

A tool is not healthy just because the page renders. It must accept sample input, run its main action, and show output or validation.

### Navigation

- navbar desktop links must be clicked in a browser
- mobile menu must open, close, and navigate
- dropdowns must be clickable
- footer links must be checked
- hard refresh and client-side navigation must both work

### Static assets and Next.js output

Check:

- `_next/static` JS chunks
- CSS chunks
- public images/icons/fonts
- MIME types
- missing chunks
- service worker/cache behavior if enabled
- route hard refresh behavior
- standalone artifact includes `.next/static` and `public/`

## Required verdict

Every deployment report must end with exactly one verdict:

- `LIVE_VERIFICATION_PASS`
- `LIVE_VERIFICATION_PASS_WITH_WARNINGS`
- `LIVE_VERIFICATION_FAIL_ROLLBACK_RECOMMENDED`
- `LIVE_VERIFICATION_FAIL_HOTFIX_REQUIRED`
- `DEPLOY_BLOCKED_NOT_VERIFIED`

## Required report

Write a report to:

```text
reports/live-verification/YYYYMMDD-HHMM-persiantoolbox.md
```

or:

```text
docs/reports/live-verification/YYYYMMDD-HHMM-persiantoolbox.md
```

The report must include:

- deployed commit/release id
- tested URL count
- browsers/devices used
- broken URLs
- navbar click results
- blog results
- tool interaction results
- console errors
- network failures
- screenshots/traces paths for failures
- PM2/nginx findings if checked
- rollback target
- verdict

## Failure handling

- P0/P1 failures block success.
- If homepage, navbar, most routes, blog, or key tools break, report rollback/hotfix recommendation.
- Do not deploy another blind patch without root-cause evidence.
- Do not execute rollback without the required approval phrase.

## Definition of done

PersianToolbox deploy is done only when:

- live browser tests pass
- critical routes/tools pass
- no fresh critical console/network errors remain
- live verification report exists
- rollback target is known
- verdict is recorded
