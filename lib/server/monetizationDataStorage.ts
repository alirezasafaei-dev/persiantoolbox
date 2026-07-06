import { query } from '@/lib/server/db';

type AdminSubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  started_at: number;
  expires_at: number;
  amount: number;
  created_at: number;
  updated_at: number;
};

type PaymentRow = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  coupon_code: string | null;
  created_at: number;
};

type CouponRow = {
  id: string;
  code: string;
  percent: number;
  max_uses: number;
  used_count: number;
  expires_at: number;
  active: boolean;
  created_at: number;
  updated_at: number;
};

let tablesReady = false;

async function ensureTables(): Promise<boolean> {
  if (tablesReady) {
    return true;
  }
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS admin_subscriptions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        expires_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) + 86400) * 1000,
        amount INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_admin_sub_user ON admin_subscriptions(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_admin_sub_status ON admin_subscriptions(status)');

    await query(`
      CREATE TABLE IF NOT EXISTS admin_payments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'completed',
        coupon_code TEXT,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_admin_pay_user ON admin_payments(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_admin_pay_status ON admin_payments(status)');

    await query(`
      CREATE TABLE IF NOT EXISTS admin_coupons (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        code TEXT NOT NULL UNIQUE,
        percent INTEGER NOT NULL DEFAULT 10,
        max_uses INTEGER NOT NULL DEFAULT 100,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at BIGINT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_admin_coupon_code ON admin_coupons(code)');

    tablesReady = true;
    return true;
  } catch {
    tablesReady = false;
    return false;
  }
}

function toSubscription(row: AdminSubscriptionRow) {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    amount: row.amount,
  };
}

function toPayment(row: PaymentRow) {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    amount: row.amount,
    status: row.status,
    createdAt: row.created_at,
    couponCode: row.coupon_code ?? undefined,
  };
}

function toCoupon(row: CouponRow) {
  return {
    id: row.id,
    code: row.code,
    percent: row.percent,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    active: row.active,
  };
}

export async function getAllSubscriptions(): Promise<Array<ReturnType<typeof toSubscription>>> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return [];
  }
  try {
    const result = await query<AdminSubscriptionRow>(
      'SELECT * FROM admin_subscriptions ORDER BY created_at DESC',
    );
    return result.rows.map(toSubscription);
  } catch {
    return [];
  }
}

export async function getAllPayments(): Promise<Array<ReturnType<typeof toPayment>>> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return [];
  }
  try {
    const result = await query<PaymentRow>('SELECT * FROM admin_payments ORDER BY created_at DESC');
    return result.rows.map(toPayment);
  } catch {
    return [];
  }
}

export async function getAllCoupons(): Promise<Array<ReturnType<typeof toCoupon>>> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return [];
  }
  try {
    const result = await query<CouponRow>('SELECT * FROM admin_coupons ORDER BY created_at DESC');
    return result.rows.map(toCoupon);
  } catch {
    return [];
  }
}

export async function addCoupon(
  coupon: Omit<ReturnType<typeof toCoupon>, 'id' | 'createdAt'>,
): Promise<ReturnType<typeof toCoupon> | null> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return null;
  }
  try {
    const result = await query<CouponRow>(
      `INSERT INTO admin_coupons (code, percent, max_uses, used_count, expires_at, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        coupon.code,
        coupon.percent,
        coupon.maxUses,
        coupon.usedCount,
        coupon.expiresAt,
        coupon.active,
      ],
    );
    return result.rows[0] ? toCoupon(result.rows[0]) : null;
  } catch {
    return null;
  }
}

export async function updateCoupon(
  id: string,
  updates: Partial<Omit<ReturnType<typeof toCoupon>, 'id' | 'createdAt'>>,
): Promise<ReturnType<typeof toCoupon> | null> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return null;
  }
  try {
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (updates.code !== undefined) {
      setClauses.push(`code = $${paramIdx++}`);
      params.push(updates.code);
    }
    if (updates.percent !== undefined) {
      setClauses.push(`percent = $${paramIdx++}`);
      params.push(updates.percent);
    }
    if (updates.maxUses !== undefined) {
      setClauses.push(`max_uses = $${paramIdx++}`);
      params.push(updates.maxUses);
    }
    if (updates.usedCount !== undefined) {
      setClauses.push(`used_count = $${paramIdx++}`);
      params.push(updates.usedCount);
    }
    if (updates.expiresAt !== undefined) {
      setClauses.push(`expires_at = $${paramIdx++}`);
      params.push(updates.expiresAt);
    }
    if (updates.active !== undefined) {
      setClauses.push(`active = $${paramIdx++}`);
      params.push(updates.active);
    }

    setClauses.push('updated_at = EXTRACT(EPOCH FROM NOW()) * 1000');
    params.push(id);

    const result = await query<CouponRow>(
      `UPDATE admin_coupons SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params,
    );
    return result.rows[0] ? toCoupon(result.rows[0]) : null;
  } catch {
    return null;
  }
}

export async function removeCoupon(id: string): Promise<boolean> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return false;
  }
  try {
    await query('DELETE FROM admin_coupons WHERE id = $1', [id]);
    return true;
  } catch {
    return false;
  }
}

export async function findCouponByCode(code: string): Promise<ReturnType<typeof toCoupon> | null> {
  const hasTable = await ensureTables();
  if (!hasTable) {
    return null;
  }
  try {
    const result = await query<CouponRow>(
      'SELECT * FROM admin_coupons WHERE code = $1 AND active = true',
      [code],
    );
    return result.rows[0] ? toCoupon(result.rows[0]) : null;
  } catch {
    return null;
  }
}
