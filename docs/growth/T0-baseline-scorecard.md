# T0 Baseline Scorecard — Growth Mission Start

**Date**: 2026-08-08  
**Status**: BASELINE (before growth activities begin)  
**Source**: Google Search Console (July 9, 2026 data)

---

## Summary

| Metric | 28d | 7d | Trend |
|--------|-----|-----|-------|
| **Clicks** | 145 | 63 | — |
| **Impressions** | 2,283 | 692 | — |
| **CTR** | 6.4% | 9.1% | — |
| **Avg Position** | 7.7 | 8.6 | — |

---

## Top Pages (28d)

| Page | Clicks | Impressions | CTR | Avg Pos |
|------|--------|-------------|-----|---------|
| `/text-tools/address-fa-to-en` | 38 | 450 | 8.4% | 3.2 |
| `/` (homepage) | 27 | 380 | 7.1% | 4.5 |
| `/blog/آموزش-تبدیل-عکس-به-متن` | 16 | 210 | 7.6% | 5.8 |
| `/tools/persian-ocr` | 13 | 180 | 7.2% | 6.1 |
| `/tools/check-penalty` | 6 | 95 | 6.3% | 7.2 |
| `/date-tools/shamsi-gregorian` | 5 | 88 | 5.7% | 8.4 |
| `/salary` | 4 | 72 | 5.6% | 9.1 |
| `/pdf-tools/compress/compress-pdf` | 3 | 65 | 4.6% | 10.2 |
| `/pdf-tools/edit/add-page-numbers` | 2 | 45 | 4.4% | 11.5 |
| `/loan` | 1 | 38 | 2.6% | 12.8 |

---

## Hero Tool Scores (from hero-scores.json)

| Rank | Tool | Score | Status | Strategy |
|------|------|-------|--------|----------|
| 1 | address-fa-to-en | 85 | 🟢 LIVE | Speed + Privacy Reels |
| 2 | persian-ocr | 78 | 🟢 LIVE | Problem-Solution Reels |
| 3 | check-penalty | 72 | 🟢 LIVE | Legal Awareness Reels |
| 4 | shamsi-gregorian | 70 | 🟢 LIVE | Before/After Reels |
| 5 | salary | 68 | 🟢 LIVE | 1405 Update Reels |
| 6 | compress-pdf | 65 | 🟢 LIVE | Workflow Reels |
| 7 | add-page-numbers | 62 | 🟢 LIVE | Story Tips |

---

## Production Health

| Check | Status |
|-------|--------|
| Site reachable | ✅ |
| /api/health | ✅ |
| All 7 hero tools HTTP 200 | ✅ |
| CSS served correctly | ✅ |
| Fonts served correctly | ✅ |

---

## Analytics Coverage

| Event | Status | Notes |
|-------|--------|-------|
| `page_view` | ✅ Implemented | Plausible + self-hosted |
| `tool_open` | ✅ Implemented | useToolAnalytics hook |
| `tool_run` | ✅ Implemented | useToolAnalytics hook |
| `tool_complete` | ✅ Added today | useToolAnalytics hook |
| `social_landing` | ✅ Added today | SocialLandingTracker component |
| `cta_click` | ⚠️ Partial | Needs standardization |
| `tool_complete` | ⚠️ Not in all tools | Needs integration |

---

## Content Queue Status

| Queue | Status | Notes |
|-------|--------|-------|
| Reels (30-day) | ✅ Created | 30 Reels planned |
| Reels (Days 1-7) | ✅ Created | 7 detailed packages |
| Carousels | ✅ Created | 10 carousels planned |
| Stories | ✅ Created | 30-day Story queue |
| Execution Board | ✅ Created | Day-by-day checklist |

---

## Growth Targets (30-Day)

| Metric | T0 | T7 | T14 | T30 |
|--------|-----|-----|------|------|
| **Instagram Followers** | 0 | 100 | 500 | 2,000 |
| **Instagram Reach** | 0 | 1,000 | 5,000 | 20,000 |
| **Link Clicks (UTM)** | 0 | 100 | 500 | 2,000 |
| **Tool Starts (from social)** | 0 | 50 | 250 | 1,000 |
| **GSC Clicks (28d)** | 145 | 160 | 200 | 300 |
| **GSC Impressions (28d)** | 2,283 | 2,500 | 3,000 | 5,000 |
| **GSC CTR** | 6.4% | 6.5% | 7.0% | 7.5% |

---

## Key Decisions Made

1. **Identity**: Rose (رز) as primary creator — AI/Programming niche
2. **Platform**: Instagram Reels first, TikTok later
3. **Hero Tools**: Top 7 tools from scoring system
4. **Attribution**: UTM parameters with `utm_content` for asset identification
5. **Analytics**: Privacy-first, consent-gated, no fingerprinting
6. **Deploy**: Blue-green, never auto-deploy without approval

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low initial engagement | High | Medium | Consistent posting, engage with comments |
| Content quality issues | Medium | High | Review before publishing, test with audience |
| Instagram algorithm changes | Medium | Medium | Diversify to TikTok, Telegram later |
| Technical issues (UTM) | Low | Medium | Test all links before publishing |
| Creator burnout | Medium | High | Batch filming, automated scheduling |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial T0 baseline |
