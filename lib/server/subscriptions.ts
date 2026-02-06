import { randomUUID } from 'node:crypto';
import { query, withTransaction } from './db';
import { type PlanId, getPlanById } from '@/lib/subscriptionPlans';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export type Subscription = {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startedAt: number;
  expiresAt: number;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  started_at: number | string;
  expires_at: number | string;
};

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    startedAt: Number(row.started_at),
    expiresAt: Number(row.expires_at),
  };
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const now = Date.now();
  const result = await query<SubscriptionRow>(
    `SELECT id, user_id, plan_id, status, started_at, expires_at
     FROM subscriptions
     WHERE user_id = $1 AND status = $2 AND expires_at > $3
     ORDER BY started_at DESC
     LIMIT 1`,
    [userId, 'active', now],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0] ? mapSubscription(result.rows[0]) : null;
}

export async function createSubscription(userId: string, planId: PlanId): Promise<Subscription> {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error('PLAN_NOT_FOUND');
  }
  return withTransaction(async (txn) => {
    const now = Date.now();
    await txn('UPDATE subscriptions SET status = $1 WHERE user_id = $2 AND status = $3', [
      'expired',
      userId,
      'active',
    ]);

    const subscription: Subscription = {
      id: randomUUID(),
      userId,
      planId,
      status: 'active',
      startedAt: now,
      expiresAt: now + plan.periodDays * 24 * 60 * 60 * 1000,
    };

    await txn(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        subscription.id,
        subscription.userId,
        subscription.planId,
        subscription.status,
        subscription.startedAt,
        subscription.expiresAt,
      ],
    );

    return subscription;
  });
}
