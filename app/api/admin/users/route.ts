import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.users.get', event: 'request' });

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim() ?? '';
  const roleFilter = url.searchParams.get('role')?.trim() ?? '';
  const subFilter = url.searchParams.get('subscription')?.trim() ?? '';
  const bannedFilter = url.searchParams.get('banned')?.trim() ?? '';
  const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10) || 0);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10) || 50),
  );
  const offset = page * limit;

  try {
    const { query } = await import('@/lib/server/db');

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`u.email ILIKE $${paramIdx}`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (roleFilter && ['admin', 'editor', 'user'].includes(roleFilter)) {
      conditions.push(`u.role = $${paramIdx}`);
      params.push(roleFilter);
      paramIdx++;
    }

    if (bannedFilter === 'true') {
      conditions.push('u.banned = true');
    } else if (bannedFilter === 'false') {
      conditions.push('u.banned = false');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, params);
    const total = Number(countResult.rows[0]?.['total'] ?? 0);

    const usersResult = await query(
      `SELECT u.id, u.email, u.created_at, u.role, u.banned
       FROM users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset],
    );

    const users = await Promise.all(
      usersResult.rows.map(async (row: Record<string, unknown>) => {
        const userId = row['id'];
        let subscription = 'free';
        let subscriptionStatus = '';
        try {
          const subResult = await query(
            "SELECT plan_id, status FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1",
            [userId],
          );
          if (subResult.rows.length > 0) {
            subscription = String(subResult.rows[0]?.['plan_id'] ?? 'free');
            subscriptionStatus = String(subResult.rows[0]?.['status'] ?? '');
          }
        } catch {
          // ignore
        }

        if (subFilter && subscription !== subFilter) {
          return null;
        }

        let usageCount = 0;
        try {
          const usageResult = await query(
            'SELECT COUNT(*) as cnt FROM history_entries WHERE user_id = $1',
            [userId],
          );
          usageCount = Number(usageResult.rows[0]?.['cnt'] ?? 0);
        } catch {
          // ignore
        }

        return {
          id: String(userId),
          email: String(row['email']),
          createdAt: row['created_at']
            ? new Date(Number(row['created_at'])).toLocaleDateString('fa-IR')
            : '—',
          role: String(row['role'] ?? 'user'),
          banned: Boolean(row['banned']),
          subscription,
          subscriptionStatus,
          usageCount,
          lastActive: '—',
        };
      }),
    );

    const filteredUsers = users.filter((u): u is NonNullable<typeof u> => u !== null);

    return NextResponse.json({
      users: filteredUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ users: [], total: 0, page: 0, limit: 50, totalPages: 0 });
  }
}
