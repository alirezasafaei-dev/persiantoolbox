import { NextResponse } from 'next/server';
import {
  getAnalyticsSummary,
  ingestAnalyticsEvents,
  type AnalyticsEvent,
} from '@/lib/analyticsStore';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyticsPayload = {
  id?: string;
  events?: AnalyticsEvent[];
};

const MAX_EVENTS_PER_REQUEST = 200;

function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

function getIngestSecret(): string {
  return process.env['ANALYTICS_INGEST_SECRET'] ?? '';
}

function analyticsFeatureEnabled(): boolean {
  return Boolean(process.env['NEXT_PUBLIC_ANALYTICS_ID']);
}

function validateAnalyticsSecurity(request: Request): NextResponse | null {
  if (!analyticsFeatureEnabled()) {
    return NextResponse.json({ ok: false, disabled: true }, { status: 400 });
  }

  if (!isProduction()) {
    return null;
  }

  const secret = getIngestSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, disabled: true, reason: 'SECRET_REQUIRED' },
      { status: 503 },
    );
  }

  const headerSecret = request.headers.get('x-pt-analytics-secret');
  if (!headerSecret || headerSecret !== secret) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return null;
}

export async function POST(request: Request) {
  const securityError = validateAnalyticsSecurity(request);
  if (securityError) {
    return securityError;
  }

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

  if (payload.events.length > MAX_EVENTS_PER_REQUEST) {
    return NextResponse.json({ ok: false, reason: 'TOO_MANY_EVENTS' }, { status: 413 });
  }

  const hasConsentContract = payload.events.every((event) => {
    const metadata = event?.metadata;
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }
    return (metadata as Record<string, unknown>)['consentGranted'] === true;
  });
  if (!hasConsentContract) {
    return NextResponse.json({ ok: false, reason: 'CONSENT_REQUIRED' }, { status: 403 });
  }

  const summary = await ingestAnalyticsEvents(payload.events);
  return NextResponse.json({ ok: true, summary });
}

export async function GET(request: Request) {
  const adminCheck = await requireAdminFromRequest(request);
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false }, { status: adminCheck.status });
  }

  const securityError = validateAnalyticsSecurity(request);
  if (securityError) {
    return securityError;
  }

  const summary = await getAnalyticsSummary();
  return NextResponse.json({ ok: true, summary });
}
