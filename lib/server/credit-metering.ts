/**
 * Export Credit Metering — PersianToolbox
 *
 * Server-side credit checking, deduction, retry window, daily/monthly limits.
 * Privacy: only stores product type + user ID + timestamp. Never stores document content.
 */

import { randomUUID } from 'node:crypto';
import { query, withTransaction } from '@/lib/server/db';
import {
  getPlanById,
  RETRY_WINDOW_MINUTES,
  TIMEZONE,
  type CreditPlanId,
} from '@/lib/pricing/exportCredits';

type CreditBalanceRow = {
  user_id: string;
  plan_id: string;
  monthly_used: number;
  monthly_limit: number;
  daily_used: number;
  daily_limit: number;
  monthly_reset_at: number;
  daily_reset_at: number;
};

type CreditTransactionRow = {
  id: string;
  user_id: string;
  product: string;
  credit_cost: number;
  status: string;
  created_at: number;
};

export type CreditCheckResult = {
  allowed: boolean;
  creditsRemaining: number;
  monthlyUsed: number;
  monthlyLimit: number;
  dailyUsed: number;
  dailyLimit: number;
  retryToken?: string;
  error?: string;
  upgradeUrl?: string;
};

function nowMs(): number {
  return Date.now();
}

function getTehranMidnight(): number {
  const now = new Date();
  const tehran = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const startOfDay = new Date(tehran);
  startOfDay.setHours(0, 0, 0, 0);
  const diff = startOfDay.getTime() - tehran.getTime();
  return now.getTime() + diff;
}

function getTehranMonthStart(): number {
  const now = new Date();
  const tehran = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const startOfMonth = new Date(tehran.getFullYear(), tehran.getMonth(), 1);
  const diff = startOfMonth.getTime() - tehran.getTime();
  return now.getTime() + diff;
}

function getPlanLimits(planId: CreditPlanId): {
  monthlyLimit: number;
  dailyLimit: number;
} {
  const plan = getPlanById(planId);
  if (!plan) {
    return { monthlyLimit: 0, dailyLimit: 0 };
  }
  return { monthlyLimit: plan.monthlyCredits, dailyLimit: plan.dailyLimit };
}

export async function getOrCreateBalance(
  userId: string,
  planId: CreditPlanId,
): Promise<CreditBalanceRow> {
  const { monthlyLimit, dailyLimit } = getPlanLimits(planId);
  const now = nowMs();
  const dailyReset = getTehranMidnight();
  const monthlyReset = getTehranMonthStart();

  const existing = await query<CreditBalanceRow>(
    `SELECT user_id, plan_id, monthly_used, monthly_limit, daily_used, daily_limit,
            monthly_reset_at, daily_reset_at
     FROM export_credits WHERE user_id = $1`,
    [userId],
  );

  if (existing.rowCount && existing.rowCount > 0 && existing.rows[0]) {
    const row = existing.rows[0];

    let monthlyUsed = row.monthly_used;
    let dailyUsed = row.daily_used;
    let needUpdate = false;

    if (row.monthly_reset_at < monthlyReset) {
      monthlyUsed = 0;
      needUpdate = true;
    }
    if (row.daily_reset_at < dailyReset) {
      dailyUsed = 0;
      needUpdate = true;
    }
    if (
      row.plan_id !== planId ||
      row.monthly_limit !== monthlyLimit ||
      row.daily_limit !== dailyLimit
    ) {
      needUpdate = true;
    }

    if (needUpdate) {
      await query(
        `UPDATE export_credits
         SET monthly_used = $1, daily_used = $2, plan_id = $3,
             monthly_limit = $4, daily_limit = $5,
             monthly_reset_at = $6, daily_reset_at = $7, updated_at = $8
         WHERE user_id = $9`,
        [
          monthlyUsed,
          dailyUsed,
          planId,
          monthlyLimit,
          dailyLimit,
          monthlyReset,
          dailyReset,
          now,
          userId,
        ],
      );
    }

    return {
      user_id: userId,
      plan_id: planId,
      monthly_used: monthlyUsed,
      monthly_limit: monthlyLimit,
      daily_used: dailyUsed,
      daily_limit: dailyLimit,
      monthly_reset_at: monthlyReset,
      daily_reset_at: dailyReset,
    };
  }

  await query(
    `INSERT INTO export_credits (id, user_id, plan_id, monthly_used, monthly_limit, daily_used, daily_limit,
                                 monthly_reset_at, daily_reset_at, created_at, updated_at)
     VALUES ($1, $2, $3, 0, $4, 0, $5, $6, $7, $8, $8)`,
    [randomUUID(), userId, planId, monthlyLimit, dailyLimit, monthlyReset, dailyReset, now],
  );

  return {
    user_id: userId,
    plan_id: planId,
    monthly_used: 0,
    monthly_limit: monthlyLimit,
    daily_used: 0,
    daily_limit: dailyLimit,
    monthly_reset_at: monthlyReset,
    daily_reset_at: dailyReset,
  };
}

export async function checkRetryWindow(userId: string, product: string): Promise<string | null> {
  const cutoff = nowMs() - RETRY_WINDOW_MINUTES * 60 * 1000;
  const result = await query<CreditTransactionRow>(
    `SELECT id, user_id, product, credit_cost, status, created_at
     FROM export_transactions
     WHERE user_id = $1 AND product = $2 AND status = 'confirmed' AND created_at > $3
     ORDER BY created_at DESC LIMIT 1`,
    [userId, product, cutoff],
  );

  if (result.rowCount && result.rowCount > 0) {
    const tx = result.rows[0];
    if (tx && tx.credit_cost > 0) {
      return tx.id;
    }
  }
  return null;
}

