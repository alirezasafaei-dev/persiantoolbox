import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { isSameOrigin } from '@/lib/server/csrf';
import { getActiveSubscription } from '@/lib/server/subscriptions';
import { createHistoryShareLink } from '@/lib/server/historyShare';
import { normalizeShareExpiryHours } from '@/shared/history/share';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';

type ShareRequest = {
  entryId?: string;
  expiresInHours?: number;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'INVALID_ORIGIN' }, { status: 403 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const limiter = await rateLimit(makeRateLimitKey('history:share', request, user.id), {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, error: 'RATE_LIMITED', resetAt: limiter.resetAt },
      { status: 429 },
    );
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 });
  }

  let body: ShareRequest;
  try {
    body = (await request.json()) as ShareRequest;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!body.entryId) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 422 });
  }

  const expiresInHours = normalizeShareExpiryHours(body.expiresInHours);
  const result = await createHistoryShareLink(user.id, body.entryId, expiresInHours);
  if (!result) {
    return NextResponse.json({ ok: false, error: 'OUTPUT_UNAVAILABLE' }, { status: 404 });
  }

  const shareUrl = `/api/history/share/${result.link.token}`;
  return NextResponse.json({
    ok: true,
    shareUrl,
    expiresAt: result.link.expiresAt,
  });
}
