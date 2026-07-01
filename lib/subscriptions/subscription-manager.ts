/**
 * Subscription Manager - PersianToolbox
 *
 * Manages user subscriptions and billing with database persistence
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';
import { agentLogger } from '@/lib/agent-logger';
import { getPlanByIdAsync } from '@/lib/server/subscriptionPlans';
import type { PlanId } from '@/lib/subscriptionPlans';

type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentId?: string;
  trialEnd?: string;
}

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: number;
  expires_at: number;
  payment_id: string | null;
};

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status as SubscriptionStatus,
    startDate: new Date(row.started_at).toISOString(),
    endDate: new Date(row.expires_at).toISOString(),
    autoRenew: true,
    ...(row.payment_id && { paymentId: row.payment_id }),
  };
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentId?: string,
): Promise<Subscription> {
  const plan = await getPlanByIdAsync(planId as PlanId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const now = Date.now();
  const durationMs = plan.periodDays * 24 * 60 * 60 * 1000;

  const activeResult = await query<SubscriptionRow>(
    `SELECT id, user_id, plan_id, status, started_at, expires_at, payment_id
     FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > $3
     ORDER BY expires_at DESC LIMIT 1`,
    [userId, 'active', now],
  );

  if (activeResult.rowCount && activeResult.rowCount > 0 && activeResult.rows[0]) {
    const existing = activeResult.rows[0];

    if (existing.plan_id === planId) {
      const newEndDate = existing.expires_at + durationMs;
      await query('UPDATE subscriptions SET expires_at = $1 WHERE id = $2', [
        newEndDate,
        existing.id,
      ]);

      agentLogger.info('subscriptions', 'extend', `Subscription extended for ${userId}`, {
        planId,
        previousEnd: new Date(existing.expires_at).toISOString(),
        newEnd: new Date(newEndDate).toISOString(),
      });

      return {
        id: existing.id,
        userId,
        planId,
        status: 'active',
        startDate: new Date(existing.started_at).toISOString(),
        endDate: new Date(newEndDate).toISOString(),
        autoRenew: true,
        ...(paymentId && { paymentId }),
      };
    }

    await query(
      "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'",
      [userId],
    );

    agentLogger.info(
      'subscriptions',
      'cancel-replace',
      `Previous subscription cancelled for ${userId}`,
      {
        previousPlanId: existing.plan_id,
        newPlanId: planId,
      },
    );
  }

  const id = `sub_${randomUUID()}`;
  const endDate = now + durationMs;

  await query(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, userId, planId, 'active', now, endDate],
  );

  agentLogger.info('subscriptions', 'create', `Subscription created for ${userId}`, {
    planId,
    endDate: new Date(endDate).toISOString(),
  });

  return {
    id,
    userId,
    planId,
    status: 'active',
    startDate: new Date(now).toISOString(),
    endDate: new Date(endDate).toISOString(),
    autoRenew: true,
    ...(paymentId && { paymentId }),
  };
}

export async function getActiveSubscription(userId: string): Promise<Subscription | undefined> {
  const now = Date.now();
  const result = await query<SubscriptionRow>(
    `SELECT id, user_id, plan_id, status, started_at, expires_at, payment_id
     FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > $3
     ORDER BY expires_at DESC LIMIT 1`,
    [userId, 'active', now],
  );

  if (result.rowCount === 0) {
    return undefined;
  }

  const row = result.rows[0];
  if (!row) {
    return undefined;
  }

  return mapSubscription(row);
}
