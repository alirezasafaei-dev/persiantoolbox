import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import {
  createStore,
  ImageError,
  keyFromEnv,
  newSession,
  ownerFromCookie,
  validId,
} from '@/services/image-generation/core.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
let pool: Pool | undefined;
const cookieName = 'pt_image_session';
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
function response(status: number, data: unknown) {
  return NextResponse.json(data, { status, headers });
}
async function body(request: NextRequest): Promise<Record<string, unknown>> {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    throw new ImageError('invalid_request');
  }
  const reader = request.body?.getReader();
  if (!reader) {
    throw new ImageError('invalid_request');
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (let part = await reader.read(); !part.done; part = await reader.read()) {
      size += part.value.length;
      if (size > 8192) {
        await reader.cancel();
        throw new ImageError('invalid_prompt');
      }
      chunks.push(part.value);
    }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new ImageError('invalid_request');
    }
    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ImageError) {
      throw error;
    }
    throw new ImageError('invalid_request');
  } finally {
    reader.releaseLock();
  }
}
async function handle(request: NextRequest): Promise<NextResponse> {
  if (process.env['IMAGE_GENERATION_ENABLED'] !== 'true') {
    return response(503, { code: 'disabled' });
  }
  try {
    const publicOrigin = process.env['IMAGE_GENERATION_PUBLIC_ORIGIN'];
    if (!publicOrigin || new URL(publicOrigin).origin !== publicOrigin) {
      throw new ImageError('not_configured');
    }
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
      return response(403, { code: 'forbidden' });
    }
    if (request.method === 'POST' && request.headers.get('origin') !== publicOrigin) {
      return response(403, { code: 'forbidden' });
    }
    const key = keyFromEnv(process.env['IMAGE_GENERATION_KEY']);
    const connectionString = process.env['IMAGE_GENERATION_DATABASE_URL'];
    if (!connectionString) {
      throw new ImageError('not_configured');
    }
    if (!pool) {
      pool = new Pool({
        connectionString,
        max: 3,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        statement_timeout: 5000,
      });
      // Idle database connection errors must not become unhandled process errors.
      // Requests still fail closed through the safe response below.
      pool.on('error', () => {});
    }
    const store = createStore(pool, key);
    const owner = ownerFromCookie(request.cookies.get(cookieName)?.value, key);
    if (!owner) {
      if (request.method !== 'GET' || request.nextUrl.searchParams.has('id')) {
        return response(404, { code: 'not_found' });
      }
      const token = newSession(key);
      const res = response(200, { job: null });
      res.cookies.set(cookieName, token, {
        httpOnly: true,
        secure: publicOrigin.startsWith('https:'),
        sameSite: 'strict',
        path: '/api/image-generation',
        maxAge: 86400,
      });
      return res;
    }
    if (request.method === 'POST') {
      const data = await body(request);
      if (data['action'] === 'cancel') {
        if (!validId(data['id'])) {
          return response(400, { code: 'invalid_request' });
        }
        const job = await store.cancel(owner, String(data['id']));
        return job ? response(200, { job }) : response(404, { code: 'not_found' });
      }
      if (data['action'] !== 'create' || data['consent'] !== true) {
        return response(400, { code: 'consent_required' });
      }
      // The ingress must replace this header; never expose Next.js directly to the Internet.
      const ip = request.headers.get('x-real-ip') ?? 'unknown';
      const job = await store.submit(owner, ip, data['prompt'], data['requestId']);
      return response(202, { job });
    }
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return response(200, { job: await store.latest(owner) });
    }
    if (!validId(id)) {
      return response(404, { code: 'not_found' });
    }
    if (request.nextUrl.searchParams.get('image') === '1') {
      const image = await store.image(owner, id);
      if (!image) {
        return response(404, { code: 'not_found' });
      }
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[
        image.mime
      ];
      return new NextResponse(new Uint8Array(image.bytes), {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': image.mime,
          'Content-Length': String(image.bytes.length),
          'Content-Disposition': `attachment; filename="persiantoolbox-image.${extension}"`,
        },
      });
    }
    const job = await store.get(owner, id);
    return job ? response(200, { job }) : response(404, { code: 'not_found' });
  } catch (error) {
    const code = error instanceof ImageError ? error.code : 'unavailable';
    let status = 503;
    if (['queue_full', 'quota_reached', 'already_running'].includes(code)) {
      status = 429;
    } else if (['invalid_prompt', 'invalid_request', 'consent_required'].includes(code)) {
      status = 400;
    }
    const res = response(status, { code });
    if (status === 429) {
      res.headers.set('Retry-After', '60');
    }
    return res;
  }
}
export const GET = handle;
export const POST = handle;
