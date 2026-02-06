import { NextRequest, NextResponse } from 'next/server';
import { getHistoryShareLink } from '@/lib/server/historyShare';

function resolveShareTarget(requestUrl: string, outputUrl: string): URL | null {
  if (outputUrl.startsWith('/')) {
    return new URL(outputUrl, requestUrl);
  }
  if (outputUrl.startsWith('http://') || outputUrl.startsWith('https://')) {
    const target = new URL(outputUrl);
    const origin = new URL(requestUrl).origin;
    if (target.origin === origin) {
      return target;
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'INVALID_TOKEN' }, { status: 400 });
  }

  const link = await getHistoryShareLink(token);
  if (!link?.outputUrl) {
    return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  }

  if (Date.now() > link.expiresAt) {
    return NextResponse.json({ ok: false, error: 'EXPIRED' }, { status: 410 });
  }

  const target = resolveShareTarget(request.url, link.outputUrl);
  if (!target) {
    return NextResponse.json({ ok: false, error: 'INVALID_TARGET' }, { status: 422 });
  }

  return NextResponse.redirect(target);
}
