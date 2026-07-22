import { randomUUID } from 'node:crypto';
import { query } from './db';

const TRIAL_DAYS = 7;
const TRIAL_PLAN_ID = 'trial';

export async function startTrial(userId: string): Promise<void> {
  const existing = await query(
    'SELECT id FROM subscriptions WHERE user_id = $1 AND plan_id = $2 LIMIT 1',
    [userId, TRIAL_PLAN_ID],
  );
  if ((existing.rowCount ?? 0) > 0) {
    return;
  }

  const now = Date.now();
  const endDate = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;

  await query(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, 'active', $4, $5)`,
    [`sub_${randomUUID()}`, userId, TRIAL_PLAN_ID, now, endDate],
  );
}

export async function isTrialActive(userId: string): Promise<boolean> {
  const result = await query(
    "SELECT 1 FROM subscriptions WHERE user_id = $1 AND plan_id = $2 AND status = 'active' AND expires_at > $3 LIMIT 1",
    [userId, TRIAL_PLAN_ID, Date.now()],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getTrialRemainingDays(userId: string): Promise<number> {
  const result = await query<{ expires_at: number }>(
    "SELECT expires_at FROM subscriptions WHERE user_id = $1 AND plan_id = $2 AND status = 'active' AND expires_at > $3 LIMIT 1",
    [userId, TRIAL_PLAN_ID, Date.now()],
  );
  if ((result.rowCount ?? 0) === 0 || !result.rows[0]) {
    return 0;
  }
  const remainingMs = result.rows[0].expires_at - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export async function hasTrialEver(userId: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM subscriptions WHERE user_id = $1 AND plan_id = $2 LIMIT 1',
    [userId, TRIAL_PLAN_ID],
  );
  return (result.rowCount ?? 0) > 0;
}
