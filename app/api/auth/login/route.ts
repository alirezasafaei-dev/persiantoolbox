import { disabledApiResponse } from '@/lib/server/feature-flags';

export async function POST() {
  return disabledApiResponse('auth');
}
