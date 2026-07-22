import { NextResponse } from 'next/server';
import { getDefaultSiteUrl } from '@/lib/brand';
import { buildOpenApiDocument } from '@/lib/developer-api-catalog';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  const document = buildOpenApiDocument(getDefaultSiteUrl());

  return NextResponse.json(document, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Disposition': 'inline; filename="persiantoolbox-openapi.json"',
    },
  });
}
