import { NextResponse } from 'next/server';
import { removePushSubscription } from '@/lib/server/push';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body as { endpoint?: string };

    if (!endpoint) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: endpoint' },
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
