import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import {
  getLatestFunnelSnapshot,
  getFunnelHistory,
  saveFunnelSnapshot,
} from '@/lib/server/funnelStorage';
import { query } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function computeFunnelFromAnalytics() {
  try {
    const pathResult = await query<{ key: string; count: string }>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'path' ORDER BY count DESC",
    );
    const eventResult = await query<{ key: string; count: string }>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'event'",
    );

    const pathCounts = new Map(pathResult.rows.map((r) => [r.key, Number(r.count)]));
    const eventCounts = new Map(eventResult.rows.map((r) => [r.key, Number(r.count)]));

    const totalVisits = Array.from(pathCounts.values()).reduce((s, v) => s + v, 0);
    const toolViews = Array.from(pathCounts.entries())
      .filter(
        ([k]) =>
          k.startsWith('/pdf-tools') ||
          k.startsWith('/date-tools') ||
          k.startsWith('/text-tools') ||
          k.startsWith('/image-tools') ||
          k.startsWith('/financial-tools') ||
          k.startsWith('/validation-tools') ||
          k.startsWith('/loan') ||
          k.startsWith('/salary') ||
          k.startsWith('/career-tools') ||
          k.startsWith('/business-tools') ||
          k.startsWith('/contract-tools') ||
          k.startsWith('/writing-tools'),
      )
      .reduce((s, [, v]) => s + v, 0);
    const checkoutStarts = eventCounts.get('CHECKOUT_START') ?? 0;
    const checkoutComplete = eventCounts.get('CHECKOUT_COMPLETE') ?? 0;
    const upgradePrompts = eventCounts.get('UPGRADE_PROMPT_VIEW') ?? 0;

    const awareness = totalVisits;
    const interest = toolViews;
    const consideration = upgradePrompts + checkoutStarts;
    const intent = checkoutStarts;
    const conversion = checkoutComplete;

    const stages = [
      { stage: 'بازدید', users: awareness },
      { stage: 'استفاده از ابزار', users: interest },
      { stage: 'بررسی ارتقا', users: consideration },
      { stage: 'شروع پرداخت', users: intent },
      { stage: 'تکمیل پرداخت', users: conversion },
    ];

    const dropOffs: Array<{ stage: string; dropOff: number; users: number }> = [];
    for (let i = 1; i < stages.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const prev = stages[i - 1]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const curr = stages[i]!;
      const dropOff =
        prev.users > 0 ? Math.round(((prev.users - curr.users) / prev.users) * 1000) / 10 : 0;
      dropOffs.push({
        stage: `${prev.stage} → ${curr.stage}`,
        dropOff,
        users: prev.users - curr.users,
      });
    }

    const revenue = Array.from(pathCounts.entries())
      .filter(
        ([k]) =>
          k.startsWith('/pdf-tools') ||
          k.startsWith('/loan') ||
          k.startsWith('/salary') ||
          k.startsWith('/career-tools') ||
          k.startsWith('/contract-tools'),
      )
      .slice(0, 7)
      .map(([tool, count]) => ({
        tool: tool.split('/').filter(Boolean).pop() ?? tool,
        conversions: Math.round(count * 0.03),
        revenue: Math.round(count * 0.03 * 50000),
        share: 0,
      }));

    const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
    revenue.forEach((r) => {
      r.share = totalRevenue > 0 ? Math.round((r.revenue / totalRevenue) * 1000) / 10 : 0;
    });

    return {
      totalVisits,
      totalConversions: conversion,
      conversionRate: totalVisits > 0 ? Math.round((conversion / totalVisits) * 1000) / 10 : 0,
      stages,
      dropOffs,
      cohorts: [],
      revenue,
      monthlyVisits: [],
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/admin/funnel', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  try {
    const latest = await getLatestFunnelSnapshot();
    let snapshot = latest;

    if (!snapshot) {
      const computed = await computeFunnelFromAnalytics();
      if (computed) {
        snapshot = await saveFunnelSnapshot(computed);
      }
    }

    const history = await getFunnelHistory(12);

    logApiEvent(request, {
      route: '/api/admin/funnel',
      event: 'response',
      status: 200,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          snapshot: snapshot ?? {
            totalVisits: 0,
            totalConversions: 0,
            conversionRate: 0,
            stages: [],
            dropOffs: [],
            cohorts: [],
            revenue: [],
            monthlyVisits: [],
          },
          history,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logApiEvent(request, {
      route: '/api/admin/funnel',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['Invalid body'] }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, errors: ['Invalid body'] }, { status: 400 });
  }

  const { action } = body as { action?: string };

  if (action === 'refresh') {
    const computed = await computeFunnelFromAnalytics();
    if (!computed) {
      return NextResponse.json(
        { ok: false, errors: ['Could not compute funnel from analytics'] },
        { status: 500 },
      );
    }
    const snapshot = await saveFunnelSnapshot(computed);
    return NextResponse.json({ ok: true, data: snapshot }, { status: 200 });
  }

  return NextResponse.json({ ok: false, errors: ['Invalid action'] }, { status: 400 });
}
