import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { getCheckoutById, markCheckoutPaid } from '@/lib/server/checkouts';
import { createSubscription } from '@/lib/server/subscriptions';

export async function POST(request: Request) {
  const secret = process.env['SUBSCRIPTION_WEBHOOK_SECRET'];
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'WEBHOOK_DISABLED' }, { status: 501 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-pt-signature');
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'MISSING_SIGNATURE' }, { status: 401 });
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (signature !== expected) {
    return NextResponse.json({ ok: false, error: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  let payload: { checkoutId?: string; status?: 'paid' | 'failed' };
  try {
    payload = JSON.parse(rawBody) as { checkoutId?: string; status?: 'paid' | 'failed' };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!payload.checkoutId || payload.status !== 'paid') {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 422 });
  }

  const checkout = await getCheckoutById(payload.checkoutId);
  if (!checkout) {
    return NextResponse.json({ ok: false, error: 'CHECKOUT_NOT_FOUND' }, { status: 404 });
  }

  if (checkout.status !== 'paid') {
    await markCheckoutPaid(checkout.id);
  }

  const subscription = await createSubscription(checkout.userId, checkout.planId);
  return NextResponse.json({ ok: true, subscription });
}
