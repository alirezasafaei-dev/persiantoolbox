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

const REQUEST_TIMEOUT_MS = 10_000;

type ZarinpalData = {
  code?: number;
  authority?: string;
  amount?: number;
  ref_id?: string | number;
  [key: string]: unknown;
};

type ZarinpalResponse = {
  data?: ZarinpalData;
  errors?: { message?: string };
};

async function postJson(
  baseUrl: string,
  path: string,
  body: Record<string, unknown>,
): Promise<ZarinpalResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let payload: ZarinpalResponse;
  try {
    payload = (await response.json()) as ZarinpalResponse;
  } catch {
    throw new Error(`Zarinpal returned invalid JSON (${response.status})`);
  }

  if (!response.ok && !payload.data?.code) {
    throw new Error(payload.errors?.message ?? `Zarinpal HTTP ${response.status}`);
  }
  return payload;
}

export function createZarinpalAdapter(config: PaymentConfig): PaymentGatewayAdapter {
  const baseUrl = config.sandbox ? 'https://sandbox.zarinpal.com' : 'https://api.zarinpal.com';

  return {
    async createPayment(
      amount: number,
      description: string,
      metadata?: Record<string, unknown>,
    ): Promise<PaymentResult> {
      const response = await postJson(baseUrl, '/pg/v4/payment/request.json', {
        merchant_id: config.merchantId,
        amount,
        description,
        callback_url: config.callbackUrl,
        ...(metadata ? { metadata } : {}),
      });
      if (response.data?.code === 100 && typeof response.data.authority === 'string') {
        return {
          success: true,
          authority: response.data.authority,
          paymentUrl: `${baseUrl}/pg/StartPay/${response.data.authority}`,
        };
      }
      return { success: false, error: response.errors?.message ?? 'Zarinpal request failed' };
    },

    async verifyPayment(authority: string, amount: number): Promise<PaymentVerificationResult> {
      const response = await postJson(baseUrl, '/pg/v4/payment/verify.json', {
        merchant_id: config.merchantId,
        amount,
        authority,
      });
      if (response.data?.code === 100 || response.data?.code === 101) {
        return {
          success: true,
          ...(typeof response.data.amount === 'number' ? { amount: response.data.amount } : {}),
          ...(response.data.ref_id !== undefined ? { refId: String(response.data.ref_id) } : {}),
        };
      }
      return {
        success: false,
        error: response.errors?.message ?? 'Zarinpal verification failed',
      };
    },

    async createCheckout(request: CheckoutRequest): Promise<CheckoutResult> {
      const response = await postJson(baseUrl, '/pg/v4/payment/request.json', {
        merchant_id: config.merchantId,
        amount: request.amount,
        description: request.description,
        callback_url: request.callbackUrl,
      });
      if (response.data?.code === 100 && typeof response.data.authority === 'string') {
        return {
          redirectUrl: `${baseUrl}/pg/StartPay/${response.data.authority}`,
          gatewayRef: `zarinpal_${response.data.authority}`,
        };
      }
      throw new Error(response.errors?.message ?? 'Zarinpal checkout request failed');
    },

    async verifyCallback(request: CallbackRequest): Promise<CallbackResult> {
      const authority = request.payload['Authority'];
      const status = request.payload['Status'];
      if (!authority) {
        return { result: 'failed', raw: { error: 'Missing Authority in callback' } };
      }
      if (status !== 'OK') {
        return { result: 'failed', raw: { error: `Payment status: ${status ?? 'missing'}` } };
      }

      const amount = Number(request.payload['Amount']);
      if (!Number.isSafeInteger(amount) || amount <= 0) {
        return { result: 'failed', raw: { error: 'Invalid server-resolved amount' } };
      }

      const response = await postJson(baseUrl, '/pg/v4/payment/verify.json', {
        merchant_id: config.merchantId,
        amount,
        authority,
      });
      if (response.data?.code === 100 || response.data?.code === 101) {
        return {
          result: 'succeeded',
          paidAt: new Date().toISOString(),
          raw: response.data,
        };
      }
      return {
        result: 'failed',
        raw: {
          error: response.errors?.message ?? 'Zarinpal verification failed',
          ...(response.data ?? {}),
        },
      };
    },
  };
}
