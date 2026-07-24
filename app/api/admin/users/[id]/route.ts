import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { isSameOrigin } from '@/lib/server/csrf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PatchBody = {
  role?: string;
  banned?: boolean;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminResult = await requireAdminFromRequest(request);
  if (!adminResult.ok) {
    return NextResponse.json({ error: 'forbidden' }, { status: adminResult.status });
  }

  logApiEvent(request, { route: 'admin.users.getOne', event: 'request' });
  const { id } = await params;

  try {
    const { query } = await import('@/lib/server/db');

    const userResult = await query(
      'SELECT id, email, created_at, role, banned FROM users WHERE id = $1 LIMIT 1',
      [id],
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const row = userResult.rows[0] as Record<string, unknown>;

    let subscriptionPlan = '';
    let subscriptionStatus = '';
    let subscriptionExpires = '';
    try {
      const subResult = await query(
        'SELECT plan_id, status, expires_at FROM subscriptions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
        [id],
      );
      if (subResult.rows.length > 0) {
        const sub = subResult.rows[0] as Record<string, unknown>;
        subscriptionPlan = String(sub['plan_id'] ?? '');
        subscriptionStatus = String(sub['status'] ?? '');
        subscriptionExpires = sub['expires_at']
          ? new Date(Number(sub['expires_at'])).toLocaleDateString('fa-IR')
          : '';
      }
    } catch {
      // ignore
    }

    let totalPayments = 0;
    let totalPaidAmount = 0;
    try {
      const payResult = await query(
        "SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as total FROM payments WHERE user_id = $1 AND status = 'completed'",
        [id],
      );
      if (payResult.rows.length > 0) {
        totalPayments = Number((payResult.rows[0] as Record<string, unknown>)['cnt'] ?? 0);
        totalPaidAmount = Number((payResult.rows[0] as Record<string, unknown>)['total'] ?? 0);
      }
    } catch {
      // ignore
    }

    let usageCount = 0;
    let toolsUsed: string[] = [];
    try {
      const usageResult = await query(
        'SELECT tool, COUNT(*) as cnt FROM history_entries WHERE user_id = $1 GROUP BY tool ORDER BY cnt DESC',
        [id],
      );
      usageCount = usageResult.rows.reduce(
        (acc: number, r: Record<string, unknown>) => acc + Number(r['cnt'] ?? 0),
        0,
      );
      toolsUsed = usageResult.rows.map((r: Record<string, unknown>) => String(r['tool'] ?? ''));
    } catch {
      // ignore
    }

    let sessionCount = 0;
    try {
      const sessResult = await query('SELECT COUNT(*) as cnt FROM sessions WHERE user_id = $1', [
        id,
      ]);
      if (sessResult.rows.length > 0) {
        sessionCount = Number((sessResult.rows[0] as Record<string, unknown>)['cnt'] ?? 0);
      }
    } catch {
      // ignore
    }

    let recentHistory: Array<{ tool: string; inputSummary: string; createdAt: string }> = [];
    try {
      const histResult = await query(
        'SELECT tool, input_summary, created_at FROM history_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [id],
      );
      recentHistory = histResult.rows.map((r: Record<string, unknown>) => ({
        tool: String(r['tool'] ?? ''),
        inputSummary: String(r['input_summary'] ?? ''),
        createdAt: r['created_at']
          ? new Date(Number(r['created_at'])).toLocaleDateString('fa-IR')
          : '—',
      }));
    } catch {
      // ignore
    }

    return NextResponse.json({
      user: {
        id: String(row['id']),
        email: String(row['email']),
        createdAt: row['created_at']
          ? new Date(Number(row['created_at'])).toLocaleDateString('fa-IR')
          : '—',
        role: String(row['role'] ?? 'user'),
        banned: Boolean(row['banned']),
      },
      subscription: {
        plan: subscriptionPlan,
        status: subscriptionStatus,
        expires: subscriptionExpires,
      },
      payments: { count: totalPayments, totalPaid: totalPaidAmount },
      usage: { count: usageCount, tools: toolsUsed },
      sessions: sessionCount,
      recentHistory,
    });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const adminResult2 = await requireAdminFromRequest(request);
  if (!adminResult2.ok) {
    return NextResponse.json({ error: 'forbidden' }, { status: adminResult2.status });
  }

  logApiEvent(request, { route: 'admin.users.update', event: 'request' });
  const { id } = await params;

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { role, banned } = body;

  try {
    const { query } = await import('@/lib/server/db');

    if (role !== undefined) {
      if (!['admin', 'editor', 'user'].includes(role)) {
        return NextResponse.json({ error: 'invalid role' }, { status: 400 });
      }
      await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    }

    if (banned !== undefined) {
      await query('UPDATE users SET banned = $1 WHERE id = $2', [banned, id]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
