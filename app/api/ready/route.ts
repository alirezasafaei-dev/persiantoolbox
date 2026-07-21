import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';
const READINESS_CACHE_CONTROL = 'no-store';

type DependencyStatus = {
  ok: boolean;
  configured: boolean;
  required: boolean;
  available: boolean;
  latencyMs?: number;
  error?: string;
  warning?: string;
};

async function checkDatabase(): Promise<DependencyStatus> {
  if (!process.env['DATABASE_URL']) {
    return {
      ok: false,
      configured: false,
      required: true,
      available: false,
      error: 'DATABASE_URL is not configured',
    };
  }
  try {
    const start = Date.now();
    const { query } = await import('@/lib/server/db');
    await query('SELECT 1');
    return {
      ok: true,
      configured: true,
      required: true,
      available: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      required: true,
      available: false,
      error: error instanceof Error ? error.message : 'unknown',
    };
  }
}

async function checkRedis(): Promise<DependencyStatus> {
  const required = process.env['REDIS_REQUIRED'] === 'true';
  if (!process.env['REDIS_URL']) {
    return {
      ok: !required,
      configured: false,
      required,
      available: false,
      ...(required
        ? { error: 'REDIS_URL is required but not configured' }
        : { warning: 'Redis is optional and not configured; using no-cache fallback' }),
    };
  }

  try {
    const start = Date.now();
    const { redisHealthCheck } = await import('@/lib/server/redis');
    const available = await redisHealthCheck();
    if (available) {
      return {
        ok: true,
        configured: true,
        required,
        available: true,
        latencyMs: Date.now() - start,
      };
    }

    return {
      ok: !required,
      configured: true,
      required,
      available: false,
      ...(required
        ? { error: 'Redis ping failed' }
        : { warning: 'Redis unavailable; using no-cache fallback' }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    return {
      ok: !required,
      configured: true,
      required,
      available: false,
      ...(required ? { error: message } : { warning: `Redis unavailable: ${message}` }),
    };
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
  const releaseIdentity = {
    ok: process.env['NODE_ENV'] !== 'production' || runtime.commit !== null,
    required: process.env['NODE_ENV'] === 'production',
    commit: runtime.commit,
    ...(process.env['NODE_ENV'] === 'production' && runtime.commit === null
      ? { error: 'RELEASE_GIT_SHA is missing' }
      : {}),
  };
  const ready = database.ok && redis.ok && paymentGateway.ok && releaseIdentity.ok;

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      ok: ready,
      service: 'persiantoolbox',
      version: runtime.version,
      commit: runtime.commit,
      branch: runtime.branch,
      builtAt: runtime.builtAt,
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - startedAt,
      dependencies: { database, redis, paymentGateway, releaseIdentity },
    },
    {
      status: ready ? 200 : 503,
      headers: { 'Cache-Control': READINESS_CACHE_CONTROL },
    },
  );
}

export async function HEAD() {
  const response = await GET();
  return new NextResponse(null, { status: response.status, headers: response.headers });
}
