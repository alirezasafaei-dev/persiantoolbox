import { query } from './db';

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
  try {
    await query(
      `INSERT INTO rate_limit_metrics (key, bucket_day, blocked)
       VALUES ($1, $2, 1)
       ON CONFLICT (key, bucket_day)
       DO UPDATE SET blocked = rate_limit_metrics.blocked + 1`,
      [key, bucketDay],
    );
  } catch {
    // Metrics writes are best-effort and must not break request handling.
  }
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
  const result = await query<RateLimitRow>(
    `INSERT INTO rate_limits (key, count, window_start)
     VALUES ($1, 1, $2)
     ON CONFLICT (key)
     DO UPDATE
     SET
       count = CASE
         WHEN $2 - rate_limits.window_start >= $3 THEN 1
         ELSE rate_limits.count + 1
       END,
       window_start = CASE
         WHEN $2 - rate_limits.window_start >= $3 THEN $2
         ELSE rate_limits.window_start
       END
     RETURNING key, count, window_start`,
    [key, now, windowMs],
  );

  const row = result.rows[0];
  if (!row) {
    return { allowed: false, remaining: 0, resetAt: now + windowMs };
  }

  const count = Number(row.count);
  const windowStart = Number(row.window_start);
  const allowed = count <= limit;

  if (!allowed) {
    if (process.env['RATE_LIMIT_LOG'] === 'true') {
      // Lightweight server-side signal for ops/monitoring.
      // eslint-disable-next-line no-console
      console.warn('[rate-limit]', { key, limit, windowMs, blockedAt: now });
    }
    await recordRateLimitBlock(key, now);
  }

  return {
    allowed,
    remaining: allowed ? Math.max(0, limit - count) : 0,
    resetAt: windowStart + windowMs,
  };
}
