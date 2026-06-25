import { NextResponse } from 'next/server';
import { getPublicSiteSettings } from '@/lib/server/siteSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load settings' }, { status: 500 });
  }
}
