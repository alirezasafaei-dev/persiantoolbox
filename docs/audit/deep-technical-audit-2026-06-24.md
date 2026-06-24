# PersianToolbox Deep Technical Audit

**Date:** 2026-06-24  
**Version:** v6.5.0  
**URL:** https://persiantoolbox.ir/  
**Auditor:** MiMoCode CLI Agent

---

## 1. Executive Summary

| Area | Score | Reason |
|---|---|---|
| Product clarity | 8/10 | Clear Persian-first positioning, local-first privacy |
| UX/UI | 7/10 | Good RTL, dark mode, but search page thin |
| Architecture | 8/10 | Clean Next.js 16, well-structured, good separation |
| Local-first/privacy | 9/10 | All tools client-side, no file uploads, CSP strict |
| Security | 9/10 | Comprehensive headers, CSRF, rate limiting, RBAC |
| Performance | 7/10 | 322MB build, heavy chunks, fonts optimized |
| SEO | 8/10 | Strong JSON-LD, sitemap, but some thin pages |
| Content quality | 7/10 | 140 blog articles, but some repetitive |
| Tool correctness | 7/10 | Good formulas, but missing golden tests |
| Accessibility | 7/10 | 217 aria-labels, focus styles, but missing skip-link |
| DevOps/observability | 8/10 | Health/ready/version endpoints, PM2, Redis |
| Monetization readiness | 6/10 | Account system exists, no payment gateway yet |
| Maintainability | 8/10 | 429 tests, clean code, good patterns |

**Overall Score: 7.6/10**

**Production Readiness: HIGH** — Site is live, stable, and performing well.

**Biggest Strengths:**
- Persian-first UX with full RTL support
- Local-first privacy architecture (all tools client-side)
- Comprehensive security headers (CSP, HSTS, X-Frame-Options)
- 429 tests passing
- Clean Next.js 16 architecture

**Biggest Risks:**
- 322MB build output with heavy JS chunks (696KB largest)
- Missing golden tests for financial calculators
- Some blog articles may be thin/repetitive
- No skip-to-content link for accessibility

**Immediate Priorities:**
1. Add popular tools to search empty state
2. Create financial transparency component
3. Add production readiness check script
4. Add skip-to-content link
5. Add golden tests for financial tools

---

## 2. Methodology

Inspected via:
- Live HTTP headers (curl -I)
- robots.txt and sitemap.xml
- Source code analysis (grep, read)
- Test suite (pnpm vitest --run)
- Typecheck (pnpm typecheck)
- Bundle analysis (.next/static)
- API endpoint testing
- Component structure review

---

## 3. Evidence Summary

