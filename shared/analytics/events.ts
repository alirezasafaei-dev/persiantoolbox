/**
 * Event taxonomy for privacy-safe analytics.
 * All events require consent (contextualAds) before emission.
 * Use these constants instead of string literals.
 */

export const ANALYTICS_EVENTS = {
  // Search
  SEARCH_OPEN: 'search_open',
  SEARCH_SUBMIT: 'search_submit',
  SEARCH_RESULT_CLICK: 'search_result_click',

  // Tool lifecycle
  TOOL_OPEN: 'tool_open',
  TOOL_INPUT_CHANGE: 'tool_input_change',
  TOOL_RUN: 'tool_run',
  TOOL_ERROR: 'tool_error',
  TOOL_RESULT_VIEW: 'tool_result_view',
  TOOL_EXPORT_CLICK: 'tool_export_click',

  // Engagement
  HELP_OPEN: 'help_open',
  CTA_CONSULT_CLICK: 'cta_consult_click',
  BLOG_ARTICLE_VIEW: 'blog_article_view',

  // Conversion
  PRICING_VIEW: 'pricing_view',
  PLAN_COMPARISON: 'plan_comparison',
  WAITLIST_SIGNUP: 'waitlist_signup',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Track an analytics event with metadata.
 * Only emits if consent is granted and analytics is enabled.
 */
export function trackAnalyticsEvent(
  event: AnalyticsEvent,
  metadata?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  // Dynamic import to avoid SSR issues
  import('@/lib/monitoring').then(({ analytics }) => {
    analytics.trackEvent(event, metadata);
  });
}
