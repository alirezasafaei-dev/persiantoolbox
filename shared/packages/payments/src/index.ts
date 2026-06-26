export type {
  PaymentConfig,
  PaymentGatewayAdapter,
  PaymentResult,
  PaymentVerificationResult,
  CheckoutRequest,
  CheckoutResult,
  CallbackRequest,
  CallbackResult,
} from './types';
import { createZarinpalAdapter } from './adapters/zarinpal';
import { createMockAdapter } from './adapters/mock';
import type { PaymentConfig, PaymentGatewayAdapter } from './types';

export function createPaymentGatewayAdapter(
  config: PaymentConfig,
  method?: string,
): PaymentGatewayAdapter {
  const adapterMethod = method ?? (config.merchantId ? 'zarinpal' : 'mock');
  switch (adapterMethod) {
    case 'zarinpal':
      return createZarinpalAdapter(config);
    default:
      return createMockAdapter(config);
  }
}
