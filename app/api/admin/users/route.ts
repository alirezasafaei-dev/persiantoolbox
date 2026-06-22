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

  try {
    const { query } = await import('@/lib/server/db');

    const usersResult = await query(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 100',
      [],
    );

    const users = await Promise.all(
      usersResult.rows.map(async (row: Record<string, unknown>) => {
        const userId = row['id'];
        let subscription = 'free';
        try {
          const subResult = await query(
            "SELECT plan_id FROM subscriptions WHERE user_id = $1 AND status = 'ACTIVE' LIMIT 1",
            [userId],
          );
          if (subResult.rows.length > 0) {
            subscription = String(subResult.rows[0]?.['plan_id'] ?? 'free');
          }
        } catch {
          // ignore
        }

        return {
          id: String(userId),
          email: String(row['email']),
          createdAt: row['created_at']
            ? new Date(String(row['created_at'])).toLocaleDateString('fa-IR')
            : '—',
          subscription,
          lastActive: '—',
        };
      }),
    );

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
