import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getCheckoutById, markCheckoutPaid } from '@/lib/server/checkouts';
import { createSubscription, getActiveSubscription } from '@/lib/server/subscriptions';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: { checkoutId?: string };
  try {
    body = (await request.json()) as { checkoutId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!body.checkoutId) {
    return NextResponse.json({ ok: false, error: 'INVALID_CHECKOUT' }, { status: 422 });
  }

  const checkout = await getCheckoutById(body.checkoutId);
  if (!checkout || checkout.userId !== user.id) {
    return NextResponse.json({ ok: false, error: 'CHECKOUT_NOT_FOUND' }, { status: 404 });
  }

  if (checkout.status === 'paid') {
    const current = await getActiveSubscription(user.id);
    return NextResponse.json({ ok: true, subscription: current });
  }

  const updated = await markCheckoutPaid(checkout.id);
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'CHECKOUT_NOT_FOUND' }, { status: 404 });
  }

  const subscription = await createSubscription(user.id, updated.planId);
  return NextResponse.json({ ok: true, subscription });
}
