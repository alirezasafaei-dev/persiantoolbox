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
  CTA_CLICK: 'cta_click',
  BLOG_ARTICLE_VIEW: 'blog_article_view',

  // Tool usage
  TOOL_USE: 'tool_use',

  // Export funnel
  EXPORT_CLICK: 'export_click',
  EXPORT_ATTEMPT: 'export_attempt',
  UPGRADE_VIEW: 'upgrade_view',
  CHECKOUT_START: 'checkout_start',
  EXPORT_TOKEN_ISSUED: 'export_token_issued',
  EXPORT_CONFIRM: 'export_confirm',
  EXPORT_CANCEL: 'export_cancel',
  PAYMENT_SUCCESS: 'payment_success',

  // Search
  SEARCH_USE: 'search_use',

  // Conversion funnel
  PRICING_VIEW: 'pricing_view',
  PLAN_COMPARISON: 'plan_comparison',
  CHECKOUT_COMPLETE: 'checkout_complete',
  UPGRADE_PROMPT_VIEW: 'upgrade_prompt_view',
  UPGRADE_PROMPT_CLICK: 'upgrade_prompt_click',

  // Role-based paths
  ROLE_PATH_CLICK: 'role_path_click',

  // Retention
  PWA_INSTALL_PROMPT: 'pwa_install_prompt',
  PWA_INSTALL_ACCEPT: 'pwa_install_accept',
  PWA_INSTALL_DISMISS: 'pwa_install_dismiss',
  BOOKMARK_ADD: 'bookmark_add',
  SHARE_RESULT: 'share_result',

  // Legacy
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

/**
 * Track conversion funnel step.
 * Use this to track user progress through the conversion funnel.
 */
export function trackFunnelStep(
  step: 'view_pricing' | 'select_plan' | 'start_checkout' | 'complete_payment',
  metadata?: Record<string, unknown>,
): void {
  const eventMap = {
    view_pricing: ANALYTICS_EVENTS.PRICING_VIEW,
    select_plan: ANALYTICS_EVENTS.PLAN_COMPARISON,
    start_checkout: ANALYTICS_EVENTS.CHECKOUT_START,
    complete_payment: ANALYTICS_EVENTS.CHECKOUT_COMPLETE,
  };
  trackAnalyticsEvent(eventMap[step], { funnelStep: step, ...metadata });
}

/**
 * Track an export funnel event with privacy-safe metadata.
 * Only product ID, format, source page, auth/premium/credit state are sent.
 * Never sends document content, text, PDF, images, or sensitive user data.
 */
export function trackExportFunnel(
  event: AnalyticsEvent,
  metadata: {
    product: string;
    format: 'pdf' | 'docx' | 'html' | 'print';
    source: string;
    isPremium?: boolean;
    isFree?: boolean;
    status?: 'success' | 'error' | 'cancelled';
    [key: string]: unknown;
  },
): void {
  trackAnalyticsEvent(event, metadata);
}
