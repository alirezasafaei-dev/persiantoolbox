import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedAiChatOrigin } from '@/lib/ai/origin';
import { ImageQuotaExceeded, consumeImageQuota, imageGenerationReady } from '@/lib/ai/image-quota';
import { getOrCreateAiVisitor, AI_VISITOR_COOKIE_NAME } from '@/lib/ai/quota';
import { generateCloudflareImage, ImageProviderError } from '@/lib/ai/providers/cloudflare-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const MAX_REQUEST_BYTES = 4096;

function setCookie(response: NextResponse, cookie: string | undefined): NextResponse {
  if (cookie) {
    response.cookies.set(AI_VISITOR_COOKIE_NAME, cookie, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

function errorResult(status: number, message: string, cookie?: string) {
  return setCookie(NextResponse.json({ error: message }, { status, headers: HEADERS }), cookie);
}

async function readSmallJson(request: NextRequest): Promise<unknown> {
  if (!request.body) {
    return null;
  }
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > MAX_REQUEST_BYTES) {
    return null;
  }
  const reader = request.body.getReader();
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      bytes += value.byteLength;
      if (bytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    return JSON.parse(
      Buffer.concat(chunks.map((part) => Buffer.from(part))).toString('utf8'),
    ) as unknown;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

/** Explicit opt-in: no UI, no default enablement, no storage or retries. */
export async function POST(request: NextRequest) {
  if (!imageGenerationReady()) {
    return errorResult(503, 'تولید تصویر فعلاً فعال نیست.');
  }
  const accountId = process.env['AI_IMAGE_CLOUDFLARE_ACCOUNT_ID']?.trim();
  const token = process.env['AI_IMAGE_CLOUDFLARE_TOKEN']?.trim();
  if (!accountId || !token) {
    return errorResult(503, 'سرویس تصویر آماده نیست.');
  }
  const origin = request.headers.get('origin');
  // Unlike the chat route, anonymous image POSTs require an Origin;
  // do not trust arbitrary Host or proxy headers.
  if (
    !origin ||
    !isAllowedAiChatOrigin(origin, request.url, process.env['NODE_ENV'] === 'production')
  ) {
    return errorResult(403, 'درخواست مجاز نیست.');
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return errorResult(415, 'فرمت درخواست نادرست است.');
  }
  const raw = await readSmallJson(request);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return errorResult(400, 'درخواست معتبر نیست.');
  }
  const payload = raw as Record<string, unknown>;
  const prompt = payload['prompt'];
  if (
    payload['consent'] !== true ||
    typeof prompt !== 'string' ||
    prompt.trim().length < 1 ||
    prompt.trim().length > 2048
  ) {
    return errorResult(400, 'متن تصویر یا تأیید ارسال به سرویس خارجی معتبر نیست.');
  }

  let newCookie: string | undefined;
  try {
    const { visitor, cookie, renewed } = getOrCreateAiVisitor(
      request.cookies.get(AI_VISITOR_COOKIE_NAME)?.value,
    );
    if (renewed) {
      newCookie = cookie;
    }
    // All four namespaced counters update in one PostgreSQL transaction.
    // If the DB is unavailable, generation does not proceed.
    await consumeImageQuota(visitor, accountId);

    const output = await generateCloudflareImage(prompt.trim(), {
      accountId,
      token,
      freePlanVerified: true,
      signal: AbortSignal.timeout(45_000),
    });
    return setCookie(
      new NextResponse(new Uint8Array(output.image), {
        status: 200,
        headers: {
          ...HEADERS,
          'Content-Type': output.mime,
          'Content-Disposition': 'attachment; filename="persiantoolbox-ai-image.jpg"',
          'Content-Security-Policy': "default-src 'none'; sandbox",
        },
      }),
      newCookie,
    );
  } catch (error) {
    if (error instanceof ImageQuotaExceeded) {
      return errorResult(429, 'سهمیه رایگان تولید تصویر تمام شده است. بعداً امتحان کن.', newCookie);
    }
    if (error instanceof ImageProviderError) {
      return errorResult(
        error.code === 'throttled' ? 429 : 503,
        error.code === 'throttled'
          ? 'ظرفیت هوش مصنوعی فعلاً تکمیل است. بعداً امتحان کن.'
          : 'تولید تصویر فعلاً در دسترس نیست.',
        newCookie,
      );
    }
    // Do not leak upstream messages, session identifiers, prompts or secrets.
    return errorResult(503, 'سرویس تصویر در حال حاضر در دسترس نیست.', newCookie);
  }
}
