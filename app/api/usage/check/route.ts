/**
 * Usage Check API Route
 * Checks if user can use a tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { checkUsageLimit, getUsageStatus } from '@/lib/usage-tracking';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const toolId = request.nextUrl.searchParams.get('toolId');
    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID required' }, { status: 400 });
    }

    const canUse = await checkUsageLimit(user.id, toolId);
    const status = await getUsageStatus(user.id, toolId);

    return NextResponse.json({
      canUse,
      ...status,
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Usage check failed' },
      { status: 500 },
    );
  }
}
