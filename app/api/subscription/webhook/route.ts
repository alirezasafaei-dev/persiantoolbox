import { disabledApiResponse } from '@/lib/server/feature-flags';

export function __resetWebhookReplayCacheForTests(): void {
  // no-op: webhook flow is disabled in v2
}

export async function POST(_request: Request) {
  void _request;
  return disabledApiResponse('subscription');
}
