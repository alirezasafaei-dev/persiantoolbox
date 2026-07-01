import { afterEach, describe, expect, it } from 'vitest';
import {
  resolvePaymentBaseUrl,
  resolvePaymentsCallbackUrl,
  resolveSiteUrl,
  resolveSubscriptionConfirmUrl,
} from '@/lib/payments/payment-urls';

const ENV_KEYS = [
  'NEXT_PUBLIC_SITE_URL',
  'PAYMENT_BASE_URL',
  'ZARINPAL_CALLBACK_URL',
  'ZARINPAL_SUBSCRIPTION_CALLBACK_URL',
] as const;

describe('payment-urls', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it('uses defaults when env is unset', () => {
    expect(resolveSiteUrl()).toBe('https://persiantoolbox.ir');
    expect(resolvePaymentBaseUrl()).toBe('https://pay.persiantoolbox.ir');
    expect(resolvePaymentsCallbackUrl()).toBe('https://persiantoolbox.ir/api/payments/callback');
    expect(resolveSubscriptionConfirmUrl()).toBe(
      'https://persiantoolbox.ir/api/subscription/confirm',
    );
  });

  it('respects explicit callback overrides', () => {
    process.env['ZARINPAL_CALLBACK_URL'] = 'https://example.test/api/payments/callback';
    process.env['ZARINPAL_SUBSCRIPTION_CALLBACK_URL'] =
      'https://example.test/api/subscription/confirm';

    expect(resolvePaymentsCallbackUrl()).toBe('https://example.test/api/payments/callback');
    expect(resolveSubscriptionConfirmUrl()).toBe('https://example.test/api/subscription/confirm');
  });

  it('builds subscription confirm URL from request origin', () => {
    expect(resolveSubscriptionConfirmUrl('https://persiantoolbox.ir/pricing')).toBe(
      'https://persiantoolbox.ir/api/subscription/confirm',
    );
  });
});
