import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { withTransaction } from '@/lib/server/db';

const COOKIE_NAME = 'pt_ai_v';
const ID_PATTERN = /^[a-zA-Z0-9_-]{22}$/;
const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/;

export class AiQuotaExceeded extends Error {
  constructor() {
    super('AI chat quota exceeded');
    this.name = 'AiQuotaExceeded';
  }
}

export function aiFeatureEnabled(): boolean {
  // This flag must remain false until Workers Free billing mode is verified,
  // the dedicated free-only credential is configured, and Iran->provider chat succeeds.
  return process.env['FEATURE_AI_CHAT_ENABLED'] === 'true'
    && process.env['AI_CLOUDFLARE_FREE_PLAN_CONFIRMED'] === 'true';
}

function secret(): string {
  const value = process.env['AI_VISITOR_SECRET'] ?? '';
  if (value.length < 32) throw new Error('AI_VISITOR_SECRET is not configured');
  return value;
}

function signature(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function getOrCreateAiVisitor(existing: string | undefined): {
  visitor: string;
  cookie: string;
  renewed: boolean;
} {
  if (existing) {
    const parts = existing.split('.');
    const id = parts[0] ?? '';
    const supplied = parts[1] ?? '';
    if (parts.length === 2 && ID_PATTERN.test(id) && SIGNATURE_PATTERN.test(supplied)) {
      const expected = signature(id);
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
        return { visitor: id, cookie: existing, renewed: false };
      }
    }
  }
  const visitor = randomBytes(16).toString('base64url');
  return { visitor, cookie: `${visitor}.${signature(visitor)}`, renewed: true };
}

export function setAiVisitorCookie(
  response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => unknown } },
  cookie: string,
): void {
  response.cookies.set(COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/ai',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export const AI_VISITOR_COOKIE_NAME = COOKIE_NAME;

export async function consumeAiQuota(visitor: string): Promise<void> {
  // PostgreSQL is already production-required. A transaction guarantees that
  // *all* limits succeed or none is consumed, across blue/green and replicas.
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const minute = new Date(Math.floor(Date.now() / 60_000) * 60_000);
  const hashedVisitor = signature(visitor);
  const limits = [
    { key: `visitor:day:${hashedVisitor}`, bucket: day, cap: 5 },
    { key: `visitor:minute:${hashedVisitor}`, bucket: minute, cap: 2 },
    { key: 'global:day', bucket: day, cap: 40 },
    { key: 'global:minute', bucket: minute, cap: 5 },
  ];

  await withTransaction(async (query) => {
    for (const limit of limits) {
      const result = await query<{ hits: number }>(
        `INSERT INTO ai_chat_quota (quota_key, bucket_start, hits)
         VALUES ($1, $2, 1)
         ON CONFLICT (quota_key, bucket_start) DO UPDATE
           SET hits = ai_chat_quota.hits + 1
           WHERE ai_chat_quota.hits < $3
         RETURNING hits`,
        [limit.key, limit.bucket, limit.cap],
      );
      if (result.rowCount !== 1) throw new AiQuotaExceeded();
    }
  });
}
