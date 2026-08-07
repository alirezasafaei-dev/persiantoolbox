# PersianToolbox 30-Day Organic Growth Design

**Created**: 2026-08-08  
**Version**: 1.0  
**Status**: Active Mission  
**Target**: 50,000+ monthly organic traffic within 90 days

---

## Executive Summary

PersianToolbox is a mature Next.js 16 application with 86+ tools across 11 categories, 126 blog articles, self-hosted analytics, Zarinpal payments, and a Hetzner Germany VPS. The site is live and healthy at v8.0.0.

**Current Baseline (GSC July 9, 2026):**
- 28-day: 145 clicks, 2,283 impressions, 6.4% CTR, 7.7 avg position
- 7-day: 63 clicks, 692 impressions, 9.1% CTR, 8.6 avg position
- Top performer: `/text-tools/address-fa-to-en` (38 clicks/28d)

**Mission**: Build an autonomous organic growth system that compounds search, social, and product signals into sustainable traffic and revenue.

---

## Architecture: Hybrid Growth Loop

```
Search Demand (SEO)
    ↓
PersianToolbox Hero Tools
    ↓
Useful Result (Product)
    ↓
Rose/Social Content (Instagram/Telegram)
    ↓
Returning/Searching Users (Retention)
    ↓
Analytics (Measurement)
    ↓
Weekly Prioritization (Optimization)
    ↓
Stronger Tool/Content/SEO Cluster (Compounding)
```

### Feedback Mechanisms

1. **SEO → Product**: Search Console data reveals what users need
2. **Product → Social**: Tool capabilities become content angles
3. **Social → Search**: Social proof increases branded search
4. **Analytics → Prioritization**: Data-driven weekly decisions
5. **Prioritization → SEO**: Focus resources on winning clusters

---

## Hero Tool Strategy

### Scoring Model

Each tool receives a score (0-100) based on weighted signals:

| Signal | Weight | Source |
|--------|--------|--------|
| Search impressions | 25% | Google Search Console |
| Search clicks | 20% | Google Search Console |
| CTR (actual vs expected) | 10% | Google Search Console |
| Average position | 15% | Google Search Console |
| Product starts | 10% | Self-hosted analytics |
| Completion rate | 10% | Self-hosted analytics |
| Social performance | 5% | Instagram/Telegram metrics |
| Monetization intent | 5% | Pricing page visits, upgrade clicks |

### Initial Hero Candidates (Ranked by GSC Data)

1. **Persian Address → English** (`/text-tools/address-fa-to-en`)
   - GSC: 38 clicks/28d, #1 performer
   - Score: 85/100
   - Strategy: Expand content cluster, add FAQ, internal linking

2. **Persian OCR** (`/tools/persian-ocr`)
   - GSC: 13 clicks/28d, 334 impressions
   - Score: 78/100
   - Strategy: Blog content cluster, comparison articles

3. **Late-Payment Damages Calculator** (`/tools/check-penalty`)
   - GSC: 6 clicks/28d, high impressions
   - Score: 72/100
   - Strategy: Improve CTR with better meta description

4. **Date Difference Calculator** (`/date-tools/shamsi-gregorian`)
   - High search volume, page-one visibility
   - Score: 70/100
   - Strategy: Internal linking, FAQ schema

5. **Salary 1405 Calculator** (`/salary`)
   - Seasonal demand, page-one/page-two
   - Score: 68/100
   - Strategy: Update for 1405, add comparison content

6. **PDF Compression** (`/pdf-tools/compress/compress-pdf`)
   - Evergreen demand
   - Score: 65/100
   - Strategy: Blog tutorials, comparison articles

7. **PDF Page Numbering** (`/pdf-tools/edit/add-page-numbers`)
   - Page-one opportunity
   - Score: 62/100
   - Strategy: Step-by-step guide content

### Dynamic Ranking Updates

The scoring model will be recalculated weekly using:
- `scripts/growth/hero-tool-scorer.ts` (new)
- Data from GSC API, analytics events, and social metrics
- Output: `docs/growth/hero-scores.json` (updated weekly)

---

## SEO Opportunity Pipeline

### Data Sources

1. **Google Search Console API** (existing service account)
2. **Self-hosted analytics** (PostgreSQL/file)
3. **Sitemap audit** (`pnpm seo:sitemap:audit`)
4. **Manual inspection** (canonical, schema, internal links)

### Opportunity Types

| Type | Description | Priority |
|------|-------------|----------|
| High impressions / weak CTR | Title/description optimization | High |
| Positions 4-15 | Quick wins with internal linking | High |
| Rising queries | New content opportunities | Medium |
| Declining winners | Refresh/update needed | Medium |
| Cannibalization | Consolidate/redirect | Medium |
| Legacy URLs | Redirect cleanup | Low |
| Weak internal linking | Add contextual links | Medium |
| Content/tool mismatch | Align content with intent | High |

