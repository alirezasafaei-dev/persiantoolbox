# Growth Roadmap — PersianToolbox

**Date:** 2026-06-27
**Based on:** Live Growth Audit 2026-06-27

---

## Scoring Legend

- **Impact:** 1-5 (5 = transformative)
- **Effort:** 1-5 (5 = months)
- **Confidence:** 1-5 (5 = proven pattern)
- **Risk:** 1-5 (5 = high risk)
- **Priority:** P0 (must fix) / P1 (high value) / P2 (important) / P3 (nice to have)

---

## A) Immediate Fixes (1-3 days)

### A1. Fix Deploy Script — NEXT_PUBLIC_SITE_URL Injection

| Field           | Value                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Task**        | Add NEXT_PUBLIC_SITE_URL to VPS build command                                                                                |
| **Why**         | All canonical URLs, OG, JSON-LD, sitemap, robots.txt use localhost:3000 — site is invisible to Google                        |
| **Impact**      | 5                                                                                                                            |
| **Effort**      | 1                                                                                                                            |
| **Confidence**  | 5                                                                                                                            |
| **Risk**        | 1                                                                                                                            |
| **Priority**    | P0                                                                                                                           |
| **Files**       | deploy-vps-auto.sh (line 70)                                                                                                 |
| **Change**      | `NODE_OPTIONS='--max-old-space-size=4096' NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir NODE_ENV=production npx next build` |
| **Acceptance**  | All pages show correct canonical, OG, JSON-LD URLs                                                                           |
| **Test**        | `curl -s https://persiantoolbox.ir/ \| grep 'canonical.*persiantoolbox'`                                                     |
| **Deploy risk** | LOW — env var only                                                                                                           |

### A2. Fix /writing-tools 502 Error

| Field          | Value                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Task**       | Diagnose and fix 502 on /writing-tools category page                                             |
| **Why**        | Category page for writing tools is broken — users clicking "ابزارهای نگارش فارسی" in nav get 502 |
| **Impact**     | 4                                                                                                |
| **Effort**     | 2                                                                                                |
| **Confidence** | 3                                                                                                |
| **Risk**       | 2                                                                                                |
| **Priority**   | P0                                                                                               |
| **Files**      | app/writing-tools/page.tsx, server config                                                        |
| **Acceptance** | Returns 200 with proper content                                                                  |
| **Test**       | `curl -I https://persiantoolbox.ir/writing-tools` returns 200                                    |

### A3. Fix /blog, /topics, /privacy 504 Timeouts

| Field          | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **Task**       | Diagnose and fix 504 timeouts on multiple pages                 |
| **Why**        | Three important pages are timing out — hurts SEO and user trust |
| **Impact**     | 4                                                               |
| **Effort**     | 2                                                               |
| **Confidence** | 3                                                               |
| **Risk**       | 2                                                               |
| **Priority**   | P0                                                              |
| **Files**      | Server/nginx config, possibly PM2 memory limits                 |
| **Acceptance** | All three pages return 200 within 5 seconds                     |
| **Test**       | `curl -I https://persiantoolbox.ir/blog` returns 200            |

### A4. Add Production-Mode URL Assertion

| Field          | Value                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Task**       | Add runtime assertion in brand.ts to prevent localhost in production                                  |
| **Why**        | Prevent future localhost SEO bugs — defense in depth                                                  |
| **Impact**     | 4                                                                                                     |
| **Effort**     | 1                                                                                                     |
| **Confidence** | 5                                                                                                     |
| **Risk**       | 1                                                                                                     |
| **Priority**   | P0                                                                                                    |
| **Files**      | lib/brand.ts                                                                                          |
| **Change**     | Add `if (process.env.NODE_ENV === 'production' && result.includes('localhost')) throw new Error(...)` |
| **Acceptance** | Build fails if localhost URL used in production                                                       |
| **Test**       | Unit test for getDefaultSiteUrl() in production mode                                                  |

---

## B) Short-term Growth (1-2 weeks)

### B1. Add Pay-per-Export Option

