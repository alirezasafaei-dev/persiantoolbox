/**
 * Usage Tracking API Route
 * Records tool usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { trackUsage } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID required' }, { status: 400 });
    }

    const result = await trackUsage(user.id, toolId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Usage tracking failed' },
      { status: 500 },
    );
  }
}
