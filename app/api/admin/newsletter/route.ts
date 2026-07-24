import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getNewsletterService } from '@/lib/server/newsletter-service';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  logApiEvent(request, { route: 'admin.newsletter.get', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  try {
    const service = getNewsletterService();
    const [subscribers, count] = await Promise.all([service.list(), service.count()]);
    logApiEvent(request, { route: 'admin.newsletter.get', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, count, subscribers });
  } catch {
    logApiEvent(request, { route: 'admin.newsletter.get', event: 'error', status: 500 });
    return NextResponse.json({ ok: false, error: 'خطا در دریافت لیست خبرنامه.' }, { status: 500 });
  }
}
