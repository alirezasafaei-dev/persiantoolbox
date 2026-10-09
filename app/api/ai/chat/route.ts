import { NextResponse, type NextRequest } from 'next/server';
import { AiProviderError, parseChatTurns } from '@/lib/ai/contracts';
import { createCloudflareChatProvider } from '@/lib/ai/providers/cloudflare';
import { isAllowedAiChatOrigin } from '@/lib/ai/origin';
import {
  aiFeatureEnabled,
  AiQuotaExceeded,
  consumeAiQuota,
  getOrCreateAiVisitor,
  AI_VISITOR_COOKIE_NAME,
} from '@/lib/ai/quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function respond(message: string, status: number, newCookie?: string) {
  const result = NextResponse.json({ error: message }, { status, headers: NO_STORE });
  if (newCookie) {
    result.cookies.set(AI_VISITOR_COOKIE_NAME, newCookie, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return result;
}

async function readBoundedBody(request: NextRequest): Promise<unknown> {
  if (!request.body) {
    return null;
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    let completed = false;
    while (!completed) {
      const { done, value } = await reader.read();
      if (done) {
        completed = true;
        continue;
      }
      size += value.byteLength;
      if (size > 16_000) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const merged = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    return JSON.parse(merged.toString('utf8')) as unknown;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: NextRequest) {
  if (!aiFeatureEnabled()) {
    return respond('گفت‌وگو هنوز فعال نشده است.', 503);
  }
  if (!process.env['AI_CLOUDFLARE_ACCOUNT_ID'] || !process.env['AI_CLOUDFLARE_TOKEN']) {
    return respond('سرویس فعلاً آماده نیست.', 503);
  }
  const origin = request.headers.get('origin');
  if (
    origin &&
    !isAllowedAiChatOrigin(origin, request.url, process.env['NODE_ENV'] === 'production')
  ) {
    return respond('درخواست مجاز نیست.', 403);
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return respond('فرمت درخواست نادرست است.', 415);
  }
  const payload = await readBoundedBody(request);
  const turns =
    payload && typeof payload === 'object'
      ? parseChatTurns((payload as Record<string, unknown>)['messages'])
      : null;
  if (!turns) {
    return respond('متن درخواست معتبر نیست یا خیلی طولانی است.', 400);
  }

  let newCookie: string | undefined;
  try {
    const { visitor, cookie, renewed } = getOrCreateAiVisitor(
      request.cookies.get(AI_VISITOR_COOKIE_NAME)?.value,
    );
    if (renewed) {
      newCookie = cookie;
    }
    // Fail closed if migration or database is unavailable.
    await consumeAiQuota(visitor);

    const provider = createCloudflareChatProvider();
    const reply = await provider.completeChat(turns, AbortSignal.timeout(25_000));
    const result = NextResponse.json({ reply: reply.text }, { headers: NO_STORE });
    if (renewed) {
      result.cookies.set(AI_VISITOR_COOKIE_NAME, cookie, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return result;
  } catch (error) {
    if (error instanceof AiQuotaExceeded) {
      return respond('سهمیه رایگان فعلاً تمام شده است. بعداً دوباره امتحان کن.', 429, newCookie);
    }
    if (error instanceof AiProviderError) {
      return respond(
        error.code === 'throttled'
          ? 'سرور هوش مصنوعی شلوغ است. کمی بعد دوباره امتحان کن.'
          : 'پاسخی از سرویس دریافت نشد. بعداً دوباره امتحان کن.',
        error.code === 'throttled' ? 429 : 503,
        newCookie,
      );
    }
    // Never expose provider tokens, upstream responses or private prompts.
    return respond('سرویس در حال حاضر در دسترس نیست.', 503, newCookie);
  }
}
