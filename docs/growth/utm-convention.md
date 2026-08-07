# UTM Convention — PersianToolbox Growth

**Version**: 1.0  
**Created**: 2026-08-08

---

## UTM Format

```
utm_source={platform}
utm_medium={medium}
utm_campaign={cluster}_{cycle}
utm_content={asset_type}_{day}
```

### Parameters

| Parameter | Description | Format | Example |
|-----------|-------------|--------|---------|
| `utm_source` | Platform name | lowercase | `instagram`, `telegram` |
| `utm_medium` | Marketing medium | lowercase | `social`, `story`, `post` |
| `utm_campaign` | Campaign identifier | `{cluster}_{cycle}` | `pdf_tools_cycle1` |
| `utm_content` | Asset identifier | `{type}_{day}` | `reel_day1` |

---

## Platform Conventions

### Instagram

| Asset Type | utm_medium | utm_content Format |
|------------|------------|-------------------|
| Reel | `social` | `reel_day{N}` |
| Carousel | `social` | `carousel_day{N}` |
| Story | `story` | `story_day{N}` |
| Post | `social` | `post_day{N}` |

### Telegram

| Asset Type | utm_medium | utm_content Format |
|------------|------------|-------------------|
| Post | `social` | `post_day{N}` |
| Channel | `social` | `channel_day{N}` |
| Bot | `bot` | `bot_day{N}` |

---

## Campaign Naming

### Tool Clusters

| Cluster | Campaign Name |
|---------|---------------|
| PDF Tools | `pdf_tools` |
| Finance Tools | `finance_tools` |
| Date Tools | `date_tools` |
| Address Tools | `address_tools` |
| OCR Tools | `ocr_tools` |
| Document Tools | `document_tools` |
| Writing Tools | `writing_tools` |
| Image Tools | `image_tools` |
| Contract Tools | `contract_tools` |
| Career Tools | `career_tools` |
| SEO Tools | `seo_tools` |

### Cycle Number

Increment cycle number each week:
- Week 1: `cycle1`
- Week 2: `cycle2`
- Week 3: `cycle3`
- Week 4: `cycle4`

---

## Examples

### Instagram Reel (Day 1, PDF Tools, Cycle 1)

```
https://persiantoolbox.ir/pdf-tools/compress/compress-pdf?
  utm_source=instagram
  &utm_medium=social
  &utm_campaign=pdf_tools_cycle1
  &utm_content=reel_day1
```

### Instagram Story (Day 5, Finance Tools, Cycle 1)

```
https://persiantoolbox.ir/salary?
  utm_source=instagram
  &utm_medium=story
  &utm_campaign=finance_tools_cycle1
  &utm_content=story_day5
```

### Telegram Post (Day 3, OCR Tools, Cycle 1)

```
https://persiantoolbox.ir/tools/persian-ocr?
  utm_source=telegram
  &utm_medium=social
  &utm_campaign=ocr_tools_cycle1
  &utm_content=post_day3
```

### Instagram Carousel (Day 7, Address Tools, Cycle 1)

```
https://persiantoolbox.ir/text-tools/address-fa-to-en?
  utm_source=instagram
  &utm_medium=social
  &utm_campaign=address_tools_cycle1
  &utm_content=carousel_day7
```

---

## UTM Generator Script

Location: `scripts/growth/utm-generator.ts`

### Usage

```typescript
import { generateUTM } from './utm-generator';

const url = generateUTM({
  path: '/pdf-tools/compress/compress-pdf',
  source: 'instagram',
  medium: 'social',
  cluster: 'pdf_tools',
  cycle: 1,
  assetType: 'reel',
  day: 1,
});

// Output: https://persiantoolbox.ir/pdf-tools/compress/compress-pdf?utm_source=instagram&utm_medium=social&utm_campaign=pdf_tools_cycle1&utm_content=reel_day1
```

### Implementation

```typescript
interface UTMParams {
  path: string;
  source: string;
  medium: string;
  cluster: string;
  cycle: number;
  assetType: string;
  day: number;
}

export function generateUTM(params: UTMParams): string {
  const base = 'https://persiantoolbox.ir';
  const url = new URL(params.path, base);
  
  url.searchParams.set('utm_source', params.source.toLowerCase());
  url.searchParams.set('utm_medium', params.medium.toLowerCase());
  url.searchParams.set('utm_campaign', `${params.cluster}_cycle${params.cycle}`);
  url.searchParams.set('utm_content', `${params.assetType}_day${params.day}`);
  
  return url.toString();
}
```

---

## Attribution Tracking

### How UTM Data Flows

1. **User clicks link** with UTM parameters
2. **Next.js parses** URL on page load
3. **Analytics event** includes UTM metadata:
   ```typescript
   {
     event: 'page_view',
     metadata: {
       source: 'instagram',
       medium: 'social',
       campaign: 'pdf_tools_cycle1',
       content: 'reel_day1',
     }
   }
   ```
4. **Database stores** UTM data in `analytics_daily` table
5. **Dashboard displays** performance by campaign

### Social Landing Event

When a user arrives from social media:

```typescript
track('social_landing', {
  platform: utmSource,      // 'instagram'
  campaign: utmCampaign,    // 'pdf_tools_cycle1'
  assetType: utmContent,    // 'reel_day1'
});
```

---

## Redirect Handling

UTM parameters survive redirects because:

1. **Next.js redirects** preserve query strings
2. **nginx redirects** preserve query strings
3. **Analytics captures** UTMs on landing page

### Exception

If a redirect changes the path AND strips query parameters, UTMs are lost. This should be avoided.

---

## Reporting

### Weekly UTM Report

Location: `docs/growth/weekly-scorecards/YYYY-WXX.md`

```markdown
## UTM Performance

| Campaign | Clicks | Conversions | Revenue |
|----------|--------|-------------|---------|
| pdf_tools_cycle1 | 45 | 12 | $X |
| finance_tools_cycle1 | 38 | 8 | $X |
| ocr_tools_cycle1 | 22 | 5 | $X |
```

### Campaign Comparison

Compare performance across:
- Platforms (Instagram vs Telegram)
- Asset types (Reel vs Carousel vs Story)
- Tool clusters (PDF vs Finance vs OCR)
- Cycles (Week 1 vs Week 2)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial UTM convention |
