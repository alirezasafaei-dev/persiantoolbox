import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getActiveSubscription } from '@/lib/server/subscriptions';
import { addHistoryEntry, clearHistory, listHistoryEntries } from '@/lib/server/history';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? '50');
  const limit = Number.isFinite(limitParam) ? Math.min(limitParam, 200) : 50;

  const entries = await listHistoryEntries(user.id, limit);
  return NextResponse.json({ ok: true, entries });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 });
  }

  let body: {
    tool?: string;
    inputSummary?: string;
    outputSummary?: string;
    outputUrl?: string;
  };
  try {
    body = (await request.json()) as {
      tool?: string;
      inputSummary?: string;
      outputSummary?: string;
      outputUrl?: string;
    };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!body.tool || !body.inputSummary || !body.outputSummary) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 422 });
  }

  const entry = await addHistoryEntry(user.id, {
    tool: body.tool,
    inputSummary: body.inputSummary,
    outputSummary: body.outputSummary,
    outputUrl: body.outputUrl ?? '',
  });

  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 });
  }

  await clearHistory(user.id);
  return NextResponse.json({ ok: true });
}
