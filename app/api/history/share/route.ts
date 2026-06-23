import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isFeatureEnabled('history-share')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 410 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { entryId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.entryId) {
    return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
  }

  const entryResult = await query<{ id: string }>(
    'SELECT id FROM history_entries WHERE id = $1 AND user_id = $2 LIMIT 1',
    [body.entryId, user.id],
  );

  if (entryResult.rowCount === 0) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  const token = randomUUID();
  const now = Date.now();
  const expiresAt = now + SHARE_TTL_MS;

  await query(
    `INSERT INTO history_share_links (token, entry_id, user_id, created_at, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [token, body.entryId, user.id, now, expiresAt],
  );

  return NextResponse.json({
    token,
    url: `/history/share/${token}`,
    expiresAt,
  });
}
