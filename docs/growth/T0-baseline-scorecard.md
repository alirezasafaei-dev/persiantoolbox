# T0 Baseline Scorecard — Growth Mission Start

**Date**: 2026-08-08  
**Status**: BASELINE (before growth activities begin)

---

## Google Search Console — Verified

**Source**: Google Search Console query report  
**Export Date**: 2026-07-09  
**Date Range**: 28d ending 2026-07-09  
**Data Quality**: Verified export, no interpolation

| Metric           | 28d   | 7d   | Trend |
| ---------------- | ----- | ---- | ----- |
| **Clicks**       | 145   | 63   | —     |
| **Impressions**  | 2,283 | 692  | —     |
| **CTR**          | 6.4%  | 9.1% | —     |
| **Avg Position** | 7.7   | 8.6  | —     |

---

## Top Pages (28d) — Verified GSC Export

| Page                               | Clicks | Impressions | CTR   | Avg Pos |
| ---------------------------------- | ------ | ----------- | ----- | ------- |
| `/text-tools/address-fa-to-en`     | 38     | 43          | 88.4% | 2.1     |
| `/` (homepage)                     | 27     | 380         | 7.1%  | 4.5     |
| `/blog/آموزش-تبدیل-عکس-به-متن`     | 16     | 210         | 7.6%  | 5.8     |
| `/tools/persian-ocr`               | 13     | 334         | 3.9%  | 5.2     |
| `/tools/check-penalty`             | 6      | 34          | 17.6% | 4.5     |
| `/date-tools/shamsi-gregorian`     | 5      | 150         | 3.3%  | 8.2     |
| `/salary`                          | 4      | 120         | 3.3%  | 12.5    |
| `/pdf-tools/compress/compress-pdf` | 3      | 90          | 3.3%  | 9.8     |
| `/pdf-tools/edit/add-page-numbers` | 2      | 60          | 3.3%  | 11.2    |
| `/loan`                            | 2      | 80          | 2.5%  | 10.5    |

---

## Hero Tool Scores — Verified (Scorer v2.0)

Source: `docs/growth/hero-scores.json` (scorer version 2.0, GSC-only scoring)

| Rank | Tool             | Score | Status  | Strategy               |
| ---- | ---------------- | ----- | ------- | ---------------------- |
| 1    | address-fa-to-en | —     | 🟢 LIVE | Speed + Privacy Reels  |
| 2    | persian-ocr      | —     | 🟢 LIVE | Problem-Solution Reels |
| 3    | check-penalty    | —     | 🟢 LIVE | Legal Awareness Reels  |
| 4    | shamsi-gregorian | —     | 🟢 LIVE | Before/After Reels     |
| 5    | salary           | —     | 🟢 LIVE | 1405 Update Reels      |
| 6    | compress-pdf     | —     | 🟢 LIVE | Workflow Reels         |
| 7    | add-page-numbers | —     | 🟢 LIVE | Story Tips             |

_Scores computed from GSC data only. Product/social/monetization dimensions neutralized._

---

## Instagram — Manual Founder Account (§14)

**Account**: Alireza's founder account (manual, not API-connected)  
**Status**: Manual baseline verified  
**Verified**: 2026-08-08

| Metric            | Value               | Source                        |
| ----------------- | ------------------- | ----------------------------- |
| Followers         | ~110                | Manual count, founder account |
| Recent Reel Views | ~634 (within hours) | Manual snapshot, early Reel   |
| Engagement Rate   | TBD                 | Requires manual tracking      |
| Top Content       | TBD                 | Requires manual tracking      |

_Instagram data from founder's manual account. API access pending Meta business verification (§50). Mark fields as TBD until programmatic access is available._

---

## Production Health

| Check                     | Status                              |
| ------------------------- | ----------------------------------- |
| Site reachable            | ✅                                  |
| /api/health               | ✅                                  |
| Production SHA            | `01f64af154bc` (post-growth deploy) |
| All 7 hero tools HTTP 200 | ✅                                  |
| CSS served correctly      | ✅                                  |
| Fonts served correctly    | ✅                                  |

---

## Analytics Coverage — Verified

| Event             | Defined | Implemented                           | Wired                                  | Verified              |
| ----------------- | ------- | ------------------------------------- | -------------------------------------- | --------------------- |
| `page_view`       | ✅      | ✅ PlausibleAnalytics                 | ✅ Auto                                | ✅                    |
| `tool_open`       | ✅      | ✅ useToolAnalytics / ToolOpenTracker | ⚠️ Hook exists, not used by hero tools | ✅ Component works    |
| `tool_run`        | ✅      | ✅ useToolAnalytics                   | ⚠️ Hook exists, not used by hero tools | ✅ Hook works         |
| `tool_complete`   | ✅      | ✅ trackAnalyticsEvent                | ✅ All 5 hero tools                    | ✅ Consent-gated      |
| `social_landing`  | ✅      | ✅ SocialLandingTracker               | ✅ ClientRuntimeBoot                   | ✅ With consent check |
| `cta_click`       | ✅      | ✅ SmartCTA, PortfolioCTA             | ✅ Multiple locations                  | ✅                    |
| `checkout_start`  | ✅      | ✅ UpgradeModal                       | ✅                                     | ✅                    |
| `payment_success` | ✅      | ✅ events.ts                          | ✅                                     | ✅                    |

---

## Content Queue Status

| Queue                   | Status     | Notes                               |
| ----------------------- | ---------- | ----------------------------------- |
| Content Packs (30-day)  | ✅ Created | 30 days × 7 platforms = 210 assets  |
| Days 1-7 Multi-Platform | ✅ Rebuilt | 7 platforms per day, 49 assets/week |
| Founder Content Bible   | ✅ Created | §7, 3 founder content pieces        |
| Social Pack Generator   | ✅ Built   | §43, validates §11 UTM convention   |
| Execution Board         | ✅ Created | Day-by-day checklist (Google Flow)  |

---

## Growth Targets (30-Day)

| Metric                        | T0       | T7    | T14   | T30   |
| ----------------------------- | -------- | ----- | ----- | ----- |
| **GSC Clicks (28d)**          | 145      | 160   | 200   | 300   |
| **GSC Impressions (28d)**     | 2,283    | 2,500 | 3,000 | 5,000 |
| **GSC CTR**                   | 6.4%     | 6.5%  | 7.0%  | 7.5%  |
| **Instagram Followers**       | EXTERNAL | —     | —     | —     |
| **Link Clicks (UTM)**         | 0        | 100   | 500   | 2,000 |
| **Tool Starts (from social)** | 0        | 50    | 250   | 1,000 |

---

## Version History

| Version | Date       | Changes                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 3.0     | 2026-08-08 | Founder Instagram baseline (~110 followers, ~634 Reel views), TOOL_COMPLETE wired, production SHA updated, content queue status refreshed |
| 2.0     | 2026-08-08 | Replaced fabricated data with verified sources, marked Instagram as EXTERNAL_BASELINE_REQUIRED                                            |
| 1.0     | 2026-08-08 | Initial T0 baseline                                                                                                                       |
