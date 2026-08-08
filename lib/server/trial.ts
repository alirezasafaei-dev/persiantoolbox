import { randomUUID } from 'node:crypto';
import type { QueryResult, QueryResultRow } from 'pg';
import { query, withTransaction } from './db';

const TRIAL_DAYS = 7;
const TRIAL_PLAN_ID = 'trial';

type TransactionQuery = <R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: Array<unknown>,
) => Promise<QueryResult<R>>;

export type SignupGiftStatus = 'available' | 'consumed' | 'expired';

export async function createSignupGiftInTransaction(
  txQuery: TransactionQuery,
  userId: string,
): Promise<void> {
  await txQuery('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
    `signup-gift:${userId}`,
  ]);
  const existing = await txQuery(
    'SELECT id FROM subscriptions WHERE user_id = $1 AND plan_id = $2 LIMIT 1',
    [userId, TRIAL_PLAN_ID],
  );
  if ((existing.rowCount ?? 0) > 0) {
    return;
  }

  const now = Date.now();
  await txQuery(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, 'active', $4, $5)
     ON CONFLICT DO NOTHING`,
    [randomUUID(), userId, TRIAL_PLAN_ID, now, now + TRIAL_DAYS * 24 * 60 * 60 * 1000],
  );
}

export async function startTrial(userId: string): Promise<void> {
  await withTransaction((txQuery) => createSignupGiftInTransaction(txQuery, userId));
}

export async function getSignupGiftStatus(
  userId: string,
): Promise<{ status: SignupGiftStatus; remainingDays: number }> {
  const result = await query<{ expires_at: number | string; consumed: boolean }>(
    `SELECT s.expires_at,
            EXISTS (
              SELECT 1 FROM export_transactions et
              WHERE et.user_id = s.user_id AND et.status = 'confirmed'
            ) AS consumed
     FROM subscriptions s
     WHERE s.user_id = $1 AND s.plan_id = $2
     ORDER BY s.started_at ASC LIMIT 1`,
    [userId, TRIAL_PLAN_ID],
  );
  const gift = result.rows[0];
  if (!gift || Number(gift.expires_at) <= Date.now()) {
    return { status: 'expired', remainingDays: 0 };
  }
  const remainingDays = Math.max(
    0,
    Math.ceil((Number(gift.expires_at) - Date.now()) / (24 * 60 * 60 * 1000)),
  );
  return { status: gift.consumed ? 'consumed' : 'available', remainingDays };
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
