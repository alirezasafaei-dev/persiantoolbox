import { randomUUID } from 'node:crypto';
import { query } from './db';
import { type PlanId } from '@/lib/subscriptionPlans';

export type CheckoutStatus = 'pending' | 'paid' | 'canceled';

export type Checkout = {
  id: string;
  userId: string;
  planId: PlanId;
  status: CheckoutStatus;
  createdAt: number;
  paidAt: number | null;
};

type CheckoutRow = {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: CheckoutStatus;
  created_at: number | string;
  paid_at: number | string | null;
};

function mapCheckout(row: CheckoutRow): Checkout {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    createdAt: Number(row.created_at),
    paidAt: row.paid_at === null ? null : Number(row.paid_at),
  };
}

export async function createCheckout(userId: string, planId: PlanId): Promise<Checkout> {
  const checkout: Checkout = {
    id: randomUUID(),
    userId,
    planId,
    status: 'pending',
    createdAt: Date.now(),
    paidAt: null,
  };
  await query(
    `INSERT INTO checkouts (id, user_id, plan_id, status, created_at, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      checkout.id,
      checkout.userId,
      checkout.planId,
      checkout.status,
      checkout.createdAt,
      checkout.paidAt,
    ],
  );
  return checkout;
}

export async function getCheckoutById(id: string): Promise<Checkout | null> {
  const result = await query<CheckoutRow>(
    `SELECT id, user_id, plan_id, status, created_at, paid_at
     FROM checkouts
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  if (result.rowCount === 0) {
    return null;
  }
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return mapCheckout(row);
}

export async function markCheckoutPaid(id: string): Promise<Checkout | null> {
  const now = Date.now();
  const result = await query<CheckoutRow>(
    `UPDATE checkouts
     SET status = $2, paid_at = $3
     WHERE id = $1
     RETURNING id, user_id, plan_id, status, created_at, paid_at`,
    [id, 'paid', now],
  );
  if (result.rowCount === 0) {
    return null;
  }
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return mapCheckout(row);
}
