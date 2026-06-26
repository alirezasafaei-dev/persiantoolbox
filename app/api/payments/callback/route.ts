/**
 * Payment Callback API Route
 * Handles payment gateway callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentCallback } from '@/lib/payments/payment-integration';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gatewayRef = searchParams.get('gatewayRef') ?? searchParams.get('Authority') ?? '';

    if (!gatewayRef) {
      return NextResponse.json(
        { ok: false, error: 'مرجع درگاه پرداخت وارد نشده است.' },
        { status: 400 },
      );
    }

    // Collect all parameters as payload
    const payload: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    // Get headers
    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify payment
    const result = await verifyPaymentCallback(gatewayRef, payload, headers);

    if (result.success) {
      return NextResponse.redirect(
        new URL(`/payments/success?paymentId=${result.payment?.id}`, request.url),
      );
    } else {
      return NextResponse.redirect(
        new URL(
          `/payments/failure?error=${encodeURIComponent(result.error ?? 'پرداخت ناموفق بود.')}`,
          request.url,
        ),
      );
    }
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
    const body = await request.json();
    const gatewayRef = body.gatewayRef ?? body.Authority ?? '';

    if (!gatewayRef) {
      return NextResponse.json(
        { ok: false, error: 'مرجع درگاه پرداخت وارد نشده است.' },
        { status: 400 },
      );
    }

    // Get headers
    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify payment
    const result = await verifyPaymentCallback(gatewayRef, body, headers);

    if (result.success) {
      return NextResponse.json({ ok: true, payment: result.payment });
    } else {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'پرداخت ناموفق بود.' },
        { status: 400 },
      );
    }
  } catch (error) {
    logger.error('Payment callback error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا در پردازش callback.' },
      { status: 500 },
    );
  }
}
