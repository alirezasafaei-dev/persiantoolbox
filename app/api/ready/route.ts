import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';
const READINESS_CACHE_CONTROL = 'no-store';

async function checkDatabase(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!process.env['DATABASE_URL']) {
    return { ok: false, error: 'DATABASE_URL is not configured' };
  }
  try {
    const start = Date.now();
    const { query } = await import('@/lib/server/db');
    await query('SELECT 1');
    return { ok: true, latencyMs: Date.now() - start };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'unknown' };
  }
}

async function checkRedis(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!process.env['REDIS_URL']) {
    return { ok: false, error: 'REDIS_URL is not configured' };
  }
  try {
    const start = Date.now();
    const { redisHealthCheck } = await import('@/lib/server/redis');
    const available = await redisHealthCheck();
    return available
      ? { ok: true, latencyMs: Date.now() - start }
      : { ok: false, error: 'Redis ping failed' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'unknown' };
  }
}

function checkPaymentGateway(): { ok: boolean; configured: boolean; required: boolean } {
  const merchantId = process.env['ZARINPAL_MERCHANT_ID']?.trim() ?? '';
  const configured = merchantId.length > 0;
  const required = isFeatureEnabled('checkout') || isFeatureEnabled('subscription');
  return {
    ok: configured || !required || process.env['NODE_ENV'] !== 'production',
    configured,
    required,
  };
}

export async function GET() {
  const startedAt = Date.now();
  const runtime = getRuntimeVersion();

  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const paymentGateway = checkPaymentGateway();

  const ready = database.ok && redis.ok && paymentGateway.ok;
  const status = ready ? 'ready' : 'not_ready';

  return NextResponse.json(
    {
      status,
      ok: ready,
      service: 'persiantoolbox',
      version: runtime.version,
      commit: runtime.commit,
      branch: runtime.branch,
      builtAt: runtime.builtAt,
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - startedAt,
      dependencies: {
        database,
        redis,
        paymentGateway,
      },
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'Cache-Control': READINESS_CACHE_CONTROL,
      },
    },
  );
}

export async function HEAD() {
  const response = await GET();
  return new NextResponse(null, { status: response.status, headers: response.headers });
}
