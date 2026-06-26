import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';

type PaymentRow = {
  id: string;
  amount: string;
  method: string;
  status: string;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای مشاهده تاریخچه پرداخت باید وارد شوید.' },
        { status: 401 },
      );
    }

    const result = await query<PaymentRow>(
      `SELECT id, amount, method, status, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [user.id],
    );

    const payments = result.rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      method: row.method,
      status: row.status,
      createdAt: Number(row.created_at),
    }));

    return NextResponse.json({ ok: true, payments });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'خطا در دریافت تاریخچه پرداخت.',
      },
      { status: 500 },
    );
  }
}
