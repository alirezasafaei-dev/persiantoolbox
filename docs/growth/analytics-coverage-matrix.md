# Analytics Coverage Matrix — PersianToolbox Growth

**Created**: 2026-08-08  
**Updated**: 2026-08-08 (post-implementation audit)  
**Status**: Verified against main branch

---

## Event Coverage Matrix

| Event | Defined | Implemented | Wired | Observed | Source File | Privacy |
|-------|---------|-------------|-------|----------|-------------|---------|
| `page_view` | ✅ | ✅ | ✅ Auto | ✅ Production | `components/analytics/PlausibleAnalytics.tsx` | Low |
| `tool_open` | ✅ | ✅ | ⚠️ Component exists, hero tools don't use it | ⚠️ Dev only | `shared/analytics/useToolAnalytics.ts` + `components/analytics/ToolOpenTracker.tsx` | Low |
| `tool_run` | ✅ | ✅ | ⚠️ Hook exists, hero tools don't call it | ❌ Not observed | `shared/analytics/useToolAnalytics.ts` | Low |
| `tool_complete` | ✅ | ✅ | ❌ Not wired to any hero tool | ❌ Not observed | `shared/analytics/useToolAnalytics.ts` | Low |
| `tool_use` | ✅ | ✅ | ⚠️ Hook exists, hero tools don't call it | ❌ Not observed | `shared/analytics/useToolAnalytics.ts` | Low |
| `tool_error` | ✅ | ✅ | ⚠️ Hook exists, hero tools don't call it | ❌ Not observed | `shared/analytics/useToolAnalytics.ts` | Low |
| `cta_click` | ✅ | ✅ | ✅ SmartCTA, PortfolioCTA, exit-popup | ✅ Production | `components/ui/SmartCTA.tsx`, `shared/cross-site/PortfolioCTA.tsx` | Low |
| `social_landing` | ✅ | ✅ | ✅ ClientRuntimeBoot | ⚠️ Dev only | `components/analytics/SocialLandingTracker.tsx` | Low |
| `checkout_start` | ✅ | ✅ | ✅ UpgradeModal | ✅ Production | `components/features/pricing/UpgradeModal.tsx` | Low |
| `payment_success` | ✅ | ✅ | ✅ events.ts | ✅ Production | `shared/analytics/events.ts` | Low |
| `blog_article_view` | ✅ | ✅ (in EVENT_MAP) | ⚠️ No component wires it | ❌ Not observed | `shared/analytics/plausible.ts` | Low |
| `search_use` | ✅ | ✅ | ✅ ToolSearch | ✅ Production | `components/home/ToolSearch.tsx` | Low |
| `role_path_click` | ✅ | ✅ | ✅ RolePathLink | ✅ Production | `components/home/RolePathLink.tsx` | Low |

---

## Status Definitions

- **Defined**: Event constant exists in `shared/analytics/events.ts`
- **Implemented**: Code exists to emit the event
- **Wired**: Component/hook is actually used in a production component
- **Observed**: Event has been observed in production or development testing

---

## Consensus Architecture

### Consent Gating

All events go through `trackAnalyticsEvent()` which calls two backends:

1. **Self-hosted analytics** (`lib/monitoring.ts`): Checks `getAdsConsent().contextualAds`
2. **Plausible** (`shared/analytics/plausible.ts`): Checks `readAnalyticsConsent()?.analytics_storage`

Both backends independently verify consent before emission. No event bypasses consent.

### Plausible EVENT_MAP

| Analytics Event | Plausible Name |
|-----------------|----------------|
| `TOOL_RUN` | Tool Start |
| `TOOL_COMPLETE` | Tool Complete |
| `TOOL_RESULT_VIEW` | Tool Complete |
| `EXPORT_CONFIRM` | Result Export |
| `BLOG_ARTICLE_VIEW` | Article View |
| `CTA_CLICK` | CTA Click |
| `CHECKOUT_START` | Checkout Start |
| `PAYMENT_SUCCESS` | Payment Success |
| `SOCIAL_LANDING` | Social Landing |
| `TOOL_OPEN` | Tool View |

---

## Gaps Requiring Attention

### High Priority

1. **`tool_complete` not wired**: The hook exists but no hero tool calls `trackComplete()`. Needs integration into tool success paths.
2. **`useToolAnalytics` dead hook**: No component imports it. Consider either wiring it into tools or deprecating in favor of component-level tracking.

### Medium Priority

3. **`blog_article_view` not wired**: Defined in Plausible EVENT_MAP but no component emits it.
4. **`signup_start` / `signup_complete`**: Not defined — needed for registration funnel.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-08-08 | Updated to reflect actual implementation status after audit |
| 1.0 | 2026-08-08 | Initial coverage matrix |
