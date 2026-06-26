import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getDailyUsage } from '@/lib/server/entitlements';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ used: 0, limit: 10, percentage: 0, isPremium: false });
    }

    const { used, limit, isPremium } = await getDailyUsage(user.id);
    const percentage = isPremium ? 0 : Math.round((used / limit) * 100);

    return NextResponse.json({ used, limit, percentage, isPremium });
  } catch (error) {
    console.error('Usage status error:', error);
    return NextResponse.json({ used: 0, limit: 10, percentage: 0, isPremium: false });
  }
}
