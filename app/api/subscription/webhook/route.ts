import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getCheckoutById, markCheckoutPaid } from '@/lib/server/checkouts';
import { createSubscription } from '@/lib/server/subscriptions';

const replayCache = new Map<string, number>();
const DEFAULT_MAX_SKEW_SECONDS = 300;
const DEFAULT_REPLAY_WINDOW_SECONDS = 600;

function safeSignatureMatch(signature: string, expectedHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const provided = Buffer.from(signature, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return fallback;
  }
  return Math.floor(n);
}

function validateEventId(eventId: string): boolean {
  return /^[A-Za-z0-9._:-]{8,128}$/.test(eventId);
}

function cleanupReplayCache(nowSec: number): void {
  for (const [eventId, expireAt] of replayCache.entries()) {
    if (expireAt <= nowSec) {
      replayCache.delete(eventId);
    }
  }
}

export function __resetWebhookReplayCacheForTests(): void {
  replayCache.clear();
}

export async function POST(request: Request) {
  const secret = process.env['SUBSCRIPTION_WEBHOOK_SECRET'];
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'WEBHOOK_DISABLED' }, { status: 501 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-pt-signature');
  const eventId = request.headers.get('x-pt-event-id');
  const timestampHeader = request.headers.get('x-pt-timestamp');
  if (!signature) {
    return NextResponse.json({ ok: false, error: 'MISSING_SIGNATURE' }, { status: 401 });
  }
  if (!eventId || !timestampHeader) {
    return NextResponse.json({ ok: false, error: 'MISSING_EVENT_METADATA' }, { status: 401 });
  }
  if (!validateEventId(eventId)) {
    return NextResponse.json({ ok: false, error: 'INVALID_EVENT_ID' }, { status: 400 });
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!safeSignatureMatch(signature, expected)) {
    return NextResponse.json({ ok: false, error: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  const requestTimestamp = Number(timestampHeader);
  if (!Number.isFinite(requestTimestamp)) {
    return NextResponse.json({ ok: false, error: 'INVALID_TIMESTAMP' }, { status: 400 });
  }

  const maxSkewSeconds = parsePositiveInt(
    process.env['SUBSCRIPTION_WEBHOOK_MAX_SKEW_SECONDS'],
    DEFAULT_MAX_SKEW_SECONDS,
  );
  const replayWindowSeconds = parsePositiveInt(
    process.env['SUBSCRIPTION_WEBHOOK_REPLAY_WINDOW_SECONDS'],
    DEFAULT_REPLAY_WINDOW_SECONDS,
  );
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - Math.floor(requestTimestamp)) > maxSkewSeconds) {
    return NextResponse.json({ ok: false, error: 'STALE_SIGNATURE' }, { status: 401 });
  }

  cleanupReplayCache(nowSec);
  if (replayCache.has(eventId)) {
    return NextResponse.json({ ok: false, error: 'REPLAY_DETECTED' }, { status: 409 });
  }
  replayCache.set(eventId, nowSec + replayWindowSeconds);

  let payload: { checkoutId?: string; status?: 'paid' | 'failed' };
  try {
    payload = JSON.parse(rawBody) as { checkoutId?: string; status?: 'paid' | 'failed' };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!payload.checkoutId || payload.status !== 'paid') {
    return NextResponse.json({ ok: false, error: 'INVALID_PAYLOAD' }, { status: 422 });
  }

  const checkout = await getCheckoutById(payload.checkoutId);
  if (!checkout) {
    return NextResponse.json({ ok: false, error: 'CHECKOUT_NOT_FOUND' }, { status: 404 });
  }

  if (checkout.status === 'paid') {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await markCheckoutPaid(checkout.id);

  const subscription = await createSubscription(checkout.userId, checkout.planId);
  return NextResponse.json({ ok: true, subscription });
}