| Field          | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **Task**       | Implement per-document purchase (e.g., 5,000 تومان per clean PDF export)            |
| **Why**        | Fastest path to first revenue — users willing to pay per document but not subscribe |
| **Impact**     | 5                                                                                   |
| **Effort**     | 3                                                                                   |
| **Confidence** | 4                                                                                   |
| **Risk**       | 2                                                                                   |
| **Priority**   | P1                                                                                  |
| **Files**      | lib/payments/, app/api/checkout/, components/features/pricing/                      |
| **Acceptance** | User can purchase single clean export without subscription                          |
| **Test**       | E2E test for checkout flow                                                          |

### B2. Create Standalone ZWNJ Tool Page

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| **Task**       | Create dedicated /zwnj-correction landing page                              |
| **Why**        | "اصلاح نیم فاصله" is high-volume search keyword — funnels to Writing Studio |
| **Impact**     | 4                                                                           |
| **Effort**     | 2                                                                           |
| **Confidence** | 4                                                                           |
| **Risk**       | 1                                                                           |
| **Priority**   | P1                                                                          |
| **Files**      | app/zwnj-correction/page.tsx, lib/navigation.ts                             |
| **Acceptance** | Page ranks for "نیم فاصله آنلاین" within 3 months                           |
| **Test**       | SEO audit shows proper canonical, OG, JSON-LD                               |

### B3. Add Invoice Themes (5+)

| Field          | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| **Task**       | Add visual themes to invoice maker (Classic, Modern, Minimal, etc.)     |
| **Why**        | Competitor FactorArsa has 9 themes — users expect visual variety        |
| **Impact**     | 4                                                                       |
| **Effort**     | 3                                                                       |
| **Confidence** | 4                                                                       |
| **Risk**       | 1                                                                       |
| **Priority**   | P1                                                                      |
| **Files**      | lib/business-documents/themes/, components/features/business-documents/ |
| **Acceptance** | 5+ themes available, each produces distinct PDF output                  |
| **Test**       | Unit tests for each theme                                               |

### B4. Add Auto-Incrementing Invoice Numbers

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Task**       | Auto-number invoices sequentially                                 |
| **Why**        | Competitor NegarNo has this — expected feature for business users |
| **Impact**     | 3                                                                 |
| **Effort**     | 2                                                                 |
| **Confidence** | 4                                                                 |
| **Risk**       | 1                                                                 |
| **Priority**   | P1                                                                |
| **Files**      | lib/business-documents/draft-storage.ts                           |
| **Acceptance** | Invoice numbers auto-increment per user session                   |
| **Test**       | Unit test for number sequence                                     |

### B5. Clean Up Dead Routes

| Field          | Value                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| **Task**       | Remove or noindex low-value routes from sitemap                                                              |
| **Why**        | Routes like /asdev, /brand, /case-studies, /compatibility, /services, /deployment-roadmap waste crawl budget |
| **Impact**     | 3                                                                                                            |
| **Effort**     | 1                                                                                                            |
| **Confidence** | 4                                                                                                            |
| **Risk**       | 1                                                                                                            |
| **Priority**   | P1                                                                                                           |
| **Files**      | app/sitemap.ts, app/asdev/, app/brand/, etc.                                                                 |
| **Acceptance** | Sitemap only contains high-value pages                                                                       |
| **Test**       | Sitemap entry count reduced by 10+                                                                           |

---

## C) Product Depth (2-4 weeks)

### C1. Add AI Text Improvement to Resume Builder

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Task**       | AI-powered bullet point improvement, summary generation           |
| **Why**        | Competitors CVBuilder and CVResume have AI — table stakes in 2026 |
| **Impact**     | 5                                                                 |
| **Effort**     | 4                                                                 |
| **Confidence** | 4                                                                 |
| **Risk**       | 3                                                                 |
| **Priority**   | P2                                                                |
| **Files**      | lib/career-documents/ai.ts, components/features/career-documents/ |
| **Acceptance** | User can improve resume bullets with AI                           |
| **Test**       | Unit test for AI improvement function                             |

### C2. Add ATS Compatibility Badge

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| **Task**       | Market resume builder as ATS-compatible                  |
| **Why**        | NoBsResume's key differentiator — users care about ATS   |
| **Impact**     | 4                                                        |
| **Effort**     | 2                                                        |
| **Confidence** | 4                                                        |
| **Risk**       | 1                                                        |
| **Priority**   | P2                                                       |
| **Files**      | components/features/career-documents/, app/career-tools/ |
| **Acceptance** | "ATS-compatible" badge visible on resume builder         |
| **Test**       | E2E test for badge visibility                            |

