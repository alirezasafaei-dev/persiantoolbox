import { disabledApiResponse } from '@/lib/server/feature-flags';

export async function GET() {
  return disabledApiResponse('auth');
}
