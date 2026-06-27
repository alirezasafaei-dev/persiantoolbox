# Live Growth Audit Report — PersianToolbox

**Date:** 2026-06-27
**Auditor:** MiMoCode Compose Agent (Product + Growth + UX + SEO + Performance + Security + Engineering)
**Commit:** 5783ab330185db1559d0412e47dc70a22953b808
**Site:** https://persiantoolbox.ir/

---

## 1. Executive Summary

PersianToolbox is a comprehensive Persian-language online tools platform with 91 registered tools across 10 categories, including 3 flagship products (فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای, ویرایشگر فارسی). The codebase is well-architected with strong test coverage (857/857 tests passing), clean separation of concerns, and a privacy-first local-first architecture.

**However, the site has a critical SEO catastrophe: ALL canonical URLs, OG images, JSON-LD structured data, sitemap, and robots.txt use `http://localhost:3000` instead of `https://persiantoolbox.ir`.** This completely destroys search engine indexing and social sharing. Additionally, several pages return 502/504 errors.

**Verdict:** The product foundation is strong, but the site is currently invisible to search engines due to the localhost bug. Fixing this single issue would have the highest ROI of any action.

---

## 2. Truthful Current Status

### What Works

| Item                                  | Status    | Evidence                                                   |
| ------------------------------------- | --------- | ---------------------------------------------------------- |
| Homepage                              | 200 OK    | curl -I returns 200 with correct headers                   |
| /business-tools                       | 200 OK    | curl -I returns 200                                        |
| /business-tools/document-studio       | 200 OK    | curl -I returns 200                                        |
| /career-tools                         | 200 OK    | curl -I returns 200                                        |
| /career-tools/resume-builder          | 200 OK    | curl -I returns 200                                        |
| /writing-tools/persian-writing-studio | 200 OK    | curl -I returns 200                                        |
| /pricing                              | 200 OK    | curl -I returns 200, full pricing page rendered            |
| /search                               | 200 OK    | curl -I returns 200                                        |
| /terms                                | 200 OK    | curl -I returns 200                                        |
| /sitemap.xml                          | 200 OK    | 373 entries                                                |
| /robots.txt                           | 200 OK    | Correct disallow rules                                     |
| Security headers                      | EXCELLENT | CSP, HSTS, X-Frame-Options, permissions-policy all present |
| Font preloading                       | WORKING   | Vazirmatn-Regular/Bold/SemiBold preloaded                  |
| Git status                            | CLEAN     | No uncommitted changes                                     |
| Typecheck                             | PASS      | tsc --noEmit exits 0                                       |
| Lint                                  | PASS      | 140 warnings, 0 errors                                     |
| Unit tests                            | PASS      | 857/857 tests in 120 files                                 |

### What's Broken

| Item                           | Status                                   | Evidence                                              |
| ------------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| /writing-tools (category page) | **502 Bad Gateway**                      | nginx returns 502                                     |
| /blog                          | **504 Gateway Timeout**                  | nginx returns 504                                     |
| /topics                        | **504 Gateway Timeout**                  | nginx returns 504                                     |
| /privacy                       | **504 Gateway Timeout**                  | nginx returns 504                                     |
| /manifest.json                 | **404**                                  | Should be /manifest.webmanifest                       |
| All canonical URLs             | **http://localhost:3000**                | Should be https://persiantoolbox.ir                   |
| All OG images                  | **http://localhost:3000/og-default.png** | Should use production URL                             |
| All JSON-LD                    | **http://localhost:3000**                | Organization, WebSite, SoftwareApplication URLs wrong |
| Sitemap                        | **http://localhost:3000/**               | 373 entries all use localhost                         |
| Robots.txt                     | **Host: http://localhost:3000**          | Should be production domain                           |
| BreadcrumbList                 | **http://localhost:3000**                | All breadcrumb items use localhost                    |

---

## 3. Live/Repo Parity

