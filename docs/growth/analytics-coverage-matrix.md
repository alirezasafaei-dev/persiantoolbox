# Analytics Coverage Matrix — PersianToolbox Growth

**Created**: 2026-08-08  
**Status**: Audit Complete

---

## Event Coverage Matrix

| Event | Implemented? | Source File | Client/Server | Trigger | Payload | Privacy Risk | Verified? |
|-------|--------------|-------------|---------------|---------|---------|--------------|-----------|
| `page_view` | ✅ Yes | `components/analytics/PlausibleAnalytics.tsx` | Client | Page load | path, referrer | Low | ✅ |
| `tool_open` | ✅ Yes | `shared/analytics/useToolAnalytics.ts` | Client | Tool mount | tool_id, category | Low | ✅ |
| `tool_run` | ✅ Yes | `shared/analytics/useToolAnalytics.ts` | Client | User triggers tool | tool_id, category | Low | ✅ |
| `tool_use` | ✅ Yes | `shared/analytics/useToolAnalytics.ts` | Client | Tool interaction | tool_id, category | Low | ✅ |
| `tool_error` | ✅ Yes | `shared/analytics/useToolAnalytics.ts` | Client | Tool error | tool_id, category, error_type | Low | ✅ |
| `tool_export_click` | ✅ Yes | `shared/analytics/useToolAnalytics.ts` | Client | Export button click | tool_id, category | Low | ✅ |
| `cta_click` | ✅ Yes | `shared/analytics/events.ts` (defined) | Client | CTA click | location, destination | Low | ⚠️ Partial |
| `hero_tool_view` | ❌ No | — | — | — | — | — | — |
| `tool_start` | ⚠️ Partial | `shared/analytics/useToolAnalytics.ts` | Client | First interaction | tool_id | Low | ⚠️ |
| `tool_complete` | ❌ No | — | — | — | — | — | — |
| `result_export` | ⚠️ Partial | `shared/analytics/useExportFunnel.ts` | Client | Export complete | product, format, source | Low | ⚠️ |
| `social_landing` | ❌ No | — | — | — | — | — | — |
| `signup_start` | ❌ No | — | — | — | — | — | — |
| `signup_complete` | ❌ No | — | — | — | — | — | — |
| `checkout_start` | ✅ Yes | `shared/analytics/events.ts` | Client | Checkout initiated | plan_id, price | Low | ✅ |
| `purchase_complete` | ✅ Yes | `shared/analytics/events.ts` | Client | Payment success | plan_id, amount | Low | ✅ |

---

## Priority Gaps (Required for Growth Loop)

### 1. `social_landing` — HIGH PRIORITY

**Purpose**: Track visitors arriving from social media campaigns  
**Trigger**: Page load with UTM parameters  
**Payload**: platform, campaign, asset_type (from UTMs)  
**Privacy**: Only UTM metadata, no fingerprinting

**Implementation Plan**:
```typescript
// In PlausibleAnalytics.tsx or new SocialLandingTracker.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmCampaign = params.get('utm_campaign');
  const utmContent = params.get('utm_content');
  
  if (utmSource && ['instagram', 'telegram', 'twitter'].includes(utmSource)) {
    trackAnalyticsEvent('social_landing', {
      platform: utmSource,
      campaign: utmCampaign,
      asset_type: utmContent,
    });
  }
}, []);
```

### 2. `tool_complete` — HIGH PRIORITY

**Purpose**: Track successful tool completion  
**Trigger**: Tool produces valid result  
**Payload**: tool_id, duration_ms, category  
**Privacy**: No result content

**Implementation Plan**:
```typescript
// Add to useToolAnalytics.ts
const trackComplete = useCallback((extra?: Record<string, unknown>) => {
  trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_COMPLETE, { ...meta.current, ...extra });
}, []);
```

### 3. `cta_click` — MEDIUM PRIORITY

**Purpose**: Track CTA interactions across site  
**Trigger**: User clicks any CTA  
**Payload**: location, destination, utm_params  
**Privacy**: No user data

**Status**: Event defined but not consistently implemented across all CTA locations.

### 4. `signup_complete` — MEDIUM PRIORITY

**Purpose**: Track successful registration  
**Trigger**: User completes signup  
**Payload**: source (from UTM), method  
**Privacy**: No credentials

---

## Existing Event Details

### `tool_open` (Implemented)

- **File**: `shared/analytics/useToolAnalytics.ts`
- **Trigger**: `useEffect(() => { trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_OPEN, meta.current); }, []);`
- **Payload**: `{ tool_id: string, category?: string }`
- **Privacy**: ✅ Safe — only tool identifier

### `tool_run` (Implemented)

- **File**: `shared/analytics/useToolAnalytics.ts`
- **Trigger**: `trackRun()` called by tool component
- **Payload**: `{ tool_id: string, category?: string, ...extra }`
- **Privacy**: ✅ Safe — no input content

### `tool_export_click` (Implemented)

- **File**: `shared/analytics/useToolAnalytics.ts`
- **Trigger**: `trackExport()` called on export button
- **Payload**: `{ tool_id: string, category?: string, ...extra }`
- **Privacy**: ✅ Safe — no document content

### `checkout_start` / `purchase_complete` (Implemented)

- **File**: `shared/analytics/events.ts`
- **Trigger**: Funnel tracking in checkout flow
- **Payload**: `{ plan_id, price/amount, ... }`
- **Privacy**: ✅ Safe — no payment credentials

---

## Consent Integration

All events require consent via `analyticsConsent`:

```typescript
// shared/consent/analyticsConsent.ts
export const ANALYTICS_CONSENT_KEY = 'pt_analytics_consent';
export const ANALYTICS_CONSENT_EVENT = 'pt:analytics-consent';
```

**Consent State**:
```typescript
type AnalyticsConsentState = {
  analytics_storage: boolean;
  contextualAds: boolean;
  targetedAds: boolean;
};
```

**Gating**: All tracking functions check consent before emission.

---

## Recommendations

### Immediate (Phase 2)

1. **Add `social_landing` event** — Critical for measuring campaign ROI
2. **Add `tool_complete` event** — Critical for product completion metrics
3. **Standardize `cta_click` tracking** — Add to all CTA locations

### Phase 3

4. **Add `signup_start` / `signup_complete`** — Registration funnel
5. **Add `hero_tool_view`** — Hero section impression tracking
6. **Enhance `result_export`** — Export funnel completion

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial coverage matrix |
