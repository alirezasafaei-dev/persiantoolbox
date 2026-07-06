import { NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ShareLinkRow = {
  token: string;
  entry_id: string;
  created_at: number;
  expires_at: number;
  output_url: string | null;
};

type HistoryEntryRow = {
  id: string;
  tool: string;
  input_summary: string;
  output_summary: string;
  output_url: string | null;
  created_at: number;
};

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    if (!isFeatureEnabled('history-share')) {
      return NextResponse.json({ error: 'Feature disabled' }, { status: 410 });
    }

    const { token } = await params;

    const linkResult = await query<ShareLinkRow>(
      'SELECT * FROM history_share_links WHERE token = $1 LIMIT 1',
      [token],
    );

    if (linkResult.rowCount === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const link = linkResult.rows[0] as ShareLinkRow;

    if (Date.now() > link.expires_at) {
      await query('DELETE FROM history_share_links WHERE token = $1', [token]);
      return NextResponse.json({ error: 'Link expired' }, { status: 410 });
    }

    const entryResult = await query<HistoryEntryRow>(
      'SELECT * FROM history_entries WHERE id = $1 LIMIT 1',
      [link.entry_id],
    );

    if (entryResult.rowCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entry = entryResult.rows[0] as HistoryEntryRow;

    return NextResponse.json({
      entry: {
        tool: entry.tool,
        inputSummary: entry.input_summary,
        outputSummary: entry.output_summary,
        outputUrl: entry.output_url,
        createdAt: entry.created_at,
      },
      expiresAt: link.expires_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
