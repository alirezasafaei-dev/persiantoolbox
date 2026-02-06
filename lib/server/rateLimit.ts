import { query, withTransaction } from './db';

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitRow = {
  key: string;
  count: number;
  window_start: number | string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function getDayBucket(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

async function recordRateLimitBlock(key: string, timestamp: number) {
  if (process.env['RATE_LIMIT_LOG'] !== 'true') {
    return;
  }

  const bucketDay = getDayBucket(timestamp);
  await query(
    `INSERT INTO rate_limit_metrics (key, bucket_day, blocked)
     VALUES ($1, $2, 1)
     ON CONFLICT (key, bucket_day)
     DO UPDATE SET blocked = rate_limit_metrics.blocked + 1`,
    [key, bucketDay],
  );
}

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  return 'unknown';
}

export function makeRateLimitKey(prefix: string, request: Request, id?: string | null): string {
  const ip = getRequestIp(request);
  return id ? `${prefix}:${id}:${ip}` : `${prefix}:${ip}`;
}

export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();

  return withTransaction(async (txn) => {
    const existingResult = await txn<RateLimitRow>(
      `SELECT key, count, window_start
       FROM rate_limits
       WHERE key = $1
       LIMIT 1`,
      [key],
    );
    const existing = existingResult.rows[0] ?? null;

    if (!existing || now - Number(existing.window_start) >= windowMs) {
      await txn(
        `INSERT INTO rate_limits (key, count, window_start)
         VALUES ($1, $2, $3)
         ON CONFLICT (key)
         DO UPDATE SET count = EXCLUDED.count, window_start = EXCLUDED.window_start`,
        [key, 1, now],
      );
      return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
    }

    if (existing.count >= limit) {
      if (process.env['RATE_LIMIT_LOG'] === 'true') {
        // Lightweight server-side signal for ops/monitoring.
        // eslint-disable-next-line no-console
        console.warn('[rate-limit]', { key, limit, windowMs, blockedAt: now });
      }
      await recordRateLimitBlock(key, now);
      return {
        allowed: false,
        remaining: 0,
        resetAt: Number(existing.window_start) + windowMs,
      };
    }

    const nextCount = existing.count + 1;
    await txn('UPDATE rate_limits SET count = $1 WHERE key = $2', [nextCount, key]);

    return {
      allowed: true,
      remaining: Math.max(0, limit - nextCount),
      resetAt: Number(existing.window_start) + windowMs,
    };
  });
}