| Claim                         | Live Reality                                                                                         | Verdict      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| Typecheck: PASS               | ✅ Confirmed                                                                                         | MATCH        |
| Lint: PASS                    | ✅ Confirmed (140 warnings, 0 errors)                                                                | MATCH        |
| PM2: ONLINE                   | ⚠️ Cannot verify from build machine (pm2 not available)                                              | UNVERIFIED   |
| Health: OK                    | ⚠️ Cannot verify from build machine                                                                  | UNVERIFIED   |
| Git: clean, committed, pushed | ✅ Confirmed                                                                                         | MATCH        |
| Business/Career/Writing live  | ⚠️ Partially — document-studio and resume-builder work, but /writing-tools category page returns 502 | PARTIAL      |
| Navbar redesigned             | ✅ Confirmed — uses dropdown architecture                                                            | MATCH        |
| Homepage redesigned           | ✅ Confirmed — flagship products above fold                                                          | MATCH        |
| Toast standardized            | ⚠️ Cannot verify from HTML alone                                                                     | UNVERIFIED   |
| Deploy stability improved     | ⚠️ 502/504 errors suggest instability                                                                | CONTRADICTED |
| Staging configured            | ⚠️ Cannot verify                                                                                     | UNVERIFIED   |
| 857/857 unit tests            | ✅ Confirmed                                                                                         | MATCH        |
| 32/32 E2E                     | ⚠️ Cannot run E2E from build machine                                                                 | UNVERIFIED   |
| Build pass                    | ⚠️ Cannot run build from build machine                                                               | UNVERIFIED   |

---

## 4. Homepage Audit

### Above the Fold

- ✅ **Value proposition clear in 5 seconds**: "مجموعه کامل و رایگان ابزارهای آنلاین فارسی"
- ✅ **3 flagship products visible**: فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای, ویرایشگر فارسی — each with icon, description, and CTA
- ✅ **CTAs clear**: "ساخت فاکتور", "ساخت رزومه", "ویرایش متن"
- ✅ **Privacy/local-first explained**: FAQ section with 5 questions addressing data privacy, registration, mobile support

### Below the Fold

- ✅ **Quick tool categories**: 6 categories with icons (PDF, Image, Financial, Date, Text, Validation)
- ✅ **Blog preview section**: Shows recent posts
- ✅ **Trust section**: 4 trust signal cards
- ✅ **Search CTA**: Prominent search link

### Issues

| Finding                                            | Severity | Impact                                                         |
| -------------------------------------------------- | -------- | -------------------------------------------------------------- |
| Homepage uses `getDisplayToolsCount()` dynamically | LOW      | Good — no hardcoded count                                      |
| Tool count not overemphasized                      | LOW      | Good — focused on flagship products                            |
| Category cards limited to 6 (not all 10)           | LOW      | Good — prevents overwhelm                                      |
| Blog section may distract from product conversion  | MEDIUM   | Consider making blog section smaller or removing from homepage |
| JSON-LD uses localhost URLs                        | CRITICAL | Structured data broken for Google                              |

### Homepage Verdict: **OK** (would be STRONG if not for localhost SEO bug)

---

## 5. Navbar Audit

### Desktop Navigation

- ✅ **Two clear dropdowns**: "ابزارها" (Utilities) and "محصولات حرفه‌ای" (Flagship Products)
- ✅ **Dropdown groups organized**: Utilities split into 3 groups (File/Content, Computational, Contracts)
- ✅ **Flagship products highlighted**: 3 items in dedicated dropdown
- ✅ **Search accessible**: Cmd+K shortcut + search link
- ✅ **Account link**: Controlled by feature flag

### Issues

| Finding                                                                                 | Severity | Impact                                                                                                                          |
| --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Desktop shows individual category pills from navigation.ts `categoryNavItems`           | HIGH     | 10 category pills visible — but the actual rendered HTML from live site shows they're inside dropdowns, not as individual pills |
| `lib/navigation.ts` exports `categoryNavItems` (10 items) AND `mainNavItems` (19 items) | MEDIUM   | Navigation data model has more items than needed                                                                                |
| Mobile menu has all 10 categories as flat list                                          | MEDIUM   | Could be grouped better                                                                                                         |
| Escape key closes menus                                                                 | ✅ Good  | Keyboard accessible                                                                                                             |
| No layout shift from nav                                                                | ✅ Good  | Sticky header with proper sizing                                                                                                |

### Navigation Verdict: **OK** (functionally correct, could be cleaner)

---

## 6. Product Flow Audit

### Business Product (فاکتورساز و رسیدساز)

