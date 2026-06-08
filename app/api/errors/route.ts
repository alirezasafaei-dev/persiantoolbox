import { NextResponse } from 'next/server';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reports } = body as { reports: unknown[] };

    if (!Array.isArray(reports)) {
      return NextResponse.json({ ok: false, error: 'Invalid reports format' }, { status: 400 });
    }

    // Log error reports (in production, this would send to error tracking service)
    for (const report of reports) {
      if (typeof report === 'object' && report !== null) {
        logger.error('Client error report', report as Record<string, unknown>);
      }
    }

    return NextResponse.json({ ok: true, received: reports.length });
  } catch (error) {
    logger.error('Failed to process error reports', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'Failed to process reports' }, { status: 500 });
  }
}
