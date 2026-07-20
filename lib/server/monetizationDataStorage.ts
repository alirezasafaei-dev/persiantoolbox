import { query } from '@/lib/server/db';

type AdminSubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: number | string;
  expires_at: number | string;
  payment_id: string | null;
  amount: number | string | null;
};

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number | string;
  status: string;
  metadata: string | Record<string, unknown> | null;
  created_at: number | string;
  completed_at: number | string | null;
  gateway_authority: string | null;
  gateway_ref_id: string | null;
  gateway_name: string | null;
  failure_code: string | null;
  failure_message: string | null;
  fulfilled: boolean;
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

let couponTableReady = false;

async function ensureCouponTable(): Promise<void> {
  if (couponTableReady) return;
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
  couponTableReady = true;
}

function parseMetadata(value: PaymentRow['metadata']): Record<string, unknown> | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function maskFinancialReference(value: string | null): string | undefined {
  if (!value) return undefined;
  if (value.length <= 10) return `${value.slice(0, 2)}••••${value.slice(-2)}`;
  return `${value.slice(0, 6)}••••••${value.slice(-4)}`;
}

function normalizeSubscriptionStatus(value: string): 'active' | 'canceled' | 'expired' {
  if (value === 'active') return 'active';
  if (value === 'expired') return 'expired';
  return 'canceled';
}

function normalizePaymentStatus(
  value: string,
): 'completed' | 'pending' | 'failed' | 'reconciliation_required' | 'refunded' {
  if (
    value === 'completed' ||
    value === 'pending' ||
    value === 'failed' ||
    value === 'reconciliation_required' ||
    value === 'refunded'
  ) {
    return value;
  }
  return 'failed';
}

function toSubscription(row: AdminSubscriptionRow) {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: normalizeSubscriptionStatus(row.status),
    startedAt: Number(row.started_at),
    expiresAt: Number(row.expires_at),
    amount: Number(row.amount ?? 0),
    paymentId: maskFinancialReference(row.payment_id),
  };
}

function toPayment(row: PaymentRow) {
  const metadata = parseMetadata(row.metadata);
  const rawPlanId = metadata?.['planId'];
  const rawCouponCode = metadata?.['couponCode'];
  const planId = typeof rawPlanId === 'string' ? rawPlanId : 'unknown';
  const couponCode = typeof rawCouponCode === 'string' ? rawCouponCode : undefined;
  const persistedStatus = normalizePaymentStatus(row.status);
  const status =
    persistedStatus === 'completed' && planId !== 'unknown' && !row.fulfilled
      ? 'reconciliation_required'
      : persistedStatus;

  return {
    id: maskFinancialReference(row.id) ?? 'unknown',
    userId: maskFinancialReference(row.user_id) ?? 'unknown',
    planId,
    amount: Number(row.amount),
    status,
    createdAt: Number(row.created_at),
    completedAt: row.completed_at === null ? undefined : Number(row.completed_at),
    ...(couponCode ? { couponCode } : {}),
    gateway: row.gateway_name ?? undefined,
    authority: maskFinancialReference(row.gateway_authority),
    referenceId: maskFinancialReference(row.gateway_ref_id),
    failureCode:
      status === 'reconciliation_required' && !row.failure_code
        ? 'MISSING_FULFILLMENT_LEDGER'
        : row.failure_code ?? undefined,
    failureMessage: row.failure_message?.slice(0, 200) ?? undefined,
    fulfilled: Boolean(row.fulfilled),
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
  const result = await query<AdminSubscriptionRow>(
    `SELECT
       s.id,
       s.user_id,
       s.plan_id,
       s.status,
       s.started_at,
       s.expires_at,
       s.payment_id,
       p.amount
     FROM subscriptions s
     LEFT JOIN payments p ON p.id = s.payment_id
     ORDER BY s.started_at DESC
     LIMIT 500`,
  );
  return result.rows.map(toSubscription);
}

export async function getAllPayments(): Promise<Array<ReturnType<typeof toPayment>>> {
  const result = await query<PaymentRow>(
    `SELECT
       p.id,
       p.user_id,
       p.amount,
       p.status,
       p.metadata,
       p.created_at,
       p.completed_at,
       p.gateway_authority,
       p.gateway_ref_id,
       p.gateway_name,
       p.failure_code,
       p.failure_message,
       EXISTS (
         SELECT 1 FROM payment_fulfillments f WHERE f.payment_id = p.id
       ) AS fulfilled
     FROM payments p
     ORDER BY p.created_at DESC
     LIMIT 500`,
  );
  return result.rows.map(toPayment);
}

export async function getAllCoupons(): Promise<Array<ReturnType<typeof toCoupon>>> {
  await ensureCouponTable();
  const result = await query<CouponRow>('SELECT * FROM admin_coupons ORDER BY created_at DESC');
  return result.rows.map(toCoupon);
}

export async function addCoupon(
  coupon: Omit<ReturnType<typeof toCoupon>, 'id' | 'createdAt'>,
): Promise<ReturnType<typeof toCoupon> | null> {
  await ensureCouponTable();
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
}

export async function updateCoupon(
  id: string,
  updates: Partial<Omit<ReturnType<typeof toCoupon>, 'id' | 'createdAt'>>,
): Promise<ReturnType<typeof toCoupon> | null> {
  await ensureCouponTable();
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
}

export async function removeCoupon(id: string): Promise<boolean> {
  await ensureCouponTable();
  const result = await query('DELETE FROM admin_coupons WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function findCouponByCode(code: string): Promise<ReturnType<typeof toCoupon> | null> {
  await ensureCouponTable();
  const result = await query<CouponRow>(
    'SELECT * FROM admin_coupons WHERE code = $1 AND active = true',
    [code],
  );
  return result.rows[0] ? toCoupon(result.rows[0]) : null;
}
