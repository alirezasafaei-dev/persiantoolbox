import { clearSessionResponse } from '@/lib/server/auth';

export async function POST(request: Request) {
  return clearSessionResponse(request);
}
