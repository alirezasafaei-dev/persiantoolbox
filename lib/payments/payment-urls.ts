const DEFAULT_SITE_URL = 'https://persiantoolbox.ir';
const DEFAULT_PAY_DOMAIN = 'https://pay.persiantoolbox.ir';

/** Canonical public site URL (callbacks and redirects). */
export function resolveSiteUrl(): string {
  return process.env['NEXT_PUBLIC_SITE_URL'] ?? DEFAULT_SITE_URL;
}

/**
 * Zarinpal verified pay subdomain (DNS CNAME → zpc.zarinpal.com).
 * Used for merchant panel domain verification and payment branding.
 */
export function resolvePaymentBaseUrl(): string {
  return process.env['PAYMENT_BASE_URL'] ?? DEFAULT_PAY_DOMAIN;
}

export function resolvePaymentsCallbackUrl(): string {
  return process.env['ZARINPAL_CALLBACK_URL'] ?? `${resolveSiteUrl()}/api/payments/callback`;
}

export function resolveSubscriptionConfirmUrl(requestUrl?: string | URL): string {
  if (requestUrl) {
    return new URL('/api/subscription/confirm', requestUrl).toString();
  }
  return (
    process.env['ZARINPAL_SUBSCRIPTION_CALLBACK_URL'] ??
    `${resolveSiteUrl()}/api/subscription/confirm`
  );
}
