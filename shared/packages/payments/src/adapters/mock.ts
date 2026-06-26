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

export function createMockAdapter(_config: PaymentConfig): PaymentGatewayAdapter {
  return {
    async createPayment(_amount: number, _description: string): Promise<PaymentResult> {
      const authority = `mock_${Date.now()}`;
      return { success: true, authority, paymentUrl: `/payments/mock/${authority}` };
    },
    async verifyPayment(_authority: string, amount: number): Promise<PaymentVerificationResult> {
      return { success: true, amount, refId: `ref_${Date.now()}` };
    },
    async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
      const authority = `mock_${Date.now()}`;
      return {
        redirectUrl: `/payments/mock/${authority}?callback=${encodeURIComponent(request.callbackUrl)}`,
        gatewayRef: `mock_${authority}`,
      };
    },
    async verifyCallback(_request: CallbackRequest): Promise<CallbackResult> {
      return {
        result: 'succeeded',
        paidAt: new Date().toISOString(),
        raw: { ref_id: `mock_ref_${Date.now()}` },
      };
    },
  };
}
