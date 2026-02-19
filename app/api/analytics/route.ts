import { NextResponse } from 'next/server';
import {
  getAnalyticsSummary,
  ingestAnalyticsEvents,
  type AnalyticsEvent,
} from '@/lib/analyticsStore';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AnalyticsPayload = {
  id?: string;
  events?: AnalyticsEvent[];
};

const MAX_EVENTS_PER_REQUEST = 200;
const MAX_BODY_BYTES = Number(process.env['ANALYTICS_MAX_BODY_BYTES'] ?? '262144'); // 256KiB

function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

function strictAnalyticsPolicyEnabled(): boolean {
  const value = String(process.env['FEATURE_V3_ANALYTICS_POLICY'] ?? '').toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function getIngestSecret(): string {
  return process.env['ANALYTICS_INGEST_SECRET'] ?? '';
}

function analyticsFeatureEnabled(): boolean {
  return Boolean(process.env['NEXT_PUBLIC_ANALYTICS_ID']);
}

async function enforceRateLimitIfAvailable(request: Request): Promise<NextResponse | null> {
  if (!process.env['DATABASE_URL']?.trim()) {
    return null;
  }

  const { limit, windowMs, keyPrefix } = rateLimitPolicies.analyticsIngest;
  if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    return null;
  }

  try {
    const key = makeRateLimitKey(keyPrefix, request);
    const result = await rateLimit(key, { limit, windowMs });
    if (!result.allowed) {
      return NextResponse.json(
        { ok: false, reason: 'RATE_LIMITED', resetAt: result.resetAt },
        { status: 429 },
      );
    }
    return null;
  } catch {
    // If rate limiting fails (DB unavailable), do not block ingestion.
    return null;
  }
}

function validateAnalyticsSecurity(request: Request): NextResponse | null {
  if (!analyticsFeatureEnabled()) {
    return NextResponse.json({ ok: false, disabled: true }, { status: 400 });
  }

  const mustEnforceSecret = isProduction() || strictAnalyticsPolicyEnabled();
  if (!mustEnforceSecret) {
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
  logApiEvent(request, { route: '/api/analytics', event: 'request' });
  const securityError = validateAnalyticsSecurity(request);
  if (securityError) {
    logApiEvent(request, {
      route: '/api/analytics',
      event: 'response',
      status: securityError.status,
      details: { reason: 'SECURITY_POLICY' },
    });
    return securityError;
  }

  const rateLimitError = await enforceRateLimitIfAvailable(request);
  if (rateLimitError) {
    logApiEvent(request, {
      route: '/api/analytics',
      event: 'response',
      status: rateLimitError.status,
      details: { reason: 'RATE_LIMITED' },
    });
    return rateLimitError;
  }

  let payload: AnalyticsPayload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, reason: 'PAYLOAD_TOO_LARGE' }, { status: 413 });
    }
    payload = JSON.parse(raw) as AnalyticsPayload;
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
  logApiEvent(request, { route: '/api/analytics', event: 'response', status: 200 });
  return NextResponse.json({ ok: true, summary });
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/analytics', event: 'request' });
  try {
    const adminCheck = await requireAdminFromRequest(request);
    if (!adminCheck.ok) {
      logApiEvent(request, {
        route: '/api/analytics',
        event: 'response',
        status: adminCheck.status,
        details: { reason: 'ADMIN_AUTH' },
      });
      return NextResponse.json({ ok: false }, { status: adminCheck.status });
    }
  } catch {
    // Admin auth depends on sessions/DB. If not configured, surface a stable error instead of 500.
    return NextResponse.json({ ok: false, reason: 'ADMIN_AUTH_UNAVAILABLE' }, { status: 503 });
  }

  const securityError = validateAnalyticsSecurity(request);
  if (securityError) {
    logApiEvent(request, {
      route: '/api/analytics',
      event: 'response',
      status: securityError.status,
      details: { reason: 'SECURITY_POLICY' },
    });
    return securityError;
  }

  const summary = await getAnalyticsSummary();
  logApiEvent(request, { route: '/api/analytics', event: 'response', status: 200 });
  return NextResponse.json({ ok: true, summary });
}
