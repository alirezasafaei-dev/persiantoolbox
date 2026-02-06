import { prisma } from './db';

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitTx = {
  rateLimit: {
    findUnique: (args: {
      where: { key: string };
    }) => Promise<{ key: string; count: number; windowStart: bigint } | null>;
    upsert: (args: {
      where: { key: string };
      update: { count: number; windowStart: bigint };
      create: { key: string; count: number; windowStart: bigint };
    }) => Promise<unknown>;
    update: (args: { where: { key: string }; data: { count: number } }) => Promise<unknown>;
  };
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function getDayBucket(timestamp: number): bigint {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return BigInt(date.getTime());
}

async function recordRateLimitBlock(key: string, timestamp: number) {
  if (process.env['RATE_LIMIT_LOG'] !== 'true') {
    return;
  }
  const bucketDay = getDayBucket(timestamp);
  const metricClient = prisma.rateLimitMetric;
  await metricClient.upsert({
    where: { key_bucketDay: { key, bucketDay } },
    update: { blocked: { increment: 1 } },
    create: { key, bucketDay, blocked: 1 },
  });
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
  const windowStart = BigInt(now);

  return prisma.$transaction(async (tx: RateLimitTx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });

    if (!existing || now - Number(existing.windowStart) >= windowMs) {
      await tx.rateLimit.upsert({
        where: { key },
        update: { count: 1, windowStart },
        create: { key, count: 1, windowStart },
      });
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
        resetAt: Number(existing.windowStart) + windowMs,
      };
    }

    const nextCount = existing.count + 1;
    await tx.rateLimit.update({
      where: { key },
      data: { count: nextCount },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - nextCount),
      resetAt: Number(existing.windowStart) + windowMs,
    };
  });
}
