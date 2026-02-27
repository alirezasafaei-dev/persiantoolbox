import { NextResponse } from 'next/server';
import { getRuntimeVersion } from '@/lib/runtime-version';

export const dynamic = 'force-dynamic';

export async function GET() {
  const runtime = getRuntimeVersion();
  return NextResponse.json({
    service: 'persiantoolbox',
    version: runtime.version,
    commit: runtime.commit,
    timestamp: new Date().toISOString(),
  });
}
