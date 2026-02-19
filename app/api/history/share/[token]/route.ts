import { disabledApiResponse } from '@/lib/server/feature-flags';

export async function GET(_request: Request) {
  void _request;
  return disabledApiResponse('history-share');
}
