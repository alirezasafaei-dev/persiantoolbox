import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: false, error: 'AUTH_DISABLED_IN_V1_1_1' }, { status: 410 });
}
