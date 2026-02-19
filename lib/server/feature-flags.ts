import { NextResponse } from 'next/server';
import { buildDisabledApiBody, type FeatureId } from '@/lib/features/availability';

export function disabledApiResponse(feature: FeatureId, status = 410) {
  return NextResponse.json(buildDisabledApiBody(feature), { status });
}
