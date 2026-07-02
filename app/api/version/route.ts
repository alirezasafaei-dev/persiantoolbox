import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';

export const dynamic = 'force-dynamic';

export async function GET() {
  const runtime = getRuntimeVersion();
  return NextResponse.json({
    service: 'persiantoolbox',
    version: runtime.version,
    commit: runtime.commit,
    branch: runtime.branch,
    builtAt: runtime.builtAt,
    timestamp: new Date().toISOString(),
  });
}
