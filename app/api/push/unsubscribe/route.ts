import { NextResponse } from 'next/server';
import { removePushSubscription } from '@/lib/server/push';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export async function POST(request: Request) {
  try {
    const rateLimitKey = makeRateLimitKey('push:unsubscribe', request);
    const rateLimitResult = await rateLimit(rateLimitKey, { limit: 10, windowMs: 60_000 });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { endpoint } = body as { endpoint?: string };

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: endpoint' },
        { status: 400 },
      );
    }

    if (!endpoint.startsWith('https://fcm.googleapis.com/fcm/send/') && !endpoint.startsWith('https://fcm-registrar.googleapis.com/')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid push subscription endpoint' },
        { status: 400 },
      );
    }

    const removed = await removePushSubscription(endpoint);

    return NextResponse.json({ ok: true, removed });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
