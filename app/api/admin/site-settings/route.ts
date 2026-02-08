import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import {
  SiteSettingsStorageUnavailableError,
  getPublicSiteSettings,
  updateSiteSettings,
} from '@/lib/server/siteSettings';
import { validateSiteSettingsPatch } from '@/lib/siteSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminCheck = await requireAdminFromRequest(request);
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false }, { status: adminCheck.status });
  }

  const settings = await getPublicSiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  const adminCheck = await requireAdminFromRequest(request);
  if (!adminCheck.ok) {
    return NextResponse.json({ ok: false }, { status: adminCheck.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const validated = validateSiteSettingsPatch(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, errors: validated.errors }, { status: 400 });
  }

  try {
    const settings = await updateSiteSettings(validated.value);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    if (error instanceof SiteSettingsStorageUnavailableError) {
      return NextResponse.json(
        {
          ok: false,
          errors: ['ذخیره تنظیمات نیازمند DATABASE_URL و جدول site_settings است.'],
        },
        { status: 503 },
      );
    }
    throw error;
  }
}
