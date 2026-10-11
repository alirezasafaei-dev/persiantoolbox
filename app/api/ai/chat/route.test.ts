import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AiProviderError } from '@/lib/ai/contracts';
const mock = vi.hoisted(() => ({ enabled: true, quota: vi.fn(), complete: vi.fn() }));
vi.mock('@/lib/ai/quota', () => ({
  aiFeatureEnabled: () => mock.enabled,
  AI_VISITOR_COOKIE_NAME: 'pt_ai_v',
  getOrCreateAiVisitor: () => ({ visitor: 'synthetic', cookie: 'synthetic-cookie', renewed: true }),
  consumeAiQuota: mock.quota,
  AiQuotaExceeded: class extends Error {},
}));
vi.mock('@/lib/ai/providers/cloudflare', () => ({
  createCloudflareChatProvider: () => ({ completeChat: mock.complete }),
}));
import { AiQuotaExceeded } from '@/lib/ai/quota';
import { POST } from './route';

function request(
  body = JSON.stringify({ messages: [{ role: 'user', content: 'سلام' }] }),
  headers: Record<string, string> = {},
) {
  return new NextRequest('http://localhost:3100/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3100', ...headers },
    body,
  });
}
beforeEach(() => {
  mock.enabled = true;
  mock.quota.mockReset().mockResolvedValue(undefined);
  mock.complete.mockReset().mockResolvedValue({ text: 'پاسخ فارسی' });
  vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', 'synthetic');
  vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'synthetic');
});
afterEach(() => vi.unstubAllEnvs());
describe('AI HTTP security and failure contracts (mock inference)', () => {
  it('returns a non-stream reply, no-store and signed-cookie attributes only after quota', async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ reply: 'پاسخ فارسی' });
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(result.headers.get('set-cookie')).toContain('HttpOnly');
    expect(result.headers.get('set-cookie')).toContain('SameSite=lax');
    expect(mock.quota.mock.invocationCallOrder[0]).toBeLessThan(
      mock.complete.mock.invocationCallOrder[0]!,
    );
  });
  it.each([
    ['foreign origin', '{}', { Origin: 'https://evil.example' }, 403],
    ['non JSON', 'text', { 'Content-Type': 'text/plain' }, 415],
    ['malformed', '{', {}, 400],
    ['empty prompt', JSON.stringify({ messages: [{ role: 'user', content: '' }] }), {}, 400],
    [
      'oversize prompt',
      JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(1801) }] }),
      {},
      400,
    ],
    ['raw size cap', 'x'.repeat(16001), {}, 400],
  ])('rejects %s before quota or inference', async (_name, body, headers, status) => {
    const result = await POST(request(body, headers as Record<string, string>));
    expect(result.status).toBe(status);
    expect(mock.quota).not.toHaveBeenCalled();
    expect(mock.complete).not.toHaveBeenCalled();
  });
  it('fails closed when quota database is unavailable', async () => {
    mock.quota.mockRejectedValue(new Error('private connection detail'));
    const result = await POST(request());
    expect(result.status).toBe(503);
    expect(JSON.stringify(await result.json())).not.toContain('private');
    expect(mock.complete).not.toHaveBeenCalled();
  });
  it('rejects exhausted quota without inference', async () => {
    mock.quota.mockRejectedValue(new AiQuotaExceeded());
    const result = await POST(request());
    expect(result.status).toBe(429);
    expect(mock.complete).not.toHaveBeenCalled();
  });
  it.each([
    ['throttled', 429],
    ['unavailable', 503],
    ['invalid_response', 503],
  ] as const)('handles provider %s once without leakage', async (code, status) => {
    mock.complete.mockRejectedValue(new AiProviderError(code, 'private provider detail'));
    const result = await POST(request());
    expect(result.status).toBe(status);
    expect(JSON.stringify(await result.json())).not.toContain('private');
    expect(mock.complete).toHaveBeenCalledOnce();
  });
  it('enforces disabled feature and missing credentials before quota', async () => {
    mock.enabled = false;
    expect((await POST(request())).status).toBe(503);
    mock.enabled = true;
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', '');
    expect((await POST(request())).status).toBe(503);
    expect(mock.quota).not.toHaveBeenCalled();
  });
});
