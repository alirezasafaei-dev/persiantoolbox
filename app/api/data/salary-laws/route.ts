import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = resolve(process.cwd(), 'data/salary-laws/v1.json');
  const raw = readFileSync(filePath, 'utf8');
  const payload = JSON.parse(raw);

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
