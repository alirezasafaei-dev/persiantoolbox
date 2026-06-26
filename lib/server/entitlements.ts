import { query } from './db';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';

type FeatureKey =
  | 'financial_scenarios_saved'
  | 'financial_reports_generated'
  | 'pdf_files_processed'
  | 'ai_generations';

export const FREE_DAILY_TOOL_LIMIT = 10;

const FREE_LIMITS: Record<FeatureKey, number> = {
  financial_scenarios_saved: 3,
  financial_reports_generated: 1,
  pdf_files_processed: 5,
  ai_generations: 10,
};

const PREMIUM_LIMITS: Record<FeatureKey, number> = {
  financial_scenarios_saved: 100,
  financial_reports_generated: 50,
  pdf_files_processed: 200,
  ai_generations: 500,
};

export async function checkDailyToolLimit(
  userId: string,
): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  isPremium: boolean;
}> {
  const subscription = await getActiveSubscription(userId);
  const isPremium = !!subscription;

  if (isPremium) {
    return { allowed: true, used: 0, remaining: -1, limit: -1, isPremium: true };
  }

  const today = new Date().toISOString().split('T')[0];
  const result = await query(
    'SELECT COALESCE(SUM(count), 0)::int AS total FROM usage_tracking WHERE user_id = $1 AND date = $2',
    [userId, today],
  );

  const used = (result.rows[0] as { total: number }).total ?? 0;
  const remaining = Math.max(0, FREE_DAILY_TOOL_LIMIT - used);

  return {
    allowed: remaining > 0,
    used,
    remaining,
    limit: FREE_DAILY_TOOL_LIMIT,
    isPremium: false,
  };
}

export async function getDailyUsage(
  userId: string,
): Promise<{ used: number; limit: number; isPremium: boolean }> {
  const subscription = await getActiveSubscription(userId);
  const isPremium = !!subscription;

  if (isPremium) {
    return { used: 0, limit: -1, isPremium: true };
  }

  const today = new Date().toISOString().split('T')[0];
  const result = await query(
    'SELECT COALESCE(SUM(count), 0)::int AS total FROM usage_tracking WHERE user_id = $1 AND date = $2',
    [userId, today],
  );

  const used = (result.rows[0] as { total: number }).total ?? 0;
  return { used, limit: FREE_DAILY_TOOL_LIMIT, isPremium: false };
}

export async function checkEntitlement(
  userId: string,
  feature: FeatureKey,
): Promise<{ allowed: boolean; remaining: number; limit: number; isPremium: boolean }> {
  const subscription = await getActiveSubscription(userId);
  const isPremium = !!subscription;
  const limit = isPremium ? PREMIUM_LIMITS[feature] : FREE_LIMITS[feature];

  const today = new Date().toISOString().split('T')[0];
  const result = await query(
    'SELECT count FROM usage_tracking WHERE user_id = $1 AND tool_id = $2 AND date = $3',
    [userId, feature, today],
  );

  const used = (result.rowCount ?? 0) > 0 ? (result.rows[0] as { count: number }).count : 0;
  const remaining = Math.max(0, limit - used);

  return { allowed: remaining > 0, remaining, limit, isPremium };
}

export async function recordFeatureUsage(userId: string, feature: FeatureKey): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await query(
    `INSERT INTO usage_tracking (id, user_id, tool_id, date, count, last_used_at)
     VALUES (gen_random_uuid(), $1, $2, $3, 1, $4)
     ON CONFLICT (user_id, tool_id, date)
     DO UPDATE SET count = usage_tracking.count + 1, last_used_at = $4`,
    [userId, feature, today, Date.now()],
  );
}
