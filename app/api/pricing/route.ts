import { NextResponse } from 'next/server';
import { getResolvedPricing, PricingStorageUnavailableError } from '@/lib/server/pricingStorage';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  try {
    const pricing = await getResolvedPricing();
    return NextResponse.json({ ok: true, pricing }, { status: 200 });
  } catch (error) {
    if (error instanceof PricingStorageUnavailableError) {
      return NextResponse.json(
        { ok: false, errors: ['PRICING_STORAGE_UNAVAILABLE'] },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}
