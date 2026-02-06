import { NextResponse } from 'next/server';
import {
  getAnalyticsSummary,
  ingestAnalyticsEvents,
  type AnalyticsEvent,
} from '@/lib/analyticsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyticsPayload = {
  id?: string;
  events?: AnalyticsEvent[];
};

export async function POST(request: Request) {
  let payload: AnalyticsPayload;
  try {
    payload = (await request.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const analyticsId = process.env['NEXT_PUBLIC_ANALYTICS_ID'];
  if (!analyticsId) {
    return NextResponse.json({ ok: false, disabled: true }, { status: 400 });
  }

  if (!payload?.id || payload.id !== analyticsId || !Array.isArray(payload.events)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const summary = await ingestAnalyticsEvents(payload.events);
  return NextResponse.json({ ok: true, summary });
}

export async function GET() {
  const summary = await getAnalyticsSummary();
  return NextResponse.json({ ok: true, summary });
}
