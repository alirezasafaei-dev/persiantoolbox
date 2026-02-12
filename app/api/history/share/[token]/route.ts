import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  void _request;
  return NextResponse.json({ ok: false, error: 'HISTORY_SHARING_DISABLED_IN_V2' }, { status: 410 });
}
