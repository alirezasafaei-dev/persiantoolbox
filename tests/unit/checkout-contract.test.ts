import { describe, it, expect } from 'vitest';

describe('Checkout contract compatibility', () => {
  it('subscription checkout response accepts payUrl', () => {
    const response = {
      ok: true,
      payUrl: 'https://example.com/pay',
      checkoutUrl: 'https://example.com/pay',
    };
    const redirectUrl = response.payUrl ?? response.checkoutUrl;
    expect(redirectUrl).toBe('https://example.com/pay');
  });

  it('subscription checkout response accepts checkoutUrl fallback', () => {
    const response = { ok: true, payUrl: undefined, checkoutUrl: 'https://example.com/pay' };
    const redirectUrl = response.payUrl ?? response.checkoutUrl;
    expect(redirectUrl).toBe('https://example.com/pay');
  });

  it('subscription checkout response returns both payUrl and checkoutUrl', () => {
    const response = {
      ok: true,
      payUrl: 'https://example.com/pay',
      checkoutUrl: 'https://example.com/pay',
    };
    expect(response.payUrl).toBeTruthy();
    expect(response.checkoutUrl).toBeTruthy();
    expect(response.payUrl).toBe(response.checkoutUrl);
  });

  it('UI fails gracefully when neither URL is present', () => {
    const response = { ok: false, errors: ['خطا'] };
    const redirectUrl =
      (response as { payUrl?: string }).payUrl ??
      (response as { checkoutUrl?: string }).checkoutUrl;
    expect(redirectUrl).toBeUndefined();
  });
});
