import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // جای چک‌های وابستگی (DB/Redis) در آینده
  return NextResponse.json({
    status: 'ready',
    ok: true,
    service: 'asdev-persiantoolbox',
    timestamp: new Date().toISOString(),
  });
}

export async function HEAD() {
  const response = await GET();
  return new NextResponse(null, { status: response.status, headers: response.headers });
}
