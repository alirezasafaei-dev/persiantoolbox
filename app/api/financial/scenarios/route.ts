import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
  }

  const result = await query(
    'SELECT id, title, scenario_type, inputs, outputs, notes, created_at, updated_at FROM financial_scenarios WHERE user_id = $1 ORDER BY updated_at DESC',
    [user.id],
  );

  return NextResponse.json({ ok: true, scenarios: result.rows });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const { title, scenarioType, inputs, outputs, notes } = body as {
    title?: string;
    scenarioType?: string;
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    notes?: string;
  };

  if (!title || !scenarioType) {
    return NextResponse.json({ ok: false, error: 'title and scenarioType required' }, { status: 400 });
  }

  const id = randomUUID();
  const now = Date.now();

  await query(
    'INSERT INTO financial_scenarios (id, user_id, title, scenario_type, inputs, outputs, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [id, user.id, title, scenarioType, JSON.stringify(inputs ?? {}), JSON.stringify(outputs ?? {}), notes ?? '', now, now],
  );

  return NextResponse.json({ ok: true, scenario: { id, title, scenarioType, inputs, outputs, notes, createdAt: now, updatedAt: now } });
}
