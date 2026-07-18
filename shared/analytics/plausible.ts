import type { AnalyticsEvent } from '@/shared/analytics/events';
import { ANALYTICS_EVENTS } from '@/shared/analytics/events';
import { isPlausiblePilotEnabled } from '@/lib/analytics/plausibleConfig';
import { readAnalyticsConsent } from '@/shared/consent/analyticsConsent';

type PlausibleOptions = {
  props?: Record<string, string>;
  url?: string;
};

type PlausibleFunction = {
  (event: string, options?: PlausibleOptions): void;
  init?: (options?: Record<string, unknown>) => void;
  o?: Record<string, unknown>;
  q?: unknown[][];
};

declare global {
  interface Window {
    plausible?: PlausibleFunction;
  }
}

const EVENT_MAP: Partial<Record<AnalyticsEvent, string>> = {
  [ANALYTICS_EVENTS.TOOL_RUN]: 'Tool Start',
  [ANALYTICS_EVENTS.TOOL_RESULT_VIEW]: 'Tool Complete',
  [ANALYTICS_EVENTS.EXPORT_CONFIRM]: 'Result Export',
  [ANALYTICS_EVENTS.BLOG_ARTICLE_VIEW]: 'Article View',
  [ANALYTICS_EVENTS.CTA_CLICK]: 'CTA Click',
  [ANALYTICS_EVENTS.CHECKOUT_START]: 'Checkout Start',
  [ANALYTICS_EVENTS.PAYMENT_SUCCESS]: 'Payment Success',
};

const SAFE_PROPERTY_KEYS = new Set([
  'category',
  'format',
  'isFree',
  'isPremium',
  'location',
  'product',
  'source',
  'status',
  'toolId',
  'tool_id',
]);

const SAFE_STRING_VALUE = /^[a-zA-Z0-9_:/.-]{1,80}$/;

const ALLOWED_ATTRIBUTION_PARAMS = [
  'ref',
  'source',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export function buildPlausiblePageUrl(pathname: string, currentUrl: string): string {
  const current = new URL(currentUrl);
  const url = new URL(pathname, current.origin);
  for (const key of ALLOWED_ATTRIBUTION_PARAMS) {
    const value = current.searchParams.get(key);
    if (value) {
      url.searchParams.set(key, value.slice(0, 120));
    }
  }
  return url.toString();
}

export function sanitizePlausibleProperties(
  metadata: Record<string, unknown> | undefined,
): Record<string, string> | undefined {
  if (!metadata) {
    return undefined;
  }

  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!SAFE_PROPERTY_KEYS.has(key)) {
      continue;
    }
    if (typeof value === 'boolean') {
      props[key] = String(value);
      continue;
    }
    if (typeof value === 'string' && SAFE_STRING_VALUE.test(value)) {
      props[key] = value;
    }
  }
  return Object.keys(props).length > 0 ? props : undefined;
}

export function trackPlausibleEvent(
  event: AnalyticsEvent,
  metadata?: Record<string, unknown>,
): void {
  if (
    typeof window === 'undefined' ||
    !isPlausiblePilotEnabled() ||
    readAnalyticsConsent()?.analytics_storage !== true
  ) {
    return;
  }

  const plausibleEvent = EVENT_MAP[event];
  if (!plausibleEvent || typeof window.plausible !== 'function') {
    return;
  }

  const props = sanitizePlausibleProperties(metadata);
  window.plausible(plausibleEvent, props ? { props } : undefined);
}