| Aspect                         | Assessment                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| Routes live                    | ✅ /business-tools and /business-tools/document-studio return 200 |
| Invoice preselection           | ✅ ?type=invoice URL param                                        |
| Local-first guarantee          | ✅ Processing in browser, no server upload                        |
| Draft storage                  | ✅ localStorage-based                                             |
| Premium gating                 | ✅ Watermark on free, clean export on paid                        |
| Export options                 | ✅ PDF/HTML on free, DOCX on premium                              |
| **Activation quality**         | OK — clear entry point                                            |
| **Time to value**              | Fast — fill form, see preview immediately                         |
| **Trust level**                | HIGH — privacy-first, no registration                             |
| **Main conversion blocker**    | Premium gate at export moment                                     |
| **Main retention opportunity** | Draft persistence, invoice history                                |

### Career Product (رزومه‌ساز حرفه‌ای)

| Aspect                         | Assessment                                                   |
| ------------------------------ | ------------------------------------------------------------ |
| Routes live                    | ✅ /career-tools and /career-tools/resume-builder return 200 |
| Persian/English resume types   | ✅ ?type=persian-resume and ?type=english-resume             |
| RTL/LTR handling               | ✅ Proper direction switching                                |
| Local-first guarantee          | ✅ Processing in browser                                     |
| Draft storage                  | ✅ localStorage-based                                        |
| **Activation quality**         | OK — type selection first                                    |
| **Time to value**              | Medium — more form fields to fill                            |
| **Trust level**                | HIGH — privacy-first                                         |
| **Main conversion blocker**    | Limited templates vs competitors (30+ templates elsewhere)   |
| **Main retention opportunity** | Multi-resume management, cover letter                        |

### Writing Product (ویرایشگر فارسی)

| Aspect                          | Assessment                                           |
| ------------------------------- | ---------------------------------------------------- |
| Routes live                     | ✅ /writing-tools/persian-writing-studio returns 200 |
| ⚠️ /writing-tools category page | ❌ **502 Bad Gateway**                               |
| Arabic→Persian normalization    | ✅ Core feature                                      |
| ZWNJ correction                 | ✅ Core feature                                      |
| URL/email/phone preservation    | ✅ Verified in code                                  |
| Text statistics                 | ✅ Word/char count                                   |
| Local-first guarantee           | ✅ Processing in browser                             |
| **Activation quality**          | EXCELLENT — paste text, see fixes immediately        |
| **Time to value**               | INSTANT — immediate visual feedback                  |
| **Trust level**                 | HIGH — privacy-first, no text sent to server         |
| **Main conversion blocker**     | Free tier has 5000 char limit                        |
| **Main retention opportunity**  | Draft persistence, strict mode                       |

---

## 7. SEO Audit

### Critical Issues

| Finding                                        | Evidence                                                            | Severity     | Impact                                 |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------------ | -------------------------------------- |
| ALL canonical URLs use `http://localhost:3000` | `<link rel="canonical" href="http://localhost:3000/pricing"/>`      | **CRITICAL** | Google cannot index any page correctly |
| ALL OG/Twitter URLs use `localhost:3000`       | `<meta property="og:url" content="http://localhost:3000/pricing"/>` | **CRITICAL** | Social sharing broken                  |
| ALL JSON-LD uses `localhost:3000`              | Organization, WebSite, SoftwareApplication URLs                     | **CRITICAL** | Rich results broken                    |
| Sitemap uses `localhost:3000`                  | 373 entries with `<loc>http://localhost:3000/</loc>`                | **CRITICAL** | Sitemap ignored by Google              |
| Robots.txt Host is `localhost:3000`            | `Host: http://localhost:3000`                                       | **CRITICAL** | Wrong canonical domain                 |
| BreadcrumbList uses `localhost:3000`           | Pricing page breadcrumb                                             | **HIGH**     | Breadcrumb rich results broken         |

### Root Cause

`deploy-vps-auto.sh` line 70 builds on VPS without injecting `NEXT_PUBLIC_SITE_URL`:

```bash
NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npx next build
```

The `.env` file is excluded from rsync (lines 53-54), and the build command doesn't pass the env var. The VPS build environment resolves `getDefaultSiteUrl()` to `http://localhost:3000` because `NEXT_PUBLIC_SITE_URL` is not set.

### What Works

