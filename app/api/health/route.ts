import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    return pkg.version ?? 'unknown';
  } catch {
    return process.env['npm_package_version'] ?? 'unknown';
  }
}

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

export async function GET() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const [db, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const healthy = db.ok && redis.ok;
  const status = healthy ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      version: getVersion(),
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
      },
    },
    { status: healthy ? 200 : 503 },
  );
}
