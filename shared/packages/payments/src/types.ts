export interface PaymentConfig {
  merchantId: string;
  callbackUrl: string;
  sandbox?: boolean;
}

export interface PaymentResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  amount?: number;
  refId?: string;
  error?: string;
}

export interface PaymentGatewayAdapter {
  createPayment(
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentResult>;
  verifyPayment(authority: string, amount: number): Promise<PaymentVerificationResult>;
}
