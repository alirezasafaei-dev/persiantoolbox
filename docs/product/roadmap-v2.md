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

| #   | Item                                                                | Completed  | Evidence                                    |
| --- | ------------------------------------------------------------------- | ---------- | ------------------------------------------- |
| D1  | Fix localhost SEO bug (sitemap, canonical, OG, robots)              | 2026-06-27 | commit d6d2657, live verified               |
| D2  | Fix /writing-tools 502, /blog /topics /privacy 504                  | 2026-06-27 | All routes return 200                       |
| D3  | Add production-mode URL assertion in brand.ts                       | 2026-06-27 | commit d6d2657                              |
| D4  | Fix deploy-vps-auto.sh to inject NEXT_PUBLIC_SITE_URL               | 2026-06-27 | commit d6d2657                              |
| D5  | Add flagship routes to sitemap                                      | 2026-06-27 | 9 flagship routes in sitemap                |
| D6  | Optimize /blog performance (memoization + revalidate)               | 2026-06-27 | commit 6735a3a, 1.03s cold                  |
| D7  | Pay-per-export MVP (upgrade modal + checkout)                       | 2026-06-27 | commit bd48482                              |
| D8  | Live growth audit complete                                          | 2026-06-27 | docs/audits/live-growth-audit-2026-06-27.md |
| D9  | Search Console sitemap submitted                                    | 2026-06-27 | Manual submission                           |
| D10 | Security headers verified (CSP, HSTS, X-Frame-Options)              | 2026-06-27 | All present and strong                      |
| D11 | Deploy pay-per-export to production                                 | 2026-06-27 | commit aef75b9, live verified               |
| D12 | Fix 4 broken docs links in archive                                  | 2026-06-27 | commit 898d5c4, check passes                |
| D13 | Add FAQ schema to 3 flagship pages                                  | 2026-06-27 | commit 27f6012                              |
| D14 | Add 6 high-quality SEO landing pages                                | 2026-06-27 | commits bd24f78, 9550ea2, all live 200      |
| D15 | Add 5 invoice themes (classic, modern, minimal, warm, professional) | 2026-06-27 | commit e8a033d                              |
| D16 | Add auto-incrementing invoice numbers                               | 2026-06-27 | commit b7b5ffa                              |
| D17 | Add upgrade modal to writing tools                                  | 2026-06-27 | commit daabf47                              |
| D18 | Add ATS compatibility badge to resume builder                       | 2026-06-27 | commit d002009                              |

---

## NOW

Current sprint focus. Do these next.

### N1. Deploy pay-per-export to production ✅ DONE

- **Why:** First revenue path. MVP is committed but not deployed.
- **Files:** None (just deploy bd48482 or newer)
- **Acceptance:** Upgrade modal visible on /business-tools/document-studio and /career-tools/resume-builder export step
- **Test:** curl export page, verify upgrade button present
- **Deploy risk:** LOW

### N2. Monitor Search Console indexing

- **Why:** Sitemap submitted, need to verify Google picks it up
- **Files:** None (manual Search Console check)
- **Acceptance:** Coverage report shows valid pages after 48-72 hours
- **Test:** Search Console → Pages → Valid count > 0
- **Deploy risk:** NONE

### N3. Fix 4 broken docs links in archive ✅ DONE

- **Why:** `quality:docs-links:check` fails on archived roadmap files
- **Files:** docs/archive/ROADMAP_AUTOMATION.md, docs/archive/ROADMAP_EXECUTION.md, docs/archive/ROADMAP_OBJECTIVES.md, docs/archive/ROADMAP_REAL.md
- **Acceptance:** `pnpm quality:docs-links:check` passes
- **Test:** Run the check command
- **Deploy risk:** NONE

### N4. Add FAQ schema to flagship product pages ✅ DONE

- **Why:** Rich results increase CTR by 20-30%
- **Files:** app/business-tools/document-studio/page.tsx, app/career-tools/resume-builder/page.tsx, app/writing-tools/persian-writing-studio/page.tsx
- **Acceptance:** Google Rich Results Test passes for each page
- **Test:** Validate JSON-LD schema
- **Deploy risk:** LOW

---

## NEXT

Sprint 2 focus. Start after NOW items are done.

### X1. Server-side export verification

- **Why:** Current premium gates are UI-only. Determined users can bypass.
- **Files:** lib/server/entitlements.ts, components/features/business-documents/DocumentStudio.tsx, components/features/career-documents/CareerWizard.tsx
- **Acceptance:** Premium export requires verified subscription on server
- **Test:** Unit test for entitlement check, E2E test for export flow
- **Deploy risk:** MEDIUM

### X2. Add 6-9 high-quality SEO pages ✅ DONE (6 pages)

