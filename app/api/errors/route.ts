import { NextResponse } from 'next/server';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= 10) {
    return true;
  }

  entry.count++;
  return false;
}

// Evict stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now > entry.resetAt) {
      rateLimit.delete(ip);
    }
  }
}, 300_000);

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    logApiEvent(request, {
      route: '/api/errors',
      event: 'error',
      status: 429,
      details: { ip },
    });
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { reports } = body as { reports: unknown[] };

    if (!Array.isArray(reports)) {
      return NextResponse.json({ ok: false, error: 'Invalid reports format' }, { status: 400 });
    }

    const MAX_REPORTS = 50;
    const limitedReports = reports.slice(0, MAX_REPORTS);

    for (const report of limitedReports) {
      if (typeof report === 'object' && report !== null) {
        const r = report as Record<string, unknown>;
        const ts = typeof r['timestamp'] === 'string' ? r['timestamp'] : new Date().toISOString();
        const msg = typeof r['message'] === 'string' ? r['message'] : 'unknown';
        const stack = typeof r['stack'] === 'string' ? r['stack'] : undefined;
        const url = typeof r['url'] === 'string' ? r['url'] : undefined;
        const userAgent = typeof r['userAgent'] === 'string' ? r['userAgent'] : undefined;
        const ctx = typeof r['context'] === 'object' && r['context'] !== null ? r['context'] : {};

        console.error(
          `[${ts}] CLIENT_ERROR: ${msg}${url ? ` | url: ${url}` : ''}${
            userAgent ? ` | ua: ${userAgent}` : ''
          }${
            stack ? `\nstack: ${stack}` : ''
          }${Object.keys(ctx).length > 0 ? `\ncontext: ${JSON.stringify(ctx)}` : ''}`,
        );
      }
    }

    logApiEvent(request, {
      route: '/api/errors',
      event: 'request',
      status: 200,
      details: { received: limitedReports.length },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logApiEvent(request, {
      route: '/api/errors',
      event: 'error',
      status: 500,
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ ok: false, error: 'Failed to process reports' }, { status: 500 });
  }
}
