import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';

export const dynamic = 'force-dynamic';
const READINESS_CACHE_CONTROL = 'no-store';

export async function GET() {
  const startedAt = Date.now();
  const runtime = getRuntimeVersion();
  // جای چک‌های وابستگی (DB/Redis) در آینده
  return NextResponse.json(
    {
      status: 'ready',
      ok: true,
      service: 'persiantoolbox',
      version: runtime.version,
      commit: runtime.commit,
      branch: runtime.branch,
      builtAt: runtime.builtAt,
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - startedAt,
    },
    {
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