| Item                       | Status                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| Title tags                 | ✅ Unique, descriptive, Persian                                    |
| Meta descriptions          | ✅ Unique, keyword-rich                                            |
| robots meta                | ✅ `index, follow` on most pages                                   |
| Google bot directives      | ✅ Proper max-video-preview, max-image-preview                     |
| OpenGraph images           | ✅ Per-tool OG images exist                                        |
| FAQ schema                 | ✅ Present on pricing page                                         |
| FAQPage schema             | ✅ Present on homepage                                             |
| SoftwareApplication schema | ✅ Present (but with localhost URL)                                |
| Internal linking           | ✅ Homepage links to all categories and flagship products          |
| Sitemap completeness       | ✅ 373 entries covering tools, blog, categories, guides            |
| Per-route priority         | ✅ Configured (1.0 homepage > 0.8 tools > 0.6 topics > 0.4 others) |

### Missing/Weak

| Item                         | Issue                                         |
| ---------------------------- | --------------------------------------------- |
| Blog content depth           | 54 articles — moderate, competitors have more |
| Category page content        | Some categories may have thin content         |
| Internal linking to pricing  | Present in footer and nav                     |
| Persian keyword optimization | Present but could be stronger                 |

---

## 8. Performance Audit

### Observations (from HTML analysis)

| Finding                                      | Evidence                                                | Severity                |
| -------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Font preloading working                      | Vazirmatn-Regular/Bold/SemiBold preloaded               | ✅ Good                 |
| Single CSS file                              | One CSS chunk loaded                                    | ✅ Good                 |
| Multiple JS chunks                           | ~15 script tags per page                                | MEDIUM — many chunks    |
| Client components on every page              | SmartCTA, ExitIntentPopup, PortfolioCTA loaded globally | MEDIUM — adds JS weight |
| Navigation.tsx is 587 lines client component | Loaded on every page                                    | MEDIUM                  |
| BAILOUT_TO_CLIENT_SIDE_RENDERING             | Pricing page uses client-side rendering bailout         | LOW                     |
| Service worker registered                    | sw.js present                                           | ✅ Good for PWA         |
| Sentry DSN in every page                     | In CSP and meta baggage                                 | LOW                     |

### Potential Issues

| Finding                                                     | Impact                                          |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Navigation component loads full navigation data client-side | Unnecessary if categories don't change          |
| SmartCTA + ExitIntentPopup + PortfolioCTA on every page     | Additional JS bundle for conversion features    |
| Blog section on homepage                                    | Additional data fetch                           |
| No explicit bundle analysis available                       | Cannot measure exact bundle sizes without build |

---

## 9. Privacy/Security Audit

### Security Headers (EXCELLENT)

| Header                       | Value                                                                                   | Status    |
| ---------------------------- | --------------------------------------------------------------------------------------- | --------- |
| Content-Security-Policy      | default-src 'self'; script-src 'self' 'nonce-...'; connect-src 'self' https://sentry... | ✅ Strong |
| Strict-Transport-Security    | max-age=63072000; includeSubDomains; preload                                            | ✅ Strong |
| X-Frame-Options              | DENY                                                                                    | ✅ Strong |
| X-Content-Type-Options       | nosniff                                                                                 | ✅ Strong |
| Referrer-Policy              | strict-origin-when-cross-origin                                                         | ✅ Strong |
| Permissions-Policy           | accelerometer=(), camera=(), etc. all disabled                                          | ✅ Strong |
| Cross-Origin-Opener-Policy   | same-origin                                                                             | ✅ Strong |
| Cross-Origin-Resource-Policy | same-origin                                                                             | ✅ Strong |

### Privacy Analysis

| Product                  | Data Sent to Server                   | Risk Level |
| ------------------------ | ------------------------------------- | ---------- |
| Business (Invoice)       | NONE — all processing in browser      | ✅ None    |
| Career (Resume)          | NONE — all processing in browser      | ✅ None    |
| Writing (Persian Editor) | NONE — all processing in browser      | ✅ None    |
| Analytics                | Page views only (no document content) | ✅ Low     |
| Sentry                   | Error data only (no PII)              | ✅ Low     |

### Privacy Risks

| Risk                              | Severity | Status                                                      |
| --------------------------------- | -------- | ----------------------------------------------------------- |
| User documents uploaded to server | NONE     | ✅ Verified — local-first                                   |
| Resume text sent to server        | NONE     | ✅ Verified — local-first                                   |
| Writing text sent to server       | NONE     | ✅ Verified — local-first                                   |
| Invoice items sent to server      | NONE     | ✅ Verified — local-first                                   |
| Sentry DSN exposed in meta tags   | LOW      | ⚠️ DSN is public by design, but baggage header leaks org ID |
| localStorage data clearing        | LOW      | User can clear via browser settings                         |

