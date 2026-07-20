import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyPaymentCallback } from '@/lib/payments/payment-verification';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidAuthority(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

function publicFailureMessage(error: string | undefined): string {
  if (error === 'Payment not found') return 'پرداخت موردنظر پیدا نشد.';
  if (error === 'Payment pending') return 'پرداخت هنوز در انتظار تأیید است.';
  if (error?.includes('reconciliation')) return 'پرداخت برای بررسی امن ثبت شد.';
  return 'تأیید پرداخت ناموفق بود.';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gatewayRef = searchParams.get('gatewayRef') ?? searchParams.get('Authority');

    if (!isValidAuthority(gatewayRef)) {
      return NextResponse.json(
        { ok: false, error: 'مرجع درگاه پرداخت نامعتبر است.' },
        { status: 400 },
      );
    }

    const payload: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const result = await verifyPaymentCallback(gatewayRef, payload, headers);
    if (result.success) {
      return NextResponse.redirect(
        new URL(`/payments/success?paymentId=${encodeURIComponent(result.payment?.id ?? '')}`, request.url),
      );
    }

    const message = publicFailureMessage(result.error);
    return NextResponse.redirect(
      new URL(`/payments/failure?error=${encodeURIComponent(message)}`, request.url),
    );
  } catch (error) {
    logger.error('Payment callback error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(
      new URL(
        `/payments/failure?error=${encodeURIComponent('خطا در پردازش callback.')}`,
        request.url,
      ),
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const gatewayRef = body['gatewayRef'] ?? body['Authority'];

    if (!isValidAuthority(gatewayRef)) {
      return NextResponse.json(
        { ok: false, error: 'مرجع درگاه پرداخت نامعتبر است.' },
        { status: 400 },
      );
    }

    const payload: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') payload[key] = value;
    }

    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const result = await verifyPaymentCallback(gatewayRef, payload, headers);
    if (result.success) {
      return NextResponse.json({ ok: true, payment: result.payment });
    }

    return NextResponse.json(
      { ok: false, error: publicFailureMessage(result.error) },
      { status: result.error === 'Payment not found' ? 404 : 400 },
    );
  } catch (error) {
    logger.error('Payment callback error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'خطا در پردازش callback.' }, { status: 500 });
  }
}