### Measurable Hypotheses

For each SEO change:
1. **Query intent**: What is the user actually looking for?
2. **Current page**: What does the site currently show?
3. **Defect/opportunity**: What's wrong or could be better?
4. **Proposed change**: Specific modification
5. **Measurable hypothesis**: "Changing X will improve Y by Z% within N days"

---

## Analytics Contract

### Event Taxonomy

| Event | Description | Metadata |
|-------|-------------|----------|
| `page_view` | Page load | path, referrer, utm_* |
| `hero_tool_view` | Hero section tool impression | tool_id, position |
| `tool_start` | User begins tool interaction | tool_id, category |
| `tool_complete` | Successful tool completion | tool_id, duration_ms |
| `tool_error` | Tool error occurred | tool_id, error_type |
| `result_export` | Export/download triggered | tool_id, format, is_premium |
| `cta_click` | CTA interaction | location, destination |
| `social_landing` | Visit from social platform | platform, campaign, utm_* |
| `signup_start` | Registration initiated | source |
| `signup_complete` | Registration completed | source |
| `checkout_start` | Checkout initiated | plan_id, price |
| `purchase_complete` | Payment completed | plan_id, amount, method |

### Privacy Constraints

**NEVER send to analytics:**
- Uploaded file content
- OCR document contents
- Personal addresses entered into tools
- Document text
- Private form content
- Authentication secrets
- Payment secrets

**Allowed metadata keys:**
```typescript
const ALLOWED_METADATA_KEYS = new Set([
  'consentGranted',
  'consentVersion',
  'contextualAds',
  'targetedAds',
  'slotId',
  'campaignId',
  'href',
  'source',
  'surface',
  'roleTrack',
  'roleBadge',
  'linkLabel',
  'linkType',
  'position',
  'destination',
]);
```

---

## UTM Convention

### Format

```
utm_source={platform}
utm_medium={medium}
utm_campaign={cluster}_{cycle}
utm_content={asset_type}_{day}
```

### Examples

| Platform | UTM |
|----------|-----|
| Instagram Reel | `utm_source=instagram&utm_medium=social&utm_campaign=pdf_tools_cycle1&utm_content=reel_day1` |
| Telegram Post | `utm_source=telegram&utm_medium=social&utm_campaign=finance_tools_cycle1&utm_content=post_day3` |
| Story | `utm_source=instagram&utm_medium=story&utm_campaign=ocr_tools_cycle1&utm_content=story_day5` |

### UTM Generator

Script: `scripts/growth/utm-generator.ts` (new)
- Input: platform, cluster, asset_type, day
- Output: Full URL with UTM parameters
- Deterministic: Same inputs = same output

---

## Rose — AI Creator System

### Character Bible

**Name**: Rose (رز)  
**Role**: AI/Programming Creator  
**Apparent Age**: ~25  
**Ethnicity**: Persian/Iranian  

#### Immutable Features

| Feature | Description |
|---------|-------------|
| Face shape | Youthful oval |
| Skin tone | Light-to-medium warm |
| Eyes | Dark brown, almond-shaped |
| Eyebrows | Full, dark brown |
| Glasses | Round, black frames |
| Nose | Subtle small piercing (left nostril) |
| Lips | Natural pink/nude |
| Hair length | Chin-length bob |
| Hair color | Very dark roots, vivid magenta front/side panels, sapphire-blue lower layers |

#### Variable Features

| Feature | Variations |
|---------|------------|
| Outfit | Casual tech, professional, creative |
| Studio | Home office, co-working, outdoor tech setup |
| Pose | Talking head, demonstrating, thinking |
| Content topic | Tool tutorials, tips, comparisons |

#### Personality

- Smart and technical
- Modern and practical
- Energetic but not hyper
- Trustworthy and concise
- Iranian Persian (not corporate, not fake-hype)

### Master Google Flow Prompt

```
[IMMUTABLE CHARACTER BLOCK]
Rose (رز), a ~25-year-old Persian female AI/programming creator.
Youthful oval face, light-to-medium warm skin, dark brown almond-shaped eyes,
full dark eyebrows, round black glasses, subtle nose piercing on left nostril,
natural pink/nue lips, chin-length bob with very dark roots, vivid magenta
front/side panels, sapphire-blue lower layers.

[VARIABLE OUTFIT BLOCK]
{outfit_description}

[VARIABLE ENVIRONMENT BLOCK]
{environment_description}

[PERFORMANCE BLOCK]
- Vertical 9:16 format
- 8-10 seconds duration
- High-quality realistic creator output
- Natural Iranian Persian dialogue
- Accurate lip sync
- Confident, helpful demeanor

[DIALOGUE BLOCK]
"{persian_dialogue}"

[AUDIO BLOCK]
- Clear voice
- Background music: subtle tech/lo-fi (optional)
- No subtitle burn-in unless intentionally required

[NEGATIVE CONSTRAINTS]
- Do NOT change facial geometry
- Do NOT change identity
- Do NOT change glasses design
- Do NOT change hair architecture
- Do NOT make her appear older/younger
- Do NOT add English text/subtitles
- Do NOT use corporate/fake-hype tone
```

