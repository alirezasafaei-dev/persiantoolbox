import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { validateObject, commonSchemas } from '@/lib/server/validation';
import { logger } from '@/lib/server/logger';
import { getPlanById, type PlanId } from '@/lib/subscriptionPlans';
import { createPaymentCheckout } from '@/lib/payments/payment-integration';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('subscription')) {
    return disabledApiResponse('subscription');
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, errors: ['درخواست از مبدأ نامعتبر است.'] },
      { status: 403 },
    );
  }

  const rateLimitKey = makeRateLimitKey('subscription:checkout', request);
  const rateLimitResult = await rateLimit(rateLimitKey, { limit: 5, windowMs: 60_000 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, errors: ['تعداد درخواست‌ها بیش از حد مجاز است.'] },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, errors: ['برای خرید اشتراک باید وارد شوید.'] },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const checkoutSchema = {
    planId: commonSchemas.name,
  };

  const validation = validateObject(checkoutSchema, body);
  if (!validation.success) {
    const errors = validation.errors.map((e) => e.message);
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const { planId } = validation.data as { planId: string };
  const plan = getPlanById(planId as PlanId);

  if (!plan) {
    return NextResponse.json({ ok: false, errors: ['طرح اشتراک نامعتبر است.'] }, { status: 400 });
  }

  try {
    const callbackUrl = new URL('/api/subscription/confirm', request.url).toString();
    const { payment, checkoutUrl } = await createPaymentCheckout(
      user.id,
      plan.price,
      'zarinpal',
      `اشتراک ${plan.title}`,
      callbackUrl,
      { planId: plan.id },
    );

    logger.info('Subscription checkout created', {
      userId: user.id,
      planId: plan.id,
      paymentId: payment.id,
    });

    return NextResponse.json({ ok: true, payUrl: checkoutUrl, checkoutUrl });
  } catch (error) {
    logger.error('Subscription checkout failed', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
    });
    return NextResponse.json(
      { ok: false, errors: ['خطا در ایجاد درخواست پرداخت.'] },
      { status: 500 },
    );
  }
}
