import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // جای چک‌های وابستگی (DB/Redis) در آینده
  return NextResponse.json({ status: 'ready' });
}
