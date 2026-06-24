import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import {
  getIndexingStatus,
  getSitemapStatus,
  searchConsoleHealthCheck,
} from '@/lib/server/google-search-console';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? 'health';

  try {
    switch (action) {
      case 'health': {
        const result = await searchConsoleHealthCheck();
        return NextResponse.json(result);
      }
      case 'indexing': {
        const result = await getIndexingStatus();
        return NextResponse.json(result);
      }
      case 'sitemaps': {
        const result = await getSitemapStatus();
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
