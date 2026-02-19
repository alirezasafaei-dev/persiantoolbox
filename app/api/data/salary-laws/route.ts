import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildEtag(raw: string): string {
  const digest = createHash('sha256').update(raw).digest('base64url');
  return `"salary-laws-v1-${digest}"`;
}

export async function GET(request: Request) {
  const filePath = resolve(process.cwd(), 'data/salary-laws/v1.json');
  const raw = readFileSync(filePath, 'utf8');
  const stat = statSync(filePath);
  const etag = buildEtag(raw);
  const ifNoneMatch = request.headers.get('if-none-match');
  const headers = {
    ETag: etag,
    'Last-Modified': stat.mtime.toUTCString(),
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  };

  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  const payload = JSON.parse(raw);

  return NextResponse.json(payload, {
    status: 200,
    headers,
  });
}