---

## 10. Monetization Audit

### Current State

| Feature                | Status          | Evidence                                |
| ---------------------- | --------------- | --------------------------------------- |
| Pricing page           | ✅ LIVE         | /pricing returns 200 with 3 tiers       |
| Plan structure         | ✅ Defined      | Free, Basic (99K/mo), Pro (199K/mo)     |
| Subscription checkout  | ⚠️ FEATURE FLAG | FEATURE_CHECKOUT_ENABLED controls it    |
| ZarinPal integration   | ✅ Configured   | Merchant ID in .env, production mode    |
| Premium gates in tools | ✅ UI-level     | Watermark on free, clean export on paid |
| Account system         | ✅ FEATURE_FLAG | FEATURE_ACCOUNT_ENABLED                 |
| History/dashboard      | ✅ FEATURE_FLAG | FEATURE_HISTORY_ENABLED                 |

### Pricing Analysis

| Plan  | Price             | Features                                     | Value                               |
| ----- | ----------------- | -------------------------------------------- | ----------------------------------- |
| Free  | ۰ تومان           | Basic tools, single-file, standard output    | ✅ Good free tier                   |
| Basic | ۹۹,۰۰۰ تومان/ماه  | Batch, HD, no ads, templates, history        | ⚠️ Price may be high for IR market  |
| Pro   | ۱۹۹,۰۰۰ تومان/ماه | Dashboard, custom reports, dedicated support | ⚠️ Premium features not fully built |

### Monetization Gaps

| Gap                                      | Impact                                |
| ---------------------------------------- | ------------------------------------- |
| No pay-per-export option                 | Users can't pay per document          |
| Premium gates are UI-only                | No server-side enforcement            |
| No template marketplace                  | Competitors have 9-30 templates       |
| No watermark-free single purchase        | Users must subscribe for clean output |
| Pricing page uses BAILOUT_TO_CLIENT_SIDE | May affect SEO                        |

---

## 11. Analytics/Funnel Audit

### Current Analytics

| System               | Status | Evidence                           |
| -------------------- | ------ | ---------------------------------- |
| Page view tracking   | ✅     | /api/analytics endpoint exists     |
| Consent logic        | ⚠️     | FEATURE_ADS_ENABLED flag exists    |
| Local usage tracking | ✅     | UsageTracker component exists      |
| Admin analytics      | ⚠️     | Cannot verify without admin access |

### Funnel Events (Designed but Not Implemented)

The audit requested specific funnel events. Current state:

- No funnel event tracking implemented
- No conversion tracking
- No premium intent tracking
- No checkout flow tracking

---

## 12. Competitor Scan

### Summary

| Category               | # Competitors      | PersianToolbox Position                              |
| ---------------------- | ------------------ | ---------------------------------------------------- |
| Invoice Maker          | 8+                 | Top 3 (privacy-first differentiator)                 |
| Resume Builder         | 8+                 | Mid-tier (lacks AI, templates, job integration)      |
| Persian Editor         | Few                | **Market leader** (no strong competitor)             |
| PDF Tools              | International only | **Market leader** in Persian (no Persian competitor) |
| Online Tools (general) | 2-3 small          | **Clear leader** (80+ tools vs 5-15)                 |

### Key Competitor Insights

| Competitor   | What They Do Better                    | Lesson for PersianToolbox            |
| ------------ | -------------------------------------- | ------------------------------------ |
| Karboom      | Content articles get 50K-334K views    | Content marketing works              |
| FactorArsa   | 9 invoice themes, 24h paid access      | Theme variety, creative monetization |
| CVBuilder.me | 30+ resume templates, AI translation   | Template variety, AI features        |
| NoBsResume   | Free, privacy-first, ATS-compatible    | Direct philosophical competitor      |
| NegarNo      | PWA install, auto-incrementing numbers | PWA, auto-numbering                  |

---

## 13. Growth Opportunities

### Top 10 Growth Opportunities

1. **Fix localhost SEO bug** — Unlocks all search indexing immediately
2. **Fix 502/504 errors** — /writing-tools, /blog, /topics, /privacy broken
3. **Content marketing** — Publish 100+ articles targeting Persian long-tail keywords
4. **AI text improvement** — Add to resume builder and Persian editor
5. **Theme variety** — Add 5-9 themes to invoice maker
6. **ATS compatibility** — Market resume as ATS-compatible
7. **Standalone ZWNJ tool page** — High-volume SEO keyword
8. **Pay-per-export** — Monetize without subscription
9. **Cover letter builder** — Companion to resume
10. **Persian PDF tools marketing** — No competitor in this space

