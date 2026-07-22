import { NextResponse } from 'next/server';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { getNewsletterService } from '@/lib/server/newsletter-service';
import { BadRequestError, RateLimitError } from '@/lib/server/api-errors';
import { handleApiError } from '@/lib/server/api-error-handler';

export async function POST(request: Request) {
  try {
    const rateLimitKey = makeRateLimitKey('newsletter', request);
    const rateLimitResult = await rateLimit(rateLimitKey, { limit: 3, windowMs: 300_000 });
    if (!rateLimitResult.allowed) {
      throw new RateLimitError();
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      throw new BadRequestError('ایمیل الزامی است.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new BadRequestError('فرمت ایمیل نامعتبر است.');
    }

    const service = getNewsletterService();
    const result = await service.subscribe(email);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, '/api/newsletter/subscribe');
  }
}
