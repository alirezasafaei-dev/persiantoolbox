# Analytics Contract — PersianToolbox Growth

**Version**: 1.0  
**Created**: 2026-08-08

---

## Event Taxonomy

### Core Events

| Event | Description | Trigger | Metadata |
|-------|-------------|---------|----------|
| `page_view` | Page load | Every page visit | path, referrer, utm_* |
| `hero_tool_view` | Hero section tool impression | Tool visible in hero | tool_id, position |
| `tool_start` | User begins tool interaction | First interaction with tool | tool_id, category |
| `tool_complete` | Successful tool completion | Tool produces result | tool_id, duration_ms |
| `tool_error` | Tool error occurred | Error in tool execution | tool_id, error_type |
| `result_export` | Export/download triggered | User exports result | tool_id, format, is_premium |
| `cta_click` | CTA interaction | User clicks CTA | location, destination |
| `social_landing` | Visit from social platform | Referrer is social | platform, campaign, utm_* |
| `signup_start` | Registration initiated | User starts signup | source |
| `signup_complete` | Registration completed | User completes signup | source |
| `checkout_start` | Checkout initiated | User starts checkout | plan_id, price |
| `purchase_complete` | Payment completed | Payment succeeds | plan_id, amount, method |

### Conversion Funnel Events

| Stage | Events |
|-------|--------|
| Awareness | `page_view` |
| Interest | `tool_start`, `hero_tool_view` |
| Consideration | `cta_click` |
| Intent | `signup_start`, `checkout_start` |
| Conversion | `signup_complete`, `purchase_complete`, `result_export` |

---

## Privacy Constraints

### NEVER Send to Analytics

The following data must NEVER be sent to analytics, even as metadata:

- **File content**: Uploaded file data, OCR results, document text
- **Personal data**: Addresses, names, phone numbers, emails entered into tools
- **Sensitive text**: Contract content, resume content, invoice details
- **Authentication**: Passwords, tokens, session IDs
- **Payment**: Credit card numbers, bank details, payment tokens

### Allowed Metadata Keys

```typescript
const ALLOWED_METADATA_KEYS = new Set([
  // Consent
  'consentGranted',
  'consentVersion',
  
  // Ad tracking
  'contextualAds',
  'targetedAds',
  'slotId',
  'campaignId',
  
  // Navigation
  'href',
  'source',
  'surface',
  
  // Role paths
  'roleTrack',
  'roleBadge',
  'linkLabel',
  'linkType',
  'position',
  'destination',
]);
```

### Metadata Sanitization

All metadata values are sanitized before storage:

```typescript
function sanitizeMetadataValue(value: unknown): unknown {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') return value.slice(0, 120);
  return undefined;
}
```

- Strings: Truncated to 120 characters
- Numbers: Only finite values allowed
- Booleans: Passed through
- Objects/Arrays: Rejected

---

## Implementation

### Client-Side Tracking

Location: `lib/analytics/` (client components)

```typescript
// Example: Tool start tracking
import { useAnalytics } from '@/lib/analytics';

function ToolComponent({ toolId, category }) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    track('tool_start', {
      tool_id: toolId,
      category: category,
    });
  }, []);
}
```

### Server-Side Storage

Location: `lib/analyticsStore.ts`

Storage modes:
1. **PostgreSQL** (production): `analytics_summary`, `analytics_counters`, `analytics_daily` tables
2. **File** (development/testing): `var/analytics/summary.json`

### Event Ingestion

```typescript
import { ingestAnalyticsEvents } from '@/lib/analyticsStore';

await ingestAnalyticsEvents([
  {
    event: 'tool_start',
    timestamp: Date.now(),
    path: '/salary',
    metadata: {
      tool_id: 'salary',
      category: 'finance-tools',
    },
  },
]);
```

---

## Consent Gating

Analytics only fires after user consent:

1. **Consent banner** shown on first visit
2. **User accepts** → `consentGranted: true`
3. **Events fire** with consent metadata
4. **User rejects** → No analytics events

### Consent Version Tracking

```typescript
metadata: {
  consentGranted: true,
  consentVersion: '1.0',
}
```

---

## Performance Monitoring

### Web Vitals

Location: `components/WebVitals.tsx`

Tracks:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)
- **TBT** (Total Blocking Time)

### Error Monitoring

Location: `sentry.client.config.ts`, `sentry.server.config.ts`

Tracks:
- Client-side errors
- Server-side errors
- Edge runtime errors

---

## Analytics Dashboard

### Admin Analytics

Location: `/admin/analytics`

Features:
- Total events
- Event breakdown by type
- Path breakdown
- Daily trends
- Funnel visualization

### Public Stats

Location: `/api/public/stats`

Returns:
- Total calculations performed
- Total files processed
- Total tools available

---

## Data Retention

### PostgreSQL

- **analytics_summary**: Cumulative, no retention limit
- **analytics_counters**: Cumulative, no retention limit
- **analytics_daily**: Daily aggregates, retain 90 days
- **Raw events**: Not stored (only aggregates)

### File Storage

- **summary.json**: Cumulative, no retention limit
- No raw event storage

---

## Verification

### End-to-End Test

```typescript
// tests/analytics/contract.test.ts
describe('Analytics Contract', () => {
  it('tracks tool_start with valid metadata', async () => {
    const events = await trackToolStart('salary', 'finance-tools');
    expect(events[0].event).toBe('tool_start');
    expect(events[0].metadata.tool_id).toBe('salary');
  });

  it('rejects sensitive metadata', async () => {
    const events = await trackEvent('tool_start', {
      file_content: 'sensitive data', // Should be rejected
    });
    expect(events[0].metadata.file_content).toBeUndefined();
  });
});
```

### Production Verification

1. Open a tool page
2. Interact with the tool
3. Check `/admin/analytics` for events
4. Verify no sensitive data in metadata

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-08 | Initial analytics contract |