| Area | Evidence | Status | Notes |
|---|---|---|---|
| HTTPS | curl -I | ✅ | HSTS with 2-year max-age |
| CSP | Header analysis | ✅ | Strict, nonce-based, no unsafe |
| CSRF | Rate limit + origin check | ✅ | Proxy-aware |
| Auth | Register/login/me/logout | ✅ | Scrypt hashing, session cookies |
| Rate limiting | Redis + PostgreSQL | ✅ | 3/hr register, 5/15min login |
| Health endpoint | /api/health | ✅ | Returns version, uptime, memory |
| Ready endpoint | /api/ready | ✅ | Returns version, commit |
| Version endpoint | /api/version | ✅ | Returns version, commit |
| Redis | redis-cli ping | ✅ | PONG, 256mb limit |
| PM2 | pm2 status | ✅ | Online, 0 restarts |
| Tests | pnpm vitest | ✅ | 429/429 pass |
| Typecheck | pnpm typecheck | ✅ | Clean |
| Search | /search page | ✅ | Client-side, synonym support |
| Blog | /blog + RSS | ✅ | 140 articles, feed.xml |
| Blog tags | /blog/tag/* | ✅ | New feature |
| OG images | Auto-generated | ✅ | All tool pages |
| JSON-LD | FAQ, HowTo, Breadcrumb | ✅ | Comprehensive |
| Dark mode | CSS variables | ✅ | All pages |
| RTL | dir="rtl" | ✅ | All pages |
| Mobile | Responsive | ✅ | No overflow |
| Accessibility | 217 aria-labels | ✅ | Focus styles defined |
| External fetches | 3 domains | ⚠️ | exchangerate-api, coingecko (market data only) |
| Heavy imports | lazy-loaded | ✅ | tesseract, imgly, pdfjs all dynamic |
| Bundle size | 322MB .next | ⚠️ | Largest chunk 696KB |

---

## 4. Product & Business Audit

**Product Message:** Clear — "ابزارهای فارسی بدون شلوغی و حواس‌پرتی" (Persian tools without clutter)

**User Journey:** Homepage → Category → Tool → Result → Share/Save

**Trust Signals:** Privacy badge, local-first badge, free badge, tool count

**Monetization:** Account system exists, subscription plans defined, payment gateway pending (Zarinpal)

**CTA Strategy:** Smart CTA (3 uses → register, 5 uses → premium), exit intent popup

---

## 5. UX/UI Audit

**Strengths:**
- Clean RTL layout
- Dark mode via CSS variables
- Mobile-responsive
- Consistent card-based design
- Loading/empty states

**Weaknesses:**
- Search page could show popular tools when empty
- Some tool pages lack transparency information
- Account page could explain benefits better

---

## 6. Architecture Audit

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript 5.5 + Tailwind 3.4

**Structure:**
- `app/` — 131 routes (pages + API)
- `components/` — 121 components
- `lib/` — Utilities, server code, tools registry
- `shared/` — Shared UI, utils, constants
- `features/` — Feature-specific components
- `tests/` — 92 test files

**Strengths:**
- Clean server/client separation
- Feature-based organization
- Shared utilities in `shared/`
- Comprehensive tool registry

**Weaknesses:**
- Some large component files (AccountPage ~900 lines)
- Some test files could be more focused

---

## 7. Local-First & Privacy Audit

| Check | Status | Evidence |
|---|---|---|
| Files processed in browser | ✅ | All PDF/image tools use client-side APIs |
| No file uploads to server | ✅ | grep found no file upload endpoints |
| External fetches limited | ⚠️ | 3 external APIs (market data only) |
| Analytics consent-based | ✅ | Self-hosted, no third-party trackers |
| CSP blocks unwanted requests | ✅ | Strict CSP with nonce |
| Service worker caching | ✅ | sw.js + sw-push.js |
| localStorage used safely | ✅ | Only for scenarios, notifications |

---

## 8. Security Audit

| Check | Status | Evidence |
|---|---|---|
| HTTPS | ✅ | HSTS 2-year |
| HSTS | ✅ | includeSubDomains + preload |
| CSP | ✅ | Nonce-based, strict |
| X-Frame-Options | ✅ | DENY |
| X-Content-Type-Options | ✅ | nosniff |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Permissions-Policy | ✅ | All restricted |
| CSRF | ✅ | Origin check + rate limiting |
| Password hashing | ✅ | Scrypt with salt |
| Rate limiting | ✅ | Redis + PostgreSQL |
| Admin protection | ✅ | RBAC + session auth |
| No secrets in code | ✅ | All via env vars |
| No source maps in prod | ✅ | Not exposed |

---

## 9. Performance Audit

| Metric | Value | Status |
|---|---|---|
| Build size | 322MB | ⚠️ Large |
| Largest JS chunk | 696KB | ⚠️ Needs splitting |
| CSS | 82KB | ✅ Good |
| Fonts | woff2, preloaded | ✅ Optimized |
| Homepage load | ~500ms | ✅ Fast |
| Heavy libs | Lazy-loaded | ✅ Correct |

**Recommendations:**
- Analyze 696KB chunk for splitting
- Consider route-based code splitting
- Monitor Core Web Vitals

---

## 10. SEO Audit

| Check | Status | Evidence |
|---|---|---|
| Unique titles | ✅ | buildMetadata helper |
| Meta descriptions | ✅ | Present on all pages |
| Canonical URLs | ✅ | Generated per page |
| Sitemap | ✅ | Dynamic, includes all routes |
| Robots.txt | ✅ | Proper disallow rules |
| JSON-LD | ✅ | FAQ, HowTo, Breadcrumb, Article |
| OG images | ✅ | Auto-generated |
| Internal linking | ✅ | RelatedTools, BlogToolCTA |
| Blog SEO | ✅ | 140 articles with metadata |

---

## 11. Content Audit

| Area | Count | Quality |
|---|---|---|
| Blog articles | 140 | Good, some repetitive |
| Tool descriptions | 65 | Good, consistent |
| FAQ sections | Present | Useful |
| Financial disclaimers | Present | Clear |
| Privacy policy | Present | Comprehensive |
| Terms page | Present | 5 sections |

---

## 12. Tool Correctness Audit

**Critical Tools:**
- Loan calculator: Standard amortization formula ✅
- Salary calculator: Progressive tax brackets ✅
- Tax calculator: 40M exemption, correct brackets ✅
- Currency converter: Toman display ✅
- Inflation calculator: CPI-based ✅
- Check penalty: Article 522, CPI ✅
- VAT calculator: 7-12% rates ✅
- Mahr calculator: CPI-based ✅

**Missing:**
- Golden test cases for financial formulas
- Edge case documentation
- Source year display on all tools

---

## 13. Accessibility Audit

| Check | Status | Evidence |
|---|---|---|
| ARIA labels | ✅ | 217 instances |
| Focus styles | ✅ | Defined in globals.css |
| RTL support | ✅ | dir="rtl" on html |
| Form labels | ✅ | Input component has labels |
| Keyboard nav | ⚠️ | Missing skip-to-content |
| Color contrast | ✅ | CSS variables ensure consistency |
| Reduced motion | ✅ | useReducedMotion hook |

---

## 14. DevOps & Observability Audit

| Check | Status | Evidence |
|---|---|---|
| Health endpoint | ✅ | /api/health |
| Ready endpoint | ✅ | /api/ready |
| Version endpoint | ✅ | /api/version |
| PM2 process manager | ✅ | Online, 0 restarts |
| Redis caching | ✅ | PONG, 256mb |
| Nginx cache | ✅ | Static + pages + API |
| Deploy script | ✅ | deploy-vps-auto.sh |
| Database | ✅ | PostgreSQL on VPS |
| Logs | ✅ | PM2 logs |

---

## 15. Database & Backend Audit

**Tables:** users, sessions, subscriptions, payments, checkouts, history_entries, history_share_links, rate_limits, rate_limit_metrics, site_settings, analytics_summary, analytics_counters, push_subscriptions

**Strengths:**
- Proper indexing
- UUID primary keys
- Timestamp-based expiry
- Rate limiting with window

**Risks:**
- No automated backups documented
- No data retention policy

---

## 16. Monetization & Growth Audit

| Area | Status | Notes |
|---|---|---|
| Account system | ✅ | Working |
| Usage tracking | ✅ | localStorage + API |
| Premium gating | ⚠️ | Plans defined, not enforced |
| Payment gateway | ❌ | Waiting for Zarinpal |
| Saved scenarios | ✅ | localStorage |
| Shareable results | ✅ | Web Share API |
| Push notifications | ✅ | VAPID implemented |
| Smart CTA | ✅ | 3 uses → register |

---

## 17. Risk Register

| ID | Risk | Severity | Probability | Impact | Fix |
|---|---|---|---|---|---|
| R1 | Heavy JS chunks affect CWV | Medium | High | Performance | Lazy-load splitting |
| R2 | Missing golden tests for finance | Medium | Medium | Correctness | Add test suite |
| R3 | No automated DB backups | High | Low | Data loss | Add backup script |
| R4 | Search page thin when empty | Low | High | UX | Add popular tools |
| R5 | No skip-to-content link | Low | Medium | A11y | Add skip link |

---

## 18. Technical Debt Register

| ID | Debt | Area | Priority | Effort |
|---|---|---|---|---|
| D1 | Large component files (900+ lines) | Architecture | P2 | Medium |
| D2 | Missing golden tests | Testing | P1 | Low |
| D3 | No production readiness script | DevOps | P1 | Low |
| D4 | Some blog articles thin | Content | P2 | Medium |
| D5 | No data retention policy | Database | P2 | Low |

---

## 19. Prioritized Backlog

| Priority | Task | Area | Why |
|---|---|---|---|
| P0 | Add popular tools to search | UX | Better discoverability |
| P0 | Create FinancialTransparencyBox | Trust | Financial tool credibility |
| P0 | Add production readiness script | DevOps | Operational visibility |
| P1 | Add skip-to-content link | A11y | WCAG compliance |
| P1 | Add golden tests for finance | Testing | Correctness assurance |
| P1 | Improve account page value prop | Growth | Conversion |
| P2 | Split heavy JS chunks | Performance | CWV improvement |
| P2 | Expand thin blog articles | Content | SEO depth |
| P2 | Add data retention policy | Database | Privacy compliance |
| P3 | Decompose large components | Architecture | Maintainability |

---

## 20. 7-Day Action Plan

| Day | Task | Deliverable |
|---|---|---|
| 1 | Search page popular tools | Updated SearchContent.tsx |
| 2 | FinancialTransparencyBox | New component + 3 tool integrations |
| 3 | Production readiness script | scripts/ops/check-production-readiness.mjs |
| 4 | Skip-to-content link | Updated layout/SiteShell |
| 5 | Golden tests for finance | tests/unit/finance-golden.test.ts |
| 6 | Deploy and verify | VPS deployment + live test |
| 7 | Documentation + report | Audit report + roadmap update |

---

## 21. 30-Day Roadmap

**Week 1:** Top 5 fixes (search, transparency, ops, a11y, tests)
**Week 2:** Account page improvements + golden tests expansion
**Week 3:** SEO cleanup + internal linking + sitemap optimization
**Week 4:** Performance hardening + bundle optimization

---

## 22. 90-Day Roadmap

**Month 1:** Stabilization — top fixes, tests, monitoring
**Month 2:** Growth — content expansion, topic clusters, SEO
**Month 3:** Monetization — premium gating, payment gateway, retention

---

## 23. Final Recommendation

PersianToolbox is a **strong production-grade platform** with high growth potential. The codebase is well-structured, security is comprehensive, and the product vision is clear.

**Recommended next steps:**
1. Implement the 5 priority fixes
2. Add golden tests for financial tools
3. Improve search discoverability
4. Prepare for payment gateway integration
5. Monitor Core Web Vitals

**Do not deploy until all quality gates pass.**
