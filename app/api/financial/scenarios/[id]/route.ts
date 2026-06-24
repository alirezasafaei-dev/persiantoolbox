import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
  }

  const { id } = await params;
  const result = await query(
    'SELECT id, title, scenario_type, inputs, outputs, notes, created_at, updated_at FROM financial_scenarios WHERE id = $1 AND user_id = $2',
    [id, user.id],
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, scenario: result.rows[0] });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const { title, inputs, outputs, notes } = body as {
    title?: string;
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    notes?: string;
  };

  const now = Date.now();
  const result = await query(
    'UPDATE financial_scenarios SET title = COALESCE($1, title), inputs = COALESCE($2, inputs), outputs = COALESCE($3, outputs), notes = COALESCE($4, notes), updated_at = $5 WHERE id = $6 AND user_id = $7 RETURNING id',
    [title ?? null, inputs ? JSON.stringify(inputs) : null, outputs ? JSON.stringify(outputs) : null, notes ?? null, now, id, user.id],
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
  }

  const { id } = await params;
  await query('DELETE FROM financial_scenarios WHERE id = $1 AND user_id = $2', [id, user.id]);
  return NextResponse.json({ ok: true });
}
