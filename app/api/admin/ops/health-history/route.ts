import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { query } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HealthEntry = {
  timestamp: string;
  status: string;
  responseTimeMs: number;
  details: Record<string, unknown>;
};

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS health_history (
      id SERIAL PRIMARY KEY,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status VARCHAR(20) NOT NULL,
      response_time_ms INTEGER NOT NULL DEFAULT 0,
      details JSONB DEFAULT '{}'
    )
  `);
}

async function recordCheck(): Promise<HealthEntry> {
  const start = Date.now();
  let status = 'ok';
  const details: Record<string, unknown> = {};

  try {
    const baseUrl =
      process.env['NEXTAUTH_URL'] ?? process.env['VERCEL_URL'] ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = (await res.json()) as {
      status: string;
      version: string;
      uptime: number;
      memory: { rss: number; heapUsed: number };
    };
    details['health'] = data;
    if (res.ok && data.status === 'ok') {
      status = 'ok';
    } else {
      status = 'degraded';
    }
  } catch (e) {
    status = 'error';
    details['error'] = e instanceof Error ? e.message : 'timeout';
  }

  const responseTimeMs = Date.now() - start;

  try {
    await ensureTable();
    await query(
      'INSERT INTO health_history (checked_at, status, response_time_ms, details) VALUES (NOW(), $1, $2, $3)',
      [status, responseTimeMs, JSON.stringify(details)],
    );
  } catch {
    /* best effort */
  }

  return { timestamp: new Date().toISOString(), status, responseTimeMs, details };
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/admin/ops/health-history', event: 'request' });

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json(
        { ok: false, reason: `ADMIN_AUTH:${admin.status}` },
        { status: admin.status },
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '50'), 200);
    const checkNow = url.searchParams.get('check') === 'true';

    let currentCheck: HealthEntry | null = null;
    if (checkNow) {
      currentCheck = await recordCheck();
    }

    let history: Array<{
      checked_at: string;
      status: string;
      response_time_ms: number;
      details: Record<string, unknown>;
    }> = [];
    try {
      await ensureTable();
      const result = await query<{
        checked_at: string;
        status: string;
        response_time_ms: number;
        details: Record<string, unknown>;
      }>(
        'SELECT checked_at, status, response_time_ms, details FROM health_history ORDER BY checked_at DESC LIMIT $1',
        [limit],
      );
      history = result.rows;
    } catch {
      /* table may not exist */
    }

    logApiEvent(request, {
      route: '/api/admin/ops/health-history',
      event: 'response',
      status: 200,
    });
    return NextResponse.json({ ok: true, history, currentCheck });
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
