import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { query } from '@/lib/server/db';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();

    const result = await query(
      `UPDATE subscriptions
       SET status = 'cancelled'
       WHERE user_id = $1 AND status = 'active' AND expires_at > $2
       RETURNING id`,
      [user.id, now],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { ok: false, error: 'اشتراک فعالی برای لغو وجود ندارد.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, message: 'اشتراک با موفقیت لغو شد.' });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      },
      { status: 500 },
    );
  }
}
