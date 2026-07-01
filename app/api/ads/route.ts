import { NextResponse } from 'next/server';
import { resolveAdForPlacementWithFallback } from '@/lib/server/adsResolver';

export const runtime = 'nodejs';
export const revalidate = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement')?.trim() ?? '';

  if (!placement) {
    return NextResponse.json({ ok: false, errors: ['placement الزامی است.'] }, { status: 400 });
  }

  try {
    const ad = await resolveAdForPlacementWithFallback(placement);
    return NextResponse.json({ ok: true, ad }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}
