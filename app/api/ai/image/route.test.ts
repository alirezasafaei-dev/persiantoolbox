import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  ready: false,
  quota: vi.fn(),
  generate: vi.fn(),
  visitor: vi.fn(),
}));
vi.mock('@/lib/ai/image-quota', () => ({
  imageGenerationReady: () => mock.ready,
  consumeImageQuota: mock.quota,
  ImageQuotaExceeded: class ImageQuotaExceeded extends Error {},
}));
vi.mock('@/lib/ai/quota', () => ({
  AI_VISITOR_COOKIE_NAME: 'pt_ai_v',
  getOrCreateAiVisitor: mock.visitor,
}));
vi.mock('@/lib/ai/providers/cloudflare-image', () => ({
  generateCloudflareImage: mock.generate,
  ImageProviderError: class ImageProviderError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  },
}));
import { ImageQuotaExceeded } from '@/lib/ai/image-quota';
import { ImageProviderError } from '@/lib/ai/providers/cloudflare-image';
import { POST } from './route';

const payload = JSON.stringify({ prompt: 'یک منظره از کوهستان', consent: true });
const url = 'http://localhost:3100/api/ai/image';
function request(body = payload, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: 'POST',
    body,
    headers: { origin: 'http://localhost:3100', 'content-type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  mock.ready = false;
  mock.quota.mockReset().mockResolvedValue(undefined);
  mock.generate.mockReset().mockResolvedValue({
    image: Buffer.from([255, 216, 255, 217]),
    mime: 'image/jpeg',
    width: 8,
    height: 8,
  });
  mock.visitor.mockReset().mockReturnValue({
    visitor: 'synthetic-visitor',
    cookie: 'signed-cookie',
    renewed: true,
  });
  vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', 'a'.repeat(32));
  vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', 'synthetic-provider-token');
  vi.stubEnv('AI_IMAGE_FREE_PLAN_CONFIRMED', 'true');
});
afterEach(() => vi.unstubAllEnvs());

describe('Image HTTP admission contract (mock-only, default off)', () => {
  it('refuses calls while disabled without looking at payload or spending quota', async () => {
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(mock.quota).not.toHaveBeenCalled();
    expect(mock.generate).not.toHaveBeenCalled();
  });

  it.each([
    ['foreign origin', payload, { origin: 'https://bad.invalid' }, 403],
    ['missing origin', payload, { origin: '' }, 403],
    ['missing consent', JSON.stringify({ prompt: 'گل' }), {}, 400],
    ['false consent', JSON.stringify({ prompt: 'گل', consent: false }), {}, 400],
    ['blank prompt', JSON.stringify({ prompt: ' ', consent: true }), {}, 400],
    ['oversized prompt', JSON.stringify({ prompt: 'x'.repeat(2049), consent: true }), {}, 400],
    ['bad JSON', '{', {}, 400],
    ['wrong content-type', payload, { 'content-type': 'text/plain' }, 415],
    ['oversized body', 'x'.repeat(5000), {}, 400],
  ])('blocks %s before spending allowance', async (_case, body, headers, status) => {
    mock.ready = true;
    const result = await POST(request(body, headers as Record<string, string>));
    expect(result.status).toBe(status);
    expect(mock.quota).not.toHaveBeenCalled();
    expect(mock.generate).not.toHaveBeenCalled();
  });

  it('executes quota before the one permitted provider request, returns a private download', async () => {
    mock.ready = true;
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(result.headers.get('content-type')).toBe('image/jpeg');
    expect(result.headers.get('content-disposition')).toContain('attachment;');
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(result.headers.get('x-content-type-options')).toBe('nosniff');
    expect(result.headers.get('set-cookie')).toContain('HttpOnly');
    expect(Buffer.from(await result.arrayBuffer())).toEqual(Buffer.from([255, 216, 255, 217]));
    expect(mock.quota).toHaveBeenCalledOnce();
    expect(mock.generate).toHaveBeenCalledOnce();
    expect(mock.quota.mock.invocationCallOrder[0]).toBeLessThan(
      mock.generate.mock.invocationCallOrder[0]!,
    );
    expect(mock.generate.mock.calls[0]?.[0]).toBe('یک منظره از کوهستان');
  });

  it('fails closed on quota exhaustion without contacting the provider', async () => {
    mock.ready = true;
    mock.quota.mockRejectedValue(new ImageQuotaExceeded());
    const res = await POST(request());
    expect(res.status).toBe(429);
    expect(mock.generate).not.toHaveBeenCalled();
  });

  it('fails closed on database failures without exposing the error text', async () => {
    mock.ready = true;
    mock.quota.mockRejectedValue(new Error('private database connection credentials'));
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('private database');
    expect(mock.generate).not.toHaveBeenCalled();
  });

  it.each([
    ['throttled', 429],
    ['unavailable', 503],
    ['invalid_response', 503],
  ] as const)('returns safe %s status when provider fails', async (code, status) => {
    mock.ready = true;
    mock.generate.mockRejectedValue(new ImageProviderError(code));
    const res = await POST(request());
    expect(res.status).toBe(status);
    expect((await res.text()).toLowerCase()).not.toContain('token');
    expect(mock.generate).toHaveBeenCalledOnce();
  });

  it('fails closed when credentials disappear before inference', async () => {
    mock.ready = true;
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', '');
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mock.quota).not.toHaveBeenCalled();
    expect(mock.generate).not.toHaveBeenCalled();
  });
});
