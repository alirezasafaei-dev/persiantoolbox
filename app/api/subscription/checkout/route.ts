import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { createCheckout } from '@/lib/server/checkouts';
import { getPlanById, type PlanId } from '@/lib/subscriptionPlans';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  let body: { planId?: PlanId };
  try {
    body = (await request.json()) as { planId?: PlanId };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!body.planId || !getPlanById(body.planId)) {
    return NextResponse.json({ ok: false, error: 'INVALID_PLAN' }, { status: 422 });
  }

  const checkout = await createCheckout(user.id, body.planId);
  return NextResponse.json({
    ok: true,
    checkoutId: checkout.id,
    payUrl: `/checkout/${checkout.id}`,
  });
}