### C3. Add Cover Letter Builder

| Field          | Value                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| **Task**       | Build cover letter creation tool alongside resume                           |
| **Why**        | CVResume and CVBuilder offer this — natural companion                       |
| **Impact**     | 4                                                                           |
| **Effort**     | 3                                                                           |
| **Confidence** | 4                                                                           |
| **Risk**       | 2                                                                           |
| **Priority**   | P2                                                                          |
| **Files**      | lib/career-documents/cover-letter.ts, components/features/career-documents/ |
| **Acceptance** | User can create cover letter from resume data                               |
| **Test**       | Unit + E2E tests                                                            |

### C4. Add Resume Template Variety (10+)

| Field          | Value                                                 |
| -------------- | ----------------------------------------------------- |
| **Task**       | Create 10+ resume templates with different layouts    |
| **Why**        | Competitors offer 30+ templates — users expect choice |
| **Impact**     | 4                                                     |
| **Effort**     | 4                                                     |
| **Confidence** | 4                                                     |
| **Risk**       | 2                                                     |
| **Priority**   | P2                                                    |
| **Files**      | lib/career-documents/templates/                       |
| **Acceptance** | 10+ templates available                               |
| **Test**       | Unit test for each template                           |

---

## D) Monetization (2-6 weeks)

### D1. Implement Server-Side Premium Enforcement

| Field          | Value                                               |
| -------------- | --------------------------------------------------- |
| **Task**       | Add server-side verification for premium features   |
| **Why**        | Current premium gates are UI-only — can be bypassed |
| **Impact**     | 5                                                   |
| **Effort**     | 4                                                   |
| **Confidence** | 4                                                   |
| **Risk**       | 2                                                   |
| **Priority**   | P2                                                  |
| **Files**      | lib/features/availability.ts, app/api/              |
| **Acceptance** | Premium features require valid subscription         |
| **Test**       | Unit test for entitlement check                     |

### D2. Add Per-Document Purchase Option

| Field          | Value                                           |
| -------------- | ----------------------------------------------- |
| **Task**       | Allow one-time purchase for clean export        |
| **Why**        | Lower barrier to monetization than subscription |
| **Impact**     | 5                                               |
| **Effort**     | 3                                               |
| **Confidence** | 5                                               |
| **Risk**       | 2                                               |
| **Priority**   | P2                                              |
| **Files**      | lib/payments/, app/api/checkout/                |
| **Acceptance** | User can buy single export                      |
| **Test**       | E2E checkout test                               |

### D3. Add Invoice Signing Feature

| Field          | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Task**       | Online signature drawing for invoices                   |
| **Why**        | FactorArsa has this — adds professionalism              |
| **Impact**     | 3                                                       |
| **Effort**     | 3                                                       |
| **Confidence** | 4                                                       |
| **Risk**       | 1                                                       |
| **Priority**   | P2                                                      |
| **Files**      | components/features/business-documents/SignaturePad.tsx |
| **Acceptance** | User can draw and embed signature                       |
| **Test**       | Unit test for signature rendering                       |

---

## E) SEO/Content Growth (1-3 months)

### E1. Publish 50+ SEO Articles

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| **Task**       | Create 50+ blog articles targeting Persian long-tail keywords       |
| **Why**        | Competitor Karboom proves content drives 50K-334K views per article |
| **Impact**     | 5                                                                   |
| **Effort**     | 4                                                                   |
| **Confidence** | 4                                                                   |
| **Risk**       | 1                                                                   |
| **Priority**   | P3                                                                  |
| **Files**      | content/blog/                                                       |
| **Acceptance** | 50+ articles published, targeting 100+ keywords                     |
| **Test**       | Google Search Console shows impressions                             |

### E2. Create Persian PDF Tools Landing Page

