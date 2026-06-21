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
      return NextResponse.json({ error: 'Missing gateway reference' }, { status: 400 });
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
      // Redirect to success page
      return NextResponse.redirect(
        new URL(`/payments/success?paymentId=${result.payment?.id}`, request.url),
      );
    } else {
      // Redirect to failure page
      return NextResponse.redirect(
        new URL(
          `/payments/failure?error=${encodeURIComponent(result.error ?? 'Payment failed')}`,
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
        `/payments/failure?error=${encodeURIComponent('Callback processing failed')}`,
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
      return NextResponse.json({ error: 'Missing gateway reference' }, { status: 400 });
    }

    // Get headers
    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify payment
    const result = await verifyPaymentCallback(gatewayRef, body, headers);

    if (result.success) {
      return NextResponse.json({ success: true, payment: result.payment });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    logger.error('Payment callback error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Callback processing failed' },
      { status: 500 },
    );
  }
}
