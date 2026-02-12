import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  void _request;
  return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_DISABLED_IN_V2' }, { status: 410 });
}