| Field          | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| **Task**       | Dedicated landing page for "ابزار PDF فارسی"                  |
| **Why**        | No Persian competitor in this space — massive SEO opportunity |
| **Impact**     | 5                                                             |
| **Effort**     | 2                                                             |
| **Confidence** | 5                                                             |
| **Risk**       | 1                                                             |
| **Priority**   | P3                                                            |
| **Files**      | app/pdf-tools/page.tsx (enhance existing)                     |
| **Acceptance** | Ranks #1 for "ابزار PDF فارسی" within 6 months                |
| **Test**       | SEO audit shows proper schema                                 |

### E3. Add FAQ to All Tool Pages

| Field          | Value                               |
| -------------- | ----------------------------------- |
| **Task**       | Add FAQ schema to every tool page   |
| **Why**        | Rich results increase CTR by 20-30% |
| **Impact**     | 3                                   |
| **Effort**     | 2                                   |
| **Confidence** | 4                                   |
| **Risk**       | 1                                   |
| **Priority**   | P3                                  |
| **Files**      | app/(tools)/\*/page.tsx             |
| **Acceptance** | All tool pages have FAQPage schema  |
| **Test**       | Google Rich Results Test passes     |

### E4. Internal Linking Audit

| Field          | Value                                            |
| -------------- | ------------------------------------------------ |
| **Task**       | Audit and improve internal linking between pages |
| **Why**        | Better crawl depth = better indexing             |
| **Impact**     | 3                                                |
| **Effort**     | 2                                                |
| **Confidence** | 4                                                |
| **Risk**       | 1                                                |
| **Priority**   | P3                                               |
| **Files**      | Multiple page files                              |
| **Acceptance** | Every page links to 3+ related pages             |
| **Test**       | Link checker passes                              |

---

## F) Technical Scale (Ongoing)

### F1. Extract Mobile Menu Component

| Field          | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **Task**       | Extract mobile menu from Navigation.tsx into separate component |
| **Why**        | 587-line single file is hard to maintain                        |
| **Impact**     | 3                                                               |
| **Effort**     | 2                                                               |
| **Confidence** | 4                                                               |
| **Risk**       | 1                                                               |
| **Priority**   | P3                                                              |
| **Files**      | components/ui/Navigation.tsx, components/ui/MobileMenu.tsx      |
| **Acceptance** | Navigation.tsx under 300 lines                                  |

### F2. Split PersianWritingStudio Monolith

| Field          | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Task**       | Split 13KB PersianWritingStudio into smaller components |
| **Why**        | Single file is hard to maintain and test                |
| **Impact**     | 2                                                       |
| **Effort**     | 2                                                       |
| **Confidence** | 4                                                       |
| **Risk**       | 1                                                       |
| **Priority**   | P3                                                      |
| **Files**      | components/features/persian-writing/                    |
| **Acceptance** | No single file over 5KB                                 |

### F3. Add Production-Mode URL Assertion

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| **Task**       | Add runtime assertion to prevent localhost in production |
| **Why**        | Defense in depth against future SEO bugs                 |
| **Impact**     | 4                                                        |
| **Effort**     | 1                                                        |
| **Confidence** | 5                                                        |
| **Risk**       | 1                                                        |
| **Priority**   | P3                                                       |
| **Files**      | lib/brand.ts                                             |
| **Acceptance** | Build fails if localhost used in production              |

---

## Expected Growth Metrics

| Metric                  | Current            | 30 days | 90 days | 6 months |
| ----------------------- | ------------------ | ------- | ------- | -------- |
| Indexed pages           | ~0 (localhost bug) | 373     | 500+    | 800+     |
| Monthly organic traffic | Unknown            | 1,000   | 10,000  | 50,000   |
| Revenue                 | $0                 | $100    | $1,000  | $5,000   |
| Tool usage              | Unknown            | +20%    | +100%   | +300%    |
| Premium subscribers     | Unknown            | 10      | 100     | 500      |

---

## What NOT to Build Yet

1. Job board integration — Don't compete with Karboom/JobVision
2. Payment gateway integration — Focus on simpler pay-per-export
3. Multi-language resume — Focus on FA/EN first
4. AI content generation — Too expensive; focus on AI text improvement
5. Enterprise/team features — Market too small for B2B
6. Mobile app — PWA is sufficient
7. Database-heavy features — Keep local-first advantage
8. Custom domain email — Not a growth driver
9. Affiliate program — Premature before content marketing
10. White-label API — Premature before core products polished
