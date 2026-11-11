import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPaymentGatewayAdapter, type PaymentConfig } from '@shared/payments';

// Public integration contract, checked against Zarinpal's connection guide on 2026-11-11:
// https://www.zarinpal.com/docs/paymentGateway/connectToGateway
const authority = 'A00000000000000000000000000000000001';
const callbackUrl = 'https://example.test/api/payments/callback';
const subscriptionCallbackUrl = 'https://example.test/api/subscription/confirm';

describe.each([
  { label: 'production by default', sandbox: undefined, host: 'https://payment.zarinpal.com' },
  { label: 'explicit production', sandbox: false, host: 'https://payment.zarinpal.com' },
  { label: 'sandbox', sandbox: true, host: 'https://sandbox.zarinpal.com' },
])('Zarinpal endpoints: $label', ({ sandbox, host }) => {
  const fetchMock = vi.fn<typeof fetch>();
  const config: PaymentConfig = {
    merchantId: 'test-merchant-id',
    callbackUrl,
    ...(sandbox === undefined ? {} : { sandbox }),
  };

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { code: 100, authority, ref_id: 1234 }, errors: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  function expectRequest(path: string, body: Record<string, unknown>) {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${host}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: expect.any(AbortSignal),
    });
  }

  it('creates a payment with a StartPay URL that retains its authority', async () => {
    const result = await createPaymentGatewayAdapter(config, 'zarinpal').createPayment(
      490000,
      'Test payment',
    );

    expect(result).toEqual({
      success: true,
      authority,
      paymentUrl: `${host}/pg/StartPay/${authority}`,
    });
    expectRequest('/pg/v4/payment/request.json', {
      merchant_id: config.merchantId,
      amount: 490000,
      description: 'Test payment',
      callback_url: callbackUrl,
    });
  });

  it('creates a checkout with the subscription callback and a usable payment destination', async () => {
    const result = await createPaymentGatewayAdapter(config, 'zarinpal').createCheckout({
      paymentId: 'test-payment',
      amount: 490000,
      currency: 'IRR',
      callbackUrl: subscriptionCallbackUrl,
      description: 'Test checkout',
    });

    expect(result).toEqual({
      redirectUrl: `${host}/pg/StartPay/${authority}`,
      gatewayRef: `zarinpal_${authority}`,
    });
    expectRequest('/pg/v4/payment/request.json', {
      merchant_id: config.merchantId,
      amount: 490000,
      description: 'Test checkout',
      callback_url: subscriptionCallbackUrl,
    });
  });

  it('verifies a payment at the matching verification endpoint', async () => {
    const result = await createPaymentGatewayAdapter(config, 'zarinpal').verifyPayment(
      authority,
      490000,
    );

    expect(result).toEqual({ success: true, refId: '1234' });
    expectRequest('/pg/v4/payment/verify.json', {
      merchant_id: config.merchantId,
      amount: 490000,
      authority,
    });
  });

  it('verifies callbacks using the server-resolved amount at the matching endpoint', async () => {
    const result = await createPaymentGatewayAdapter(config, 'zarinpal').verifyCallback({
      gatewayRef: `zarinpal_${authority}`,
      payload: { Authority: authority, Status: 'OK', Amount: '490000' },
    });

    expect(result.result).toBe('succeeded');
    expect(result.raw?.['ref_id']).toBe(1234);
    expectRequest('/pg/v4/payment/verify.json', {
      merchant_id: config.merchantId,
      amount: 490000,
      authority,
    });
  });
});
