import { NextResponse } from 'next/server';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { getNewsletterService } from '@/lib/server/newsletter-service';

export async function POST(request: Request) {
  try {
    const rateLimitKey = makeRateLimitKey('newsletter-unsub', request);
    const rateLimitResult = await rateLimit(rateLimitKey, { limit: 5, windowMs: 300_000 });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
        { status: 429 },
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'ایمیل الزامی است.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ ok: false, error: 'فرمت ایمیل نامعتبر است.' }, { status: 400 });
    }

    const service = getNewsletterService();
    const result = await service.unsubscribe(email);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در لغو عضویت.' }, { status: 500 });
  }
}
