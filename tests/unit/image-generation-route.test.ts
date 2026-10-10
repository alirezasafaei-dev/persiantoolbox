import { randomBytes, randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newSession } from '@/services/image-generation/core.mjs';
import type * as ImageCore from '@/services/image-generation/core.mjs';

const store = vi.hoisted(() => ({
  submit: vi.fn(),
  latest: vi.fn(),
  get: vi.fn(),
  image: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock('@/services/image-generation/core.mjs', async (importOriginal) => ({
  ...(await importOriginal<typeof ImageCore>()),
  createStore: () => store,
}));
vi.mock('pg', () => ({
  Pool: class {
    on() {}
  },
}));
import { GET, POST } from '@/app/api/image-generation/route';

const origin = 'https://image-test.example';
const key = randomBytes(32);
function request(
  method: string,
  data?: unknown,
  overrides: Record<string, string> = {},
  query = '',
) {
  return new NextRequest(`${origin}/api/image-generation${query}`, {
    method,
    headers: {
      origin,
      'content-type': 'application/json',
      cookie: `pt_image_session=${newSession(key)}`,
      ...overrides,
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('IMAGE_GENERATION_ENABLED', 'true');
  vi.stubEnv('IMAGE_GENERATION_PUBLIC_ORIGIN', origin);
  vi.stubEnv('IMAGE_GENERATION_KEY', key.toString('base64'));
  vi.stubEnv('IMAGE_GENERATION_DATABASE_URL', 'postgres://image-test.example/test');
});
afterEach(() => vi.unstubAllEnvs());
describe('image generation HTTP trust boundaries', () => {
  it('fails closed while disabled', async () => {
    vi.stubEnv('IMAGE_GENERATION_ENABLED', 'false');
    const res = await POST(request('POST', { action: 'create' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ code: 'disabled' });
    expect(store.submit).not.toHaveBeenCalled();
  });
  it('rejects foreign origins and cross-site reads before accessing jobs', async () => {
    expect((await POST(request('POST', {}, { origin: 'https://foreign.example' }))).status).toBe(
      403,
    );
    expect((await GET(request('GET', undefined, { 'sec-fetch-site': 'cross-site' }))).status).toBe(
      403,
    );
    expect(store.submit).not.toHaveBeenCalled();
    expect(store.latest).not.toHaveBeenCalled();
  });
  it('requires explicit consent before external processing', async () => {
    const res = await POST(
      request('POST', { action: 'create', consent: false, prompt: 'test image' }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ code: 'consent_required' });
    expect(store.submit).not.toHaveBeenCalled();
  });
  it('does not disclose jobs to a forged guest session', async () => {
    const res = await GET(
      request('GET', undefined, { cookie: 'pt_image_session=forged' }, `?id=${randomUUID()}`),
    );
    expect(res.status).toBe(404);
    expect(store.get).not.toHaveBeenCalled();
  });
  it('bounds request bodies without creating a job', async () => {
    const res = await POST(
      request('POST', { action: 'create', consent: true, prompt: 'a'.repeat(9000) }),
    );
    expect(res.status).toBe(400);
    expect(store.submit).not.toHaveBeenCalled();
  });
  it('returns an owned image with its actual format and private cache policy', async () => {
    store.image.mockResolvedValue({ bytes: Buffer.alloc(64), mime: 'image/png' });
    const res = await GET(request('GET', undefined, {}, `?id=${randomUUID()}&image=1`));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('content-disposition')).toContain('.png');
    expect(store.image).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(String),
    );
  });
});
