import { NextResponse } from 'next/server';
import { broadcastPushNotification, sendPushNotificationToUser } from '@/lib/server/push';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logger } from '@/lib/server/logger';

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdminFromRequest(request);

    if (!adminCheck.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: adminCheck.status === 401 ? 'Authentication required' : 'Admin access required',
        },
        { status: adminCheck.status },
      );
    }

    const body = await request.json();
    const {
      title,
      body: messageBody,
      icon,
      url,
      userId,
    } = body as {
      title?: string;
      body?: string;
      icon?: string;
      url?: string;
      userId?: string;
    };

    if (!title || !messageBody) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: title, body' },
        { status: 400 },
      );
    }

    const payload = JSON.stringify({
      title,
      body: messageBody,
      icon: icon ?? '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      url: url ?? '/',
      timestamp: Date.now(),
    });

    let result;
    if (userId) {
      const sendResult = await sendPushNotificationToUser(userId, payload);
      result = { sent: sendResult.sent, failed: sendResult.failed, removed: 0 };
    } else {
      result = await broadcastPushNotification(payload);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error('Push send error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
