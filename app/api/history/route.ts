import { disabledApiResponse } from '@/lib/server/feature-flags';

export async function GET(_request: Request) {
  void _request;
  return disabledApiResponse('history');
}

export async function POST(_request: Request) {
  void _request;
  return disabledApiResponse('history');
}

export async function DELETE(_request: Request) {
  void _request;
  return disabledApiResponse('history');
}
