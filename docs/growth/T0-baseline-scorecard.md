# T0 Baseline Scorecard — Growth Mission Start

**Date**: 2026-08-08  
**Status**: BASELINE (before growth activities begin)

---

## Google Search Console — Verified

**Source**: Google Search Console query report  
**Export Date**: 2026-07-09  
**Date Range**: 28d ending 2026-07-09  
**Data Quality**: Verified export, no interpolation

| Metric | 28d | 7d | Trend |
|--------|-----|-----|-------|
| **Clicks** | 145 | 63 | — |
| **Impressions** | 2,283 | 692 | — |
| **CTR** | 6.4% | 9.1% | — |
| **Avg Position** | 7.7 | 8.6 | — |

---

## Top Pages (28d) — Verified GSC Export

| Page | Clicks | Impressions | CTR | Avg Pos |
|------|--------|-------------|-----|---------|
| `/text-tools/address-fa-to-en` | 38 | 43 | 88.4% | 2.1 |
| `/` (homepage) | 27 | 380 | 7.1% | 4.5 |
| `/blog/آموزش-تبدیل-عکس-به-متن` | 16 | 210 | 7.6% | 5.8 |
| `/tools/persian-ocr` | 13 | 334 | 3.9% | 5.2 |
| `/tools/check-penalty` | 6 | 34 | 17.6% | 4.5 |
| `/date-tools/shamsi-gregorian` | 5 | 150 | 3.3% | 8.2 |
| `/salary` | 4 | 120 | 3.3% | 12.5 |
| `/pdf-tools/compress/compress-pdf` | 3 | 90 | 3.3% | 9.8 |
| `/pdf-tools/edit/add-page-numbers` | 2 | 60 | 3.3% | 11.2 |
| `/loan` | 2 | 80 | 2.5% | 10.5 |

---

## Hero Tool Scores — Verified (Scorer v2.0)

Source: `docs/growth/hero-scores.json` (scorer version 2.0, GSC-only scoring)

| Rank | Tool | Score | Status | Strategy |
|------|------|-------|--------|----------|
| 1 | address-fa-to-en | — | 🟢 LIVE | Speed + Privacy Reels |
| 2 | persian-ocr | — | 🟢 LIVE | Problem-Solution Reels |
| 3 | check-penalty | — | 🟢 LIVE | Legal Awareness Reels |
| 4 | shamsi-gregorian | — | 🟢 LIVE | Before/After Reels |
| 5 | salary | — | 🟢 LIVE | 1405 Update Reels |
| 6 | compress-pdf | — | 🟢 LIVE | Workflow Reels |
| 7 | add-page-numbers | — | 🟢 LIVE | Story Tips |

*Scores computed from GSC data only. Product/social/monetization dimensions neutralized.*

---

## Instagram — EXTERNAL_BASELINE_REQUIRED

**Account**: Existing Rose account (AI-generated creator)  
**Status**: Account exists with real activity  

| Metric | Value | Source |
|--------|-------|--------|
| Followers | EXTERNAL_BASELINE_REQUIRED | No programmatic access |
| Reach (7d) | EXTERNAL_BASELINE_REQUIRED | No programmatic access |
| Engagement Rate | EXTERNAL_BASELINE_REQUIRED | No programmatic access |
| Top Content | EXTERNAL_BASELINE_REQUIRED | No programmatic access |

*Instagram Insights data requires manual export from the Instagram app or Meta Business Suite. Mark fields as EXTERNAL_BASELINE_REQUIRED until programmatic access is available.*

---

## Production Health

| Check | Status |
|-------|--------|
| Site reachable | ✅ |
| /api/health | ✅ |
| Production SHA | `0c08ed44706c` (pre-growth commits) |
| All 7 hero tools HTTP 200 | ✅ |
| CSS served correctly | ✅ |
| Fonts served correctly | ✅ |

---

## Analytics Coverage — Verified

| Event | Defined | Implemented | Wired | Verified |
|-------|---------|-------------|-------|----------|
| `page_view` | ✅ | ✅ PlausibleAnalytics | ✅ Auto | ✅ |
| `tool_open` | ✅ | ✅ useToolAnalytics / ToolOpenTracker | ⚠️ Hook exists, not used by hero tools | ✅ Component works |
| `tool_run` | ✅ | ✅ useToolAnalytics | ⚠️ Hook exists, not used by hero tools | ✅ Hook works |
| `tool_complete` | ✅ | ✅ useToolAnalytics | ❌ Not wired to any hero tool | ❌ |
| `social_landing` | ✅ | ✅ SocialLandingTracker | ✅ ClientRuntimeBoot | ✅ With consent check |
| `cta_click` | ✅ | ✅ SmartCTA, PortfolioCTA | ✅ Multiple locations | ✅ |
| `checkout_start` | ✅ | ✅ UpgradeModal | ✅ | ✅ |
| `payment_success` | ✅ | ✅ events.ts | ✅ | ✅ |

---

## Content Queue Status

| Queue | Status | Notes |
|-------|--------|-------|
| Reels (30-day) | ✅ Created | 30 Reels planned |
| Reels (Days 1-7) | ✅ Created | 7 detailed packages |
| Execution Board | ✅ Created | Day-by-day checklist |

---

## Growth Targets (30-Day)

| Metric | T0 | T7 | T14 | T30 |
|--------|-----|-----|------|------|
| **GSC Clicks (28d)** | 145 | 160 | 200 | 300 |
| **GSC Impressions (28d)** | 2,283 | 2,500 | 3,000 | 5,000 |
| **GSC CTR** | 6.4% | 6.5% | 7.0% | 7.5% |
| **Instagram Followers** | EXTERNAL | — | — | — |
| **Link Clicks (UTM)** | 0 | 100 | 500 | 2,000 |
| **Tool Starts (from social)** | 0 | 50 | 250 | 1,000 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-08-08 | Replaced fabricated data with verified sources, marked Instagram as EXTERNAL_BASELINE_REQUIRED |
| 1.0 | 2026-08-08 | Initial T0 baseline |
