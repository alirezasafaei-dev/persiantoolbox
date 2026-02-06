import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/server/subscriptions';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    subscription,
  });
}