export async function checkCredits(userId: string, product: string): Promise<CreditCheckResult> {
  const subscription = await import('@/lib/subscriptions/subscription-manager').then((m) =>
    m.getActiveSubscription(userId),
  );

  if (!subscription) {
    return {
      allowed: false,
      creditsRemaining: 0,
      monthlyUsed: 0,
      monthlyLimit: 0,
      dailyUsed: 0,
      dailyLimit: 0,
      error: 'اشتراک فعال نیست.',
      upgradeUrl: '/pricing',
    };
  }

  const planId = subscription.planId as CreditPlanId;
  const retryTxId = await checkRetryWindow(userId, product);

  if (retryTxId) {
    const balance = await getOrCreateBalance(userId, planId);
    return {
      allowed: true,
      creditsRemaining: Math.max(0, balance.monthly_limit - balance.monthly_used),
      monthlyUsed: balance.monthly_used,
      monthlyLimit: balance.monthly_limit,
      dailyUsed: balance.daily_used,
      dailyLimit: balance.daily_limit,
      retryToken: retryTxId,
    };
  }

  const balance = await getOrCreateBalance(userId, planId);

  if (balance.daily_used >= balance.daily_limit) {
    return {
      allowed: false,
      creditsRemaining: Math.max(0, balance.monthly_limit - balance.monthly_used),
      monthlyUsed: balance.monthly_used,
      monthlyLimit: balance.monthly_limit,
      dailyUsed: balance.daily_used,
      dailyLimit: balance.daily_limit,
      error: 'سقف خروجی روزانه تمام شده است. فردا دوباره تلاش کنید.',
    };
  }

  if (balance.monthly_used >= balance.monthly_limit) {
    return {
      allowed: false,
      creditsRemaining: 0,
      monthlyUsed: balance.monthly_used,
      monthlyLimit: balance.monthly_limit,
      dailyUsed: balance.daily_used,
      dailyLimit: balance.daily_limit,
      error: 'اعتبار خروجی ماهانه تمام شده است.',
      upgradeUrl: '/pricing',
    };
  }

  return {
    allowed: true,
    creditsRemaining: Math.max(0, balance.monthly_limit - balance.monthly_used - 1),
    monthlyUsed: balance.monthly_used,
    monthlyLimit: balance.monthly_limit,
    dailyUsed: balance.daily_used,
    dailyLimit: balance.daily_limit,
  };
}

export async function reserveCredit(
  userId: string,
  product: string,
): Promise<{ reservationId: string; creditsRemaining: number }> {
  const subscription = await import('@/lib/subscriptions/subscription-manager').then((m) =>
    m.getActiveSubscription(userId),
  );
  if (!subscription) {
    throw new Error('No active subscription');
  }

  const planId = subscription.planId as CreditPlanId;
  const balance = await getOrCreateBalance(userId, planId);

  if (balance.monthly_used >= balance.monthly_limit) {
    throw new Error('Monthly credit limit exceeded');
  }
  if (balance.daily_used >= balance.daily_limit) {
    throw new Error('Daily credit limit exceeded');
  }

  const reservationId = randomUUID();
  const now = nowMs();

  await query(
    `INSERT INTO export_transactions (id, user_id, product, credit_cost, export_type, status, created_at)
     VALUES ($1, $2, $3, 1, 'clean', 'reserved', $4)`,
    [reservationId, userId, product, now],
  );

  await query(
    `UPDATE export_credits
     SET monthly_used = monthly_used + 1, daily_used = daily_used + 1, updated_at = $1
     WHERE user_id = $2`,
    [now, userId],
  );

  return {
    reservationId,
    creditsRemaining: Math.max(0, balance.monthly_limit - balance.monthly_used - 1),
  };
}

export async function confirmExport(reservationId: string): Promise<void> {
  const now = nowMs();
  // eslint-disable-next-line quotes
  await query(
    "UPDATE export_transactions SET status = 'confirmed', completed_at = $1 WHERE id = $2 AND status = 'reserved'",
    [now, reservationId],
  );
}

export async function cancelReservation(reservationId: string): Promise<void> {
  await withTransaction(async (q) => {
    const tx = await q<CreditTransactionRow>(
      'SELECT id, user_id, status FROM export_transactions WHERE id = $1',
      [reservationId],
    );

    if (tx.rowCount === 0 || !tx.rows[0] || tx.rows[0].status !== 'reserved') {
      return;
    }

    const now = nowMs();
    await q(
      "UPDATE export_transactions SET status = 'cancelled', completed_at = $1 WHERE id = $2",
      [now, reservationId],
    );

    await q(
      `UPDATE export_credits
       SET monthly_used = GREATEST(0, monthly_used - 1),
           daily_used = GREATEST(0, daily_used - 1),
           updated_at = $1
       WHERE user_id = $2`,
      [now, tx.rows[0].user_id],
    );
  });
}

export async function getCreditBalance(
  userId: string,
): Promise<{
  monthlyUsed: number;
  monthlyLimit: number;
  dailyUsed: number;
  dailyLimit: number;
  planId: string;
}> {
  const subscription = await import('@/lib/subscriptions/subscription-manager').then((m) =>
    m.getActiveSubscription(userId),
  );

  if (!subscription) {
    return { monthlyUsed: 0, monthlyLimit: 0, dailyUsed: 0, dailyLimit: 0, planId: 'free' };
  }

  const planId = subscription.planId as CreditPlanId;
  const balance = await getOrCreateBalance(userId, planId);

  return {
    monthlyUsed: balance.monthly_used,
    monthlyLimit: balance.monthly_limit,
    dailyUsed: balance.daily_used,
    dailyLimit: balance.daily_limit,
    planId,
  };
}
