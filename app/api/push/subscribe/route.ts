import { NextResponse } from 'next/server';
import { savePushSubscription, removeExpiredSubscriptions } from '@/lib/server/push';
import { getUserFromRequest } from '@/lib/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, p256dh, auth } = body as {
      endpoint?: string;
      p256dh?: string;
      auth?: string;
    };

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: endpoint, p256dh, auth' },
        { status: 400 },
      );
    }

    const user = await getUserFromRequest(request);
    const userId = user?.id;

    await removeExpiredSubscriptions();

    const subscription = await savePushSubscription(endpoint, p256dh, auth, userId);

    return NextResponse.json({ ok: true, subscription });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
