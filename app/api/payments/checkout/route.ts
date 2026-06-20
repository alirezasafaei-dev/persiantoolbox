/**
 * Payment Checkout API Route
 * Creates a payment and returns checkout URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentCheckout } from '@/lib/payments/payment-integration';
import { getUserFromRequest } from '@/lib/server/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method, description } = body;

    if (!amount || !method || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, method, description' },
        { status: 400 },
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate method
    const validMethods = ['zarinpal', 'idpay', 'nextpay', 'wallet'];
    if (!validMethods.includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Create callback URL
    const callbackUrl = `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://persiantoolbox.ir'}/api/payments/callback`;

    // Create payment checkout
    const { payment, checkoutUrl } = await createPaymentCheckout(
      user.id,
      amount,
      method,
      description,
      callbackUrl,
      { userId: user.id },
    );

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
    });
  } catch (error) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment checkout failed' },
      { status: 500 },
    );
  }
}
