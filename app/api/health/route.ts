import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type DependencyStatus = {
  ok: boolean;
  configured: boolean;
  latencyMs?: number;
  error?: string;
};

async function checkDatabase(): Promise<DependencyStatus> {
  if (!process.env['DATABASE_URL']) {
    return {
      ok: process.env['NODE_ENV'] !== 'production',
      configured: false,
      error: 'DATABASE_URL is not configured',
    };
  }
  try {
    const start = Date.now();
    const { query } = await import('@/lib/server/db');
    await query('SELECT 1');
    return { ok: true, configured: true, latencyMs: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

async function checkRedis(): Promise<DependencyStatus> {
  if (!process.env['REDIS_URL']) {
    return {
      ok: process.env['NODE_ENV'] !== 'production',
      configured: false,
      error: 'REDIS_URL is not configured',
    };
  }
  try {
    const start = Date.now();
    const { redisHealthCheck } = await import('@/lib/server/redis');
    const available = await redisHealthCheck();
    return available
      ? { ok: true, configured: true, latencyMs: Date.now() - start }
      : { ok: false, configured: true, error: 'Redis is unavailable' };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

function checkPaymentGateway(): {
  ok: boolean;
  configured: boolean;
  required: boolean;
  sandbox: boolean;
  warning?: string;
} {
  const merchantId = process.env['ZARINPAL_MERCHANT_ID']?.trim() ?? '';
  const configured = merchantId.length > 0;
  const required = isFeatureEnabled('checkout') || isFeatureEnabled('subscription');
  return {
    ok: configured || !required || process.env['NODE_ENV'] !== 'production',
    configured,
    required,
    sandbox: process.env['ZARINPAL_MODE'] === 'sandbox',
    ...(!configured && required
      ? { warning: 'ZARINPAL_MERCHANT_ID not configured — checkout is not production-ready' }
      : {}),
  };
}

export async function GET() {
  const runtime = getRuntimeVersion();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const paymentGateway = checkPaymentGateway();
  const ready = database.ok && redis.ok && paymentGateway.ok;

  return NextResponse.json(
    {
      status: ready ? 'ok' : 'degraded',
      ready,
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
      dependencies: { database, redis, paymentGateway },
    },
    { status: ready ? 200 : 503 },
  );
}
