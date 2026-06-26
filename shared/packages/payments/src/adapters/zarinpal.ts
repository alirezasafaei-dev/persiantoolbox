import type {
  PaymentConfig,
  PaymentGatewayAdapter,
  PaymentResult,
  PaymentVerificationResult,
  CheckoutRequest,
  CheckoutResult,
  CallbackRequest,
  CallbackResult,
} from '../types';

export function createZarinpalAdapter(config: PaymentConfig): PaymentGatewayAdapter {
  const baseUrl = config.sandbox ? 'https://sandbox.zarinpal.com' : 'https://api.zarinpal.com';

  return {
    async createPayment(amount: number, description: string): Promise<PaymentResult> {
      const response = await fetch(`${baseUrl}/pg/v4/payment/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: config.merchantId,
          amount: amount,
          description: description,
          callback_url: config.callbackUrl,
          metadata: { email: 'user@persiantoolbox.ir' },
        }),
      });
      const data = await response.json();
      if (data.data?.code === 100) {
        const payUrl = `${baseUrl}/pg/StartPay/${data.data.authority}`;
        return { success: true, authority: data.data.authority, paymentUrl: payUrl };
      }
      return { success: false, error: data.errors?.message ?? 'Zarinpal request failed' };
    },

    async verifyPayment(authority: string, amount: number): Promise<PaymentVerificationResult> {
      const response = await fetch(`${baseUrl}/pg/v4/payment/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: config.merchantId,
          amount: amount,
          authority: authority,
        }),
      });
      const data = await response.json();
      if (data.data?.code === 100 || data.data?.code === 101) {
        return { success: true, amount: data.data.amount, refId: data.data.ref_id };
      }
      return { success: false, error: data.errors?.message ?? 'Zarinpal verification failed' };
    },

    async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
      const response = await fetch(`${baseUrl}/pg/v4/payment/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: config.merchantId,
          amount: request.amount,
          description: request.description,
          callback_url: request.callbackUrl,
          metadata: { email: 'user@persiantoolbox.ir' },
        }),
      });
      const data = await response.json();
      if (data.data?.code === 100) {
        const redirectUrl = `${baseUrl}/pg/StartPay/${data.data.authority}`;
        return { redirectUrl, gatewayRef: `zarinpal_${data.data.authority}` };
      }
      throw new Error(data.errors?.message ?? 'Zarinpal checkout request failed');
    },

    async verifyCallback(request: CallbackRequest): Promise<CallbackResult> {
      const authority = request.payload['Authority'];
      const status = request.payload['Status'];

      if (!authority) {
        return { result: 'failed', raw: { error: 'Missing Authority in callback' } };
      }

      if (status !== 'OK') {
        return { result: 'failed', raw: { error: `Payment status: ${status}` } };
      }

      const amountStr = request.payload['Amount'];
      const amount = amountStr ? parseInt(amountStr, 10) : 0;

      const response = await fetch(`${baseUrl}/pg/v4/payment/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: config.merchantId,
          amount,
          authority,
        }),
      });
      const data = await response.json();

      if (data.data?.code === 100 || data.data?.code === 101) {
        return {
          result: 'succeeded',
          paidAt: new Date().toISOString(),
          raw: data.data,
        };
      }
      return {
        result: 'failed',
        raw: { error: data.errors?.message ?? 'Zarinpal verification failed', ...data.data },
      };
    },
  };
}
