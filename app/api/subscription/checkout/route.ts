import { disabledApiResponse } from '@/lib/server/feature-flags';

export async function POST(_request: Request) {
  void _request;
  return disabledApiResponse('subscription');
}
