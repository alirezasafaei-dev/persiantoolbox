import { NextResponse } from 'next/server';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export async function POST(request: Request) {
  try {
    const rateLimitKey = makeRateLimitKey('newsletter', request);
    const rateLimitResult = await rateLimit(rateLimitKey, { limit: 3, windowMs: 300_000 });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' },
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

    const pathMod = require('node:path');
    const fs = require('node:fs/promises');
    const filePath = pathMod.join(process.cwd(), '.data/newsletter-emails.json');

    let emails: string[] = [];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      emails = JSON.parse(content);
    } catch {
      // first entry
    }

    if (emails.includes(email.trim().toLowerCase())) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    emails.push(email.trim().toLowerCase());
    await fs.mkdir(pathMod.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(emails, null, 2), 'utf-8');

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در ثبت‌نام.' }, { status: 500 });
  }
}
