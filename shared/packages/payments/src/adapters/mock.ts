import type {
  PaymentConfig,
  PaymentGatewayAdapter,
  PaymentResult,
  PaymentVerificationResult,
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
  };
}
