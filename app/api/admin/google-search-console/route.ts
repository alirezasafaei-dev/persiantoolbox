import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import {
  getIndexingStatus,
  getSearchPerformance,
  getSitemapStatus,
  searchConsoleHealthCheck,
  type SearchPerformanceOptions,
} from '@/lib/server/google-search-console';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const parseRowLimit = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
    throw new Error('rowLimit must be an integer between 1 and 1000');
  }
  return parsed;
};

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? 'health';

  try {
    switch (action) {
      case 'health':
        return NextResponse.json(await searchConsoleHealthCheck());
      case 'indexing':
        return NextResponse.json(await getIndexingStatus());
      case 'performance': {
        const page = url.searchParams.get('page')?.trim();
        const rowLimit = parseRowLimit(url.searchParams.get('rowLimit'));
        const options: SearchPerformanceOptions = {
          ...(page ? { page } : {}),
          ...(rowLimit !== undefined ? { rowLimit } : {}),
        };
        return NextResponse.json(await getSearchPerformance(options));
      }
      case 'sitemaps':
        return NextResponse.json(await getSitemapStatus());
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    const status = /rowLimit|Page filter/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