---

## Content Production Engine

### Cadence (30 Days)

| Type | Quantity | Frequency |
|------|----------|-----------|
| Reels | 30 | Daily |
| Carousels | 10 | ~3/week |
| Stories | 30 | Daily |

### Reel Structure (8-10 seconds)

```
0-2 sec: Strong problem-first hook
2-5 sec: Mistake / tension / clarification
5-8 sec: Solution / tool / result
8-10 sec: One CTA
```

### CTA Library

- "ذخیره کن" (Save this)
- "برای کسی بفرست که بهش نیاز داره" (Send it to someone who needs it)
- "ابزار را امتحان کن" (Use the tool)
- "لینک در بیو" (Link in bio)
- "جستجو کن: جعبه ابزار فارسی + نام ابزار" (Search: PersianToolbox + tool name)

### Content-to-Tool Mapping

Every content item must map to:
1. **User Problem**: What pain point does this address?
2. **Hero Cluster**: Which tool cluster does this support?
3. **Content Angle**: What unique perspective?
4. **CTA**: What action should the viewer take?
5. **Destination**: Where does the CTA lead?
6. **Measurement**: How will we measure success?

---

## Weekly Control Loop

### Decision Score Inputs

| Category | Metrics |
|----------|---------|
| SEARCH | impressions, clicks, CTR, position, trend |
| PRODUCT | starts, completions, completion rate, exports, errors |
| SOCIAL | reach/views, non-follower reach, saves, shares, comments, profile actions, link clicks, follows |
| BUSINESS | signup, checkout, revenue, returning users |

### Weekly Actions

1. **PROMOTE** top opportunities (double down on winners)
2. **ITERATE** promising but underperforming assets (test new angles)
3. **FIX** landing/product/SEO bottlenecks (remove friction)
4. **PAUSE** low-value topics (stop wasting resources)
5. **EXPAND** winning clusters (create related content)

### Documentation

Weekly decisions logged in: `docs/growth/weekly-scorecards/YYYY-WXX.md`

---

## Phase Breakdown (30 Days)

### Phase 1: Foundation (Days 1-7)

- [x] Full project discovery
- [ ] Baseline production metrics
- [ ] Audit analytics implementation
- [ ] Audit SEO implementation
- [ ] Establish Hero Tool ranking
- [ ] Create Rose Character Bible
- [ ] Create Rose Flow template
- [ ] Build 30-day content queue
- [ ] Publish first content set
- [ ] Fix highest-confidence SEO defects
- [ ] Establish attribution/UTM system

### Phase 2: Double Down (Days 8-14)

- [ ] Evaluate first-week signals
- [ ] Expand winning clusters
- [ ] Rewrite weak hooks/snippets
- [ ] Improve landing/product friction
- [ ] Strengthen internal linking
- [ ] Create carousel/story support

### Phase 3: Conversion (Days 15-21)

- [ ] Evaluate second-order behavior
- [ ] Run limited CRO/monetization experiments
- [ ] Continue daily content
- [ ] Continue SEO loop
- [ ] Improve strongest hero funnels

### Phase 4: Scale (Days 22-30)

- [ ] Scale proven content angles
- [ ] Automate repeatable reporting
- [ ] Stabilize growth infrastructure
- [ ] Retire weak experiments
- [ ] Document winners
- [ ] Create next 30-day backlog

---

## Success Metrics

| Metric | Current | 30-Day Target | 90-Day Target |
|--------|---------|---------------|---------------|
| Monthly Organic Clicks | ~300 | 1,000 | 5,000 |
| Monthly Organic Impressions | ~5,000 | 15,000 | 50,000 |
| Average CTR | 6.4% | 8% | 10% |
| Average Position | 7.7 | 6.5 | 5.0 |
| Instagram Followers | 0 | 500 | 2,000 |
| Telegram Members | ~100 | 300 | 1,000 |
| Monthly Revenue | baseline | +20% | +50% |

---

## Risk Management

### Blocked Items

- **Instagram account**: Requires human owner to create/log in
- **Google Search Console API**: Service account exists, verify access
- **Content production**: Google Flow access required for Rose videos

### Mitigations

- Focus on SEO and product improvements first (no external dependencies)
- Build content queue that can be executed when access is available
- Document all processes for handoff

---

## Appendix: Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (standalone) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Cache | Redis (optional) |
| Payments | Zarinpal |
| Analytics | Self-hosted (consent-gated) |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| Hosting | Hetzner Germany VPS |
| Package Manager | pnpm 9.15.0 |
| Tests | Vitest + Playwright |
| CI/CD | GitHub Actions + custom deploy scripts |
