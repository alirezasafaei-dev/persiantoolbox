import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getSignupGiftStatus } from '@/lib/server/trial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای مشاهده وضعیت آزمایشی باید وارد شوید.' },
        { status: 401 },
      );
    }

    const gift = await getSignupGiftStatus(user.id);

    return NextResponse.json({
      ok: true,
      status: gift.status,
      active: gift.status === 'available',
      remainingDays: gift.remainingDays,
      hasEverUsedTrial: true,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا.' },
      { status: 500 },
    );
  }
}
