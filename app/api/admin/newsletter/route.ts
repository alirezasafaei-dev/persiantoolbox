import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getNewsletterService } from '@/lib/server/newsletter-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  try {
    const service = getNewsletterService();
    const [subscribers, count] = await Promise.all([service.list(), service.count()]);
    return NextResponse.json({ ok: true, count, subscribers });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در دریافت لیست خبرنامه.' }, { status: 500 });
  }
}
