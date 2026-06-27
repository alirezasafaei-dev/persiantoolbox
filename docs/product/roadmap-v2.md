# Roadmap v2 — PersianToolbox

**Last updated:** 2026-06-27
**Source of truth for autonomous loop prompts.**

---

## Rules

1. **Privacy-first / local-first** — All document processing happens in-browser. Never send document content to server.
2. **One thing at a time** — Finish current item before starting next.
3. **Tests before deploy** — `pnpm lint && pnpm typecheck && pnpm vitest --run` must pass.
4. **No deploy without approval** — Always ask before deploying.
5. **No risky refactor** — Small, safe, testable changes only.
6. **Evidence over claims** — Verify with curl, tests, or code inspection. Never guess.

---

## DONE

Items completed and verified live.

| #   | Item                                                                    | Completed  | Evidence                                                  |
| --- | ----------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| D1  | Fix localhost SEO bug (sitemap, canonical, OG, robots)                  | 2026-06-27 | commit d6d2657, live verified                             |
| D2  | Fix /writing-tools 502, /blog /topics /privacy 504                      | 2026-06-27 | All routes return 200                                     |
| D3  | Add production-mode URL assertion in brand.ts                           | 2026-06-27 | commit d6d2657                                            |
| D4  | Fix deploy-vps-auto.sh to inject NEXT_PUBLIC_SITE_URL                   | 2026-06-27 | commit d6d2657                                            |
| D5  | Add flagship routes to sitemap                                          | 2026-06-27 | 9 flagship routes in sitemap                              |
| D6  | Optimize /blog performance (memoization + revalidate)                   | 2026-06-27 | commit 6735a3a, 1.03s cold                                |
| D7  | Pay-per-export MVP (upgrade modal + checkout)                           | 2026-06-27 | commit bd48482                                            |
| D8  | Live growth audit complete                                              | 2026-06-27 | docs/audits/live-growth-audit-2026-06-27.md               |
| D9  | Search Console sitemap submitted                                        | 2026-06-27 | Manual submission                                         |
| D10 | Security headers verified (CSP, HSTS, X-Frame-Options)                  | 2026-06-27 | All present and strong                                    |
| D11 | Deploy pay-per-export to production                                     | 2026-06-27 | commit aef75b9, live verified                             |
| D12 | Fix 4 broken docs links in archive                                      | 2026-06-27 | commit 898d5c4, check passes                              |
| D13 | Add FAQ schema to 3 flagship pages                                      | 2026-06-27 | commit 27f6012                                            |
| D14 | Add 6 high-quality SEO landing pages                                    | 2026-06-27 | commits bd24f78, 9550ea2, all live 200                    |
| D15 | Add 5 invoice themes (classic, modern, minimal, warm, professional)     | 2026-06-27 | commit e8a033d                                            |
| D16 | Add auto-incrementing invoice numbers                                   | 2026-06-27 | commit b7b5ffa                                            |
| D17 | Add upgrade modal to writing tools                                      | 2026-06-27 | commit daabf47                                            |
| D18 | Add ATS compatibility badge to resume builder                           | 2026-06-27 | commit d002009                                            |
| D19 | Add 5 resume themes (professional, modern, minimal, creative, elegant)  | 2026-06-27 | commit a76455c                                            |
| D20 | Cover letter builder (already implemented)                              | 2026-06-27 | Already at /career-tools/resume-builder?type=cover-letter |
| D21 | Fix logo (PNG from pack), remove kbd/telegram/roadmap, fix blog authors | 2026-06-27 | commit f5dbbcb                                            |
| D22 | Add Enamad trust seal with fallback                                     | 2026-06-27 | commit ab62eaa                                            |
| D23 | Implement server-side export verification                               | 2026-06-27 | commit eb7e590 + c1ecebc                                  |
| D24 | Implement export credit pricing model                                   | 2026-06-27 | commit 38e0841                                            |
| D25 | Fix checkout contract mismatch (payUrl/checkoutUrl dual response)       | 2026-06-27 | Subscription API returns both keys                        |
| D26 | Fix weak privacy copy ("تا حد امکان خیر" → definitive "خیر")            | 2026-06-27 | Fixed in 6 places (registry + 2 pages)                    |

---

