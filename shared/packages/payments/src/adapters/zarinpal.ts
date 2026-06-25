import type {
  PaymentConfig,
  PaymentGatewayAdapter,
  PaymentResult,
  PaymentVerificationResult,
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
  };
}
