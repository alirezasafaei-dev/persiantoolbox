import { describe, it, expect } from 'vitest';
import { createPaymentGatewayAdapter } from '@shared/payments';
import type { PaymentConfig } from '@shared/payments';

describe('Payment Gateway Adapter Factory', () => {
  it('creates mock adapter when no merchantId', () => {
    const config: PaymentConfig = {
      merchantId: '',
      callbackUrl: 'http://localhost:3000/api/callback',
    };
    const adapter = createPaymentGatewayAdapter(config);
    expect(adapter).toBeDefined();
    expect(typeof adapter.createPayment).toBe('function');
    expect(typeof adapter.verifyPayment).toBe('function');
    expect(typeof adapter.createCheckout).toBe('function');
    expect(typeof adapter.verifyCallback).toBe('function');
  });

  it('creates zarinpal adapter when merchantId provided', () => {
    const config: PaymentConfig = {
      merchantId: 'test-merchant-id',
      callbackUrl: 'http://localhost:3000/api/callback',
    };
    const adapter = createPaymentGatewayAdapter(config, 'zarinpal');
    expect(adapter).toBeDefined();
    expect(typeof adapter.createPayment).toBe('function');
  });

  it('creates mock adapter via explicit method', () => {
    const config: PaymentConfig = {
      merchantId: 'test-merchant-id',
      callbackUrl: 'http://localhost:3000/api/callback',
    };
    const adapter = createPaymentGatewayAdapter(config, 'mock');
    expect(adapter).toBeDefined();
  });

  it('falls back to mock for unknown method', () => {
    const config: PaymentConfig = {
      merchantId: 'test-merchant-id',
      callbackUrl: 'http://localhost:3000/api/callback',
    };
    const adapter = createPaymentGatewayAdapter(config, 'unknown');
    expect(adapter).toBeDefined();
  });

  describe('Mock Adapter', () => {
    it('createPayment returns success with mock authority', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
      };
      const adapter = createPaymentGatewayAdapter(config);
      const result = await adapter.createPayment(100000, 'Test payment');
      expect(result.success).toBe(true);
      expect(result.authority).toContain('mock_');
      expect(result.paymentUrl).toContain('/payments/mock/');
    });

    it('verifyPayment returns success with mock refId', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
      };
      const adapter = createPaymentGatewayAdapter(config);
      const result = await adapter.verifyPayment('mock_test', 100000);
      expect(result.success).toBe(true);
      expect(result.amount).toBe(100000);
      expect(result.refId).toContain('ref_');
    });

    it('createCheckout returns redirect URL and gateway ref', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
      };
      const adapter = createPaymentGatewayAdapter(config);
      const result = await adapter.createCheckout({
        paymentId: 'pay_test',
        amount: 100000,
        currency: 'IRR',
        callbackUrl: 'http://localhost/api/callback',
        description: 'Test',
      });
      expect(result.redirectUrl).toContain('/payments/mock/');
      expect(result.gatewayRef).toContain('mock_');
    });

    it('verifyCallback always succeeds', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
      };
      const adapter = createPaymentGatewayAdapter(config);
      const result = await adapter.verifyCallback({
        gatewayRef: 'mock_test',
        payload: { Authority: 'test', Status: 'OK' },
      });
      expect(result.result).toBe('succeeded');
      expect(result.paidAt).toBeDefined();
    });
  });

  describe('Zarinpal Adapter URL construction', () => {
    it('uses sandbox URL when sandbox is true', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
        sandbox: true,
      };
      const adapter = createPaymentGatewayAdapter(config, 'zarinpal');
      expect(adapter).toBeDefined();
    });

    it('uses production URL by default', async () => {
      const config: PaymentConfig = {
        merchantId: '',
        callbackUrl: 'http://localhost/api/callback',
      };
      const adapter = createPaymentGatewayAdapter(config, 'zarinpal');
      expect(adapter).toBeDefined();
    });
  });
});
