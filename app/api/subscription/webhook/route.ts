import { NextResponse } from 'next/server';

export function __resetWebhookReplayCacheForTests(): void {
  // no-op: webhook flow is disabled in v2
}

export async function POST(_request: Request) {
  void _request;
  return NextResponse.json({ ok: false, error: 'SUBSCRIPTION_DISABLED_IN_V2' }, { status: 410 });
}
