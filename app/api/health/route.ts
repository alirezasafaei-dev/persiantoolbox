import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function checkDatabase(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!process.env['DATABASE_URL']) {
    return { ok: true, latencyMs: 0 };
  }
  try {
    const start = Date.now();
    const { query } = await import('@/lib/server/db');
    await query('SELECT 1');
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}

async function checkRedis(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!process.env['REDIS_URL']) {
    return { ok: true, latencyMs: 0 };
  }
  try {
    const start = Date.now();
    const { redisIsAvailable } = await import('@/lib/server/redis');
    redisIsAvailable();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}

function checkPaymentGateway(): { configured: boolean; sandbox: boolean; warning: string | undefined } {
  const merchantId = process.env['ZARINPAL_MERCHANT_ID'];
  const sandbox = process.env['ZARINPAL_MODE'] === 'sandbox';
  const configured = Boolean(merchantId && merchantId.length > 0);
  return {
    configured,
    sandbox,
    warning: configured
      ? undefined
      : 'ZARINPAL_MERCHANT_ID not configured — payment gateway disabled in production',
  };
}

export async function GET() {
  const runtime = getRuntimeVersion();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const [db, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const paymentGateway = checkPaymentGateway();

  const healthy = db.ok && redis.ok;
  const status = healthy ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      version: runtime.version,
      commit: runtime.commit,
      branch: runtime.branch,
      builtAt: runtime.builtAt,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      node: process.version,
      dependencies: {
        database: db,
        redis,
        paymentGateway,
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