## NOW

Current sprint focus. Do these next.

### N1. Export credit metering implementation

- **Why:** Pricing v2 config+UI is deployed but credit deduction, limits, retry window are not implemented. Without metering, premium is not enforced.
- **Files:** lib/pricing/ (metering logic), app/api/credits/ (API endpoints), lib/server/ (DB operations)
- **Acceptance:** Credit balance decrements on clean export, daily/monthly limits enforced, retry within 30min is free
- **Test:** Unit tests for credit deduction, limit enforcement, retry window
- **Deploy risk:** MEDIUM
- **RFC:** docs/architecture/export-credit-entitlements-rfc.md

### N2. Monitor Search Console indexing

- **Why:** Sitemap submitted, need to verify Google picks it up
- **Files:** None (manual Search Console check)
- **Acceptance:** Coverage report shows valid pages after 48-72 hours
- **Test:** Search Console → Pages → Valid count > 0
- **Deploy risk:** NONE

### N3. Set EXPORT_TOKEN_SECRET on VPS

- **Why:** Production currently falls back to NEXTAUTH_SECRET. Should have its own dedicated secret for export token signing.
- **Files:** VPS .env only
- **Acceptance:** `EXPORT_TOKEN_SECRET` is set and production uses it
- **Test:** Verify export token API works with new secret
- **Deploy risk:** LOW

---

## NEXT

Sprint 2 focus. Start after NOW items are done.

### X1. One-time pay-per-export

- **Why:** Better for occasional users than monthly subscription.
- **Requires:** New product SKU, purchase verification endpoint, DB schema for one-time purchases
- **Status:** RFC ready at docs/architecture/one-time-pay-per-export-rfc.md
- **Priority:** HIGH

### X2. AI text improvement for resume builder

- **Why:** Competitors CVBuilder and CVResume have AI. Table stakes in 2026.
- **Requires:** AI API integration, prompt design, cost management
- **Status:** BLOCKED by AI API cost analysis
- **Priority:** HIGH

### X3. Content marketing (50+ articles)

- **Why:** Competitor Karboom proves content drives 50K-334K views.
- **Requires:** Content creation, SEO optimization, internal linking
- **Status:** BLOCKED by need for content strategy
- **Priority:** HIGH

### X4. Legacy route cleanup

- **Why:** /text-tools/resume-builder is a legacy duplicate of /career-tools/resume-builder. Needs 301 redirect.
- **Files:** app/text-tools/resume-builder/, nginx config
- **Acceptance:** /text-tools/resume-builder redirects to /career-tools/resume-builder
- **Test:** curl -I /text-tools/resume-builder shows 301
- **Deploy risk:** MEDIUM (SEO impact)
- **Status:** DOCUMENTED, pending redirect decision

---

## What NOT to Build

1. **Job board integration** — Don't compete with Karboom/JobVision on their turf
2. **Payment gateway integration** — ZarinPal is sufficient; don't add IDPay/NextPay yet
3. **Multi-language resume** — Focus on FA/EN first
4. **AI content generation** — Too expensive; focus on AI text improvement
5. **Enterprise/team features** — Market too small for B2B
6. **Mobile app** — PWA is sufficient
7. **Database-heavy features** — Keep local-first advantage
8. **Custom domain email** — Not a growth driver
9. **Affiliate program** — Premature before content marketing
10. **White-label API** — Premature before core products polished

---

## Acceptance Criteria Template

For each roadmap item, use this template:

```
### [ID]. [Title]
- **Why:** [One sentence]
- **Files:** [List of files to change]
- **Acceptance:** [Measurable criterion]
- **Test:** [How to verify]
- **Deploy risk:** LOW/MEDIUM/HIGH
```

---

## How to Use This Roadmap

1. **Autonomous loop prompt:** Read this file as source of truth. Execute items in order: DONE → NOW → NEXT.
2. **Before starting an item:** Check if it's actually done or blocked.
3. **After completing an item:** Move it to DONE, add completion date and evidence.
4. **If blocked:** Document blocker. Do not skip.
5. **If new item discovered:** Add to appropriate section (NOW or NEXT).
6. **Never skip verification:** Always run tests before marking done.
7. **Never deploy without approval:** Always ask user before deploying.