- **Why:** Content marketing is the #1 growth lever. Start with quality over quantity.
- **Pages:**
  1. /zwnj-correction — standalone ZWNJ tool page (high-volume keyword)
  2. /invoice-maker — dedicated landing page for فاکتورساز
  3. /resume-builder — dedicated landing page for رزومه‌ساز
  4. /persian-editor — dedicated landing page for ویرایشگر فارسی
  5. /pdf-tools-farsi — Persian PDF tools landing page
  6. /how-to-write-invoice — guide page
  7. /how-to-write-resume — guide page
  8. /persian-text-correction — guide page
  9. /financial-calculators — guide page
- **Acceptance:** Each page has unique title, meta description, FAQ schema, internal links
- **Test:** `pnpm quality:links:check` passes, manual SEO audit
- **Deploy risk:** LOW

### X3. Add invoice themes (5+) ✅ DONE

- **Why:** Competitor FactorArsa has 9 themes. Users expect visual variety.
- **Files:** lib/business-documents/themes.ts, components/features/business-documents/
- **Acceptance:** 5+ themes available, each produces distinct output
- **Test:** Unit test for each theme
- **Deploy risk:** LOW

### X4. Add auto-incrementing invoice numbers ✅ DONE

- **Why:** Competitor NegarNo has this. Expected feature for business users.
- **Files:** lib/business-documents/draft-storage.ts
- **Acceptance:** Invoice numbers auto-increment per user session
- **Test:** Unit test for number sequence
- **Deploy risk:** LOW

### X4. Add auto-incrementing invoice numbers

- **Why:** Competitor NegarNo has this. Expected feature for business users.
- **Files:** lib/business-documents/draft-storage.ts
- **Acceptance:** Invoice numbers auto-increment per user session
- **Test:** Unit test for number sequence
- **Deploy risk:** LOW

---

## LATER

Sprint 3+ focus. Start after NEXT items are done.

### L1. Pay-per-export (one-time purchase)

- **Why:** Better for occasional users than monthly subscription.
- **Requires:** New product SKU, purchase verification endpoint, DB schema for one-time purchases
- **Status:** BLOCKED by need for DB schema design
- **Priority:** HIGH

### L2. AI text improvement for resume builder

- **Why:** Competitors CVBuilder and CVResume have AI. Table stakes in 2026.
- **Requires:** AI API integration, prompt design, cost management
- **Status:** BLOCKED by AI API cost analysis
- **Priority:** HIGH

### L3. Resume template variety (10+)

- **Why:** Competitors offer 30+ templates. Users expect choice.
- **Requires:** Template design, rendering pipeline
- **Status:** NOT STARTED
- **Priority:** MEDIUM

### L4. Cover letter builder

- **Why:** Natural companion to resume builder.
- **Requires:** New component, template, export logic
- **Status:** NOT STARTED
- **Priority:** MEDIUM

### L5. ATS compatibility badge ✅ DONE

- **Why:** Market differentiator. Users care about ATS.
- **Requires:** Research, badge design, marketing copy
- **Status:** DONE — green badge added to resume preview
- **Priority:** MEDIUM

### L6. Writing tool monetization ✅ DONE

- **Why:** Third flagship product not yet monetized.
- **Requires:** Upgrade modal integration (same pattern as business/career)
- **Status:** DONE — upgrade modal added at character limit and strict mode lock
- **Priority:** LOW

### L7. Content marketing (50+ articles)

- **Why:** Competitor Karboom proves content drives 50K-334K views.
- **Requires:** Content creation, SEO optimization, internal linking
- **Status:** BLOCKED by need for content strategy
- **Priority:** HIGH (but start with 6-9 pages in NEXT)

---

## BLOCKED

Items blocked by external dependencies or decisions.

| #   | Item                            | Blocker                                 | Unblock action                              |
| --- | ------------------------------- | --------------------------------------- | ------------------------------------------- |
| B1  | Pay-per-export (one-time)       | DB schema design for one-time purchases | Design schema, get approval                 |
| B2  | AI text improvement             | AI API cost analysis                    | Research API pricing, set budget            |
| B3  | Content marketing (50+)         | Content strategy needed                 | Define keyword clusters, editorial calendar |
| B4  | Server-side export verification | Architecture decision needed            | Decide: full server verification vs hybrid  |

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

1. **Autonomous loop prompt:** Read this file as source of truth. Execute items in order: DONE → NOW → NEXT → LATER.
2. **Before starting an item:** Check if it's actually done or blocked.
3. **After completing an item:** Move it to DONE, add completion date and evidence.
4. **If blocked:** Document blocker in BLOCKED table. Do not skip.
5. **If new item discovered:** Add to appropriate section (NOW, NEXT, or LATER).
6. **Never skip verification:** Always run tests before marking done.
7. **Never deploy without approval:** Always ask user before deploying.