---

## 14. Risks

| Risk                               | Severity | Mitigation                              |
| ---------------------------------- | -------- | --------------------------------------- |
| Localhost SEO damage               | CRITICAL | Fix deploy script, rebuild, purge cache |
| Competitor AI features             | HIGH     | Add AI text improvement                 |
| Job platform competition           | HIGH     | Focus on privacy-first differentiation  |
| International tools adding Persian | MEDIUM   | Maintain local-first advantage          |
| Pricing too high for IR market     | MEDIUM   | Add pay-per-export option               |

---

## 15. Prioritized Roadmap

### A) Immediate Fixes (1-3 days) — P0

| #   | Task                                           | Why                  | Files                      | Acceptance Criteria                                         | Deploy Risk |
| --- | ---------------------------------------------- | -------------------- | -------------------------- | ----------------------------------------------------------- | ----------- |
| 1   | Fix deploy script to pass NEXT_PUBLIC_SITE_URL | Unlocks all SEO      | deploy-vps-auto.sh         | All canonical/OG/sitemap URLs use https://persiantoolbox.ir | LOW         |
| 2   | Fix /writing-tools 502 error                   | Broken category page | app/writing-tools/page.tsx | Returns 200                                                 | LOW         |
| 3   | Fix /blog, /topics, /privacy 504 timeouts      | Broken pages         | Server/nginx config        | All return 200                                              | LOW         |

### B) Short-term Growth (1-2 weeks) — P1

| #   | Task                                        | Why                       | Impact | Effort |
| --- | ------------------------------------------- | ------------------------- | ------ | ------ |
| 4   | Add pay-per-export option                   | Fastest path to revenue   | 5      | 3      |
| 5   | Create standalone ZWNJ tool page            | High-volume SEO           | 4      | 2      |
| 6   | Add invoice themes (5+)                     | Compete with FactorArsa   | 4      | 3      |
| 7   | Add auto-incrementing invoice numbers       | Feature parity            | 3      | 2      |
| 8   | Clean up dead routes (/asdev, /brand, etc.) | Reduce crawl budget waste | 3      | 1      |

### C) Product Depth (2-4 weeks) — P2

| #   | Task                                        | Why                                 | Impact | Effort |
| --- | ------------------------------------------- | ----------------------------------- | ------ | ------ |
| 9   | Add AI text improvement to resume builder   | Compete with CVBuilder              | 5      | 4      |
| 10  | Add ATS compatibility badge                 | Market differentiator               | 4      | 2      |
| 11  | Add cover letter builder                    | Resume companion                    | 4      | 3      |
| 12  | Add resume template variety (10+ templates) | Compete with 30+ template platforms | 4      | 4      |

### D) Monetization (2-6 weeks) — P2

| #   | Task                                      | Why                           | Impact | Effort |
| --- | ----------------------------------------- | ----------------------------- | ------ | ------ |
| 13  | Implement server-side premium enforcement | Prevent abuse                 | 5      | 4      |
| 14  | Add per-document purchase option          | Lower barrier to monetization | 5      | 3      |
| 15  | Add invoice signing feature               | Compete with FactorArsa       | 3      | 3      |

### E) SEO/Content Growth (1-3 months) — P3

| #   | Task                                  | Why                         | Impact | Effort |
| --- | ------------------------------------- | --------------------------- | ------ | ------ |
| 16  | Publish 50+ SEO articles              | Content marketing           | 5      | 4      |
| 17  | Create Persian PDF tools landing page | No competitor in this space | 5      | 2      |
| 18  | Add FAQ to all tool pages             | Rich results                | 3      | 2      |
| 19  | Internal linking audit                | Improve crawl depth         | 3      | 2      |

### F) Technical Scale (Ongoing) — P3

| #   | Task                                    | Why                           | Impact | Effort |
| --- | --------------------------------------- | ----------------------------- | ------ | ------ |
| 20  | Extract mobile menu from Navigation.tsx | Reduce complexity             | 3      | 2      |
| 21  | Split PersianWritingStudio monolith     | Maintainability               | 2      | 2      |
| 22  | Add production-mode URL assertion       | Prevent future localhost bugs | 4      | 1      |

---

