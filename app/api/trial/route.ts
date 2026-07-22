import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { startTrial, isTrialActive, getTrialRemainingDays, hasTrialEver } from '@/lib/server/trial';

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

    const active = await isTrialActive(user.id);
    const remaining = active ? await getTrialRemainingDays(user.id) : 0;
    const hasEver = await hasTrialEver(user.id);

    return NextResponse.json({
      ok: true,
      active,
      remainingDays: remaining,
      hasEverUsedTrial: hasEver,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای شروع دوره آزمایشی باید وارد شوید.' },
        { status: 401 },
      );
    }

    const alreadyUsed = await hasTrialEver(user.id);
    if (alreadyUsed) {
      return NextResponse.json(
        { ok: false, error: 'شما قبلاً از دوره آزمایشی استفاده کرده‌اید.' },
        { status: 400 },
      );
    }

    await startTrial(user.id);
    const remaining = await getTrialRemainingDays(user.id);

    return NextResponse.json({ ok: true, remainingDays: remaining });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا.' },
      { status: 500 },
    );
  }
}
