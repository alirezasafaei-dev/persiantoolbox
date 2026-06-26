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

export interface CheckoutRequest {
  paymentId: string;
  amount: number;
  currency: string;
  callbackUrl: string;
  description: string;
}

export interface CheckoutResult {
  redirectUrl: string;
  gatewayRef: string;
}

export interface CallbackRequest {
  gatewayRef: string;
  payload: Record<string, string | undefined>;
  headers?: Record<string, string | undefined>;
}

export interface CallbackResult {
  result: 'succeeded' | 'failed' | 'pending';
  paidAt?: string;
  raw?: Record<string, unknown>;
}

export interface PaymentGatewayAdapter {
  createPayment(
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentResult>;
  verifyPayment(authority: string, amount: number): Promise<PaymentVerificationResult>;
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  verifyCallback(request: CallbackRequest): Promise<CallbackResult>;
}
