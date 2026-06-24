/**
 * Usage Tracking System
 * Tracks daily usage limits for free users
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';

interface UsageRecord {
  id: string;
  userId: string;
  toolId: string;
  date: string; // YYYY-MM-DD format
  count: number;
  lastUsedAt: string;
}

const FREE_DAILY_LIMIT = 10; // 10 uses per tool per day for free users

export async function trackUsage(
  userId: string,
  toolId: string,
): Promise<{ allowed: boolean; remaining: number; resetTime: string }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if usage record exists for today
  const existing = await query(
    'SELECT * FROM usage_tracking WHERE user_id = $1 AND tool_id = $2 AND date = $3',
    [userId, toolId, today],
  );

  if ((existing.rowCount ?? 0) === 0) {
    // First usage today
    await query(
      `INSERT INTO usage_tracking (id, user_id, tool_id, date, count, last_used_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, toolId, today, 1, Date.now()],
    );

    return {
      allowed: true,
      remaining: FREE_DAILY_LIMIT - 1,
      resetTime: getNextDayMidnight(),
    };
  }

  const usage = existing.rows[0] as UsageRecord;
  const newCount = usage.count + 1;

  if (newCount > FREE_DAILY_LIMIT) {
    // Limit reached
    return {
      allowed: false,
      remaining: 0,
      resetTime: getNextDayMidnight(),
    };
  }

  // Update usage count
  await query('UPDATE usage_tracking SET count = $1, last_used_at = $2 WHERE id = $3', [
    newCount,
    Date.now(),
    usage.id,
  ]);

  return {
    allowed: true,
    remaining: FREE_DAILY_LIMIT - newCount,
    resetTime: getNextDayMidnight(),
  };
}

export async function getUsageStatus(
  userId: string,
  toolId: string,
): Promise<{
  used: number;
  remaining: number;
  limit: number;
  resetTime: string;
  isPremium: boolean;
}> {
  const today = new Date().toISOString().split('T')[0];

  // Check if user has premium subscription
  const subscription = await query(
    "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' AND expires_at > $2",
    [userId, Date.now()],
  );

  const isPremium = (subscription.rowCount ?? 0) > 0;

  if (isPremium) {
    // Premium users have unlimited usage
    return {
      used: 0,
      remaining: -1, // -1 means unlimited
      limit: -1,
      resetTime: getNextDayMidnight(),
      isPremium: true,
    };
  }

  const usage = await query(
    'SELECT * FROM usage_tracking WHERE user_id = $1 AND tool_id = $2 AND date = $3',
    [userId, toolId, today],
  );

  const used = (usage.rowCount ?? 0) > 0 ? (usage.rows[0] as UsageRecord).count : 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);

  return {
    used,
    remaining,
    limit: FREE_DAILY_LIMIT,
    resetTime: getNextDayMidnight(),
    isPremium: false,
  };
}

function getNextDayMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

export async function checkUsageLimit(userId: string, toolId: string): Promise<boolean> {
  const status = await getUsageStatus(userId, toolId);
  return status.remaining > 0 || status.isPremium;
}