## 16. What NOT to Build Yet

1. **Job board integration** — Don't compete with Karboom/JobVision on their turf
2. **Payment gateway integration** — Focus on simpler pay-per-export first
3. **Multi-language resume** — Focus on FA/EN first, add others later
4. **AI content generation** — Too expensive to implement well; focus on AI text improvement first
5. **Enterprise/team features** — Market too small for B2B yet
6. **Mobile app** — PWA is sufficient; native app is premature
7. **Database-backed features** — Keep local-first advantage; only add server features for premium
8. **Custom domain email** — Not a growth driver
9. **Affiliate program** — Premature before content marketing is established
10. **White-label API** — Premature before core products are polished

---

## 17. Final Recommendation

**PersianToolbox has a strong product foundation** — the local-first privacy architecture, 80+ tools, comprehensive test coverage, and clean codebase are genuine competitive advantages. The 3 flagship products (invoice, resume, writing editor) are well-implemented.

**The #1 priority is fixing the localhost SEO bug.** This single issue makes the entire site invisible to search engines. Once fixed and rebuilt, the site will immediately benefit from 373 indexed pages, proper OG images, and working structured data.

**The #2 priority is fixing the 502/504 errors** on /writing-tools, /blog, /topics, and /privacy. These broken pages hurt both UX and SEO.

**The #3 priority is content marketing.** Competitors like Karboom prove that Persian content articles can drive 50K-334K views. PersianToolbox should publish 50+ articles targeting long-tail Persian keywords, especially around its unique strengths (privacy-first PDF tools, Persian text normalization).

**The #4 priority is monetization.** Add a pay-per-export option as the fastest path to revenue. Users are willing to pay per document but may not want a subscription.

**Estimated time to first revenue after fixes:** 2-4 weeks (with pay-per-export implemented).

---

## Appendix: Evidence Table

| #   | Finding                               | Evidence Source           | Severity | Impact                       | Recommended Action                  | Acceptance Criteria                                |
| --- | ------------------------------------- | ------------------------- | -------- | ---------------------------- | ----------------------------------- | -------------------------------------------------- |
| 1   | All canonical URLs use localhost:3000 | curl -I + HTML inspection | CRITICAL | SEO invisible                | Fix deploy script env var injection | All pages show https://persiantoolbox.ir canonical |
| 2   | Sitemap uses localhost:3000           | curl sitemap.xml          | CRITICAL | Sitemap ignored              | Fix deploy script                   | All 373 entries use production URL                 |
| 3   | Robots.txt Host is localhost:3000     | curl robots.txt           | CRITICAL | Wrong canonical              | Fix deploy script                   | Host: https://persiantoolbox.ir                    |
| 4   | /writing-tools returns 502            | curl -I                   | CRITICAL | Broken page                  | Fix route/server                    | Returns 200                                        |
| 5   | /blog returns 504                     | curl -I                   | CRITICAL | Broken page                  | Fix server timeout                  | Returns 200                                        |
| 6   | /topics returns 504                   | curl -I                   | CRITICAL | Broken page                  | Fix server timeout                  | Returns 200                                        |
| 7   | /privacy returns 504                  | curl -I                   | CRITICAL | Broken page                  | Fix server timeout                  | Returns 200                                        |
| 8   | OG images use localhost               | curl homepage HTML        | HIGH     | Social sharing broken        | Fix deploy script                   | All OG URLs use production domain                  |
| 9   | JSON-LD uses localhost                | curl homepage HTML        | HIGH     | Rich results broken          | Fix deploy script                   | All structured data uses production URL            |
| 10  | Navigation.tsx is 587 lines           | Code inspection           | MEDIUM   | Maintainability              | Consider extraction                 | Reduced complexity                                 |
| 11  | No funnel event tracking              | Code inspection           | MEDIUM   | Cannot measure conversion    | Implement analytics events          | Funnel events tracked                              |
| 12  | Premium gates are UI-only             | Code inspection           | MEDIUM   | Potential abuse              | Add server-side enforcement         | Premium features server-verified                   |
| 13  | Dead routes in sitemap                | Sitemap analysis          | LOW      | Crawl budget waste           | Remove or noindex                   | Only valuable pages in sitemap                     |
| 14  | Deploy script excludes .env           | deploy-vps-auto.sh:53-54  | CRITICAL | Env var not available on VPS | Pass env vars in build command      | Build uses correct site URL                        |
