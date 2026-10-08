import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createCloudflareChatProvider,
  extractCloudflareAnswer,
} from '@/lib/ai/providers/cloudflare';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Cloudflare free provider', () => {
  it('accepts Cloudflare-native and OpenAI-compatible results', () => {
    expect(extractCloudflareAnswer({ success: true, result: { response: ' سلام ' } })).toBe('سلام');
    expect(
      extractCloudflareAnswer({
        success: true,
        result: { choices: [{ message: { content: 'درود' } }] },
      }),
    ).toBe('درود');
  });
  it('does not trust failed or blank responses', () => {
    expect(extractCloudflareAnswer({ success: false, result: { response: 'x' } })).toBeNull();
    expect(extractCloudflareAnswer({ success: true, result: { response: ' ' } })).toBeNull();
  });
  it('hardcodes a Free-model endpoint and never leaks the bearer to the browser', async () => {
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'unit-test-only-secret');
    const fetchMock = vi.fn(
      async (_url: string, _options: RequestInit) =>
        new Response(JSON.stringify({ success: true, result: { response: 'سلام!' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const provider = createCloudflareChatProvider();
    const response = await provider.completeChat(
      [{ role: 'user', content: 'سلام' }],
      AbortSignal.timeout(1000),
    );
    expect(response.text).toBe('سلام!');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/ai/run/@cf/zai-org/glm-4.7-flash');
    expect(options.method).toBe('POST');
    expect(options.body).toContain('سلام');
    expect(options.body).not.toContain('unit-test-only-secret');
    expect(JSON.parse(options.body as string)).toMatchObject({
      chat_template_kwargs: { enable_thinking: false },
      max_completion_tokens: 400,
      stream: false,
    });
  });
  it('allows an explicit loopback mock endpoint only outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'unit-test-only-secret');
    vi.stubEnv('AI_CLOUDFLARE_TEST_BASE_URL', 'http://127.0.0.1:43210');
    const fetchMock = vi.fn(async () =>
      Response.json({ success: true, result: { response: 'سلام!' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createCloudflareChatProvider().completeChat(
      [{ role: 'user', content: 'سلام' }],
      AbortSignal.timeout(1000),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^http:\/\/127\.0\.0\.1:43210\/client\/v4\/accounts\//),
      expect.any(Object),
    );
  });
  it.each([
    ['production', 'http://127.0.0.1:43210'],
    ['test', 'https://example.com'],
  ])('ignores unsafe test endpoint in %s mode', async (nodeEnv, testBaseUrl) => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'unit-test-only-secret');
    vi.stubEnv('AI_CLOUDFLARE_TEST_BASE_URL', testBaseUrl);
    const fetchMock = vi.fn(async () =>
      Response.json({ success: true, result: { response: 'سلام!' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createCloudflareChatProvider().completeChat(
      [{ role: 'user', content: 'سلام' }],
      AbortSignal.timeout(1000),
    );

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\//);
  });
  it('stops on upstream 429 without paid fallback or retries', async () => {
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '0123456789abcdef0123456789abcdef');
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'unit-test-only-secret');
    const fetchMock = vi.fn(async () => new Response('', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = createCloudflareChatProvider();
    await expect(
      provider.completeChat([{ role: 'user', content: 'سلام' }], AbortSignal.timeout(1000)),
    ).rejects.toMatchObject({ code: 'throttled' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each([401, 403, 500, 502, 503])(
    'fails closed without retrying or misreporting HTTP %s as free-capacity exhaustion',
    async (status) => {
      vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '0123456789abcdef0123456789abcdef');
      vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'unit-test-only-secret');
      const fetchMock = vi.fn(async () => new Response('', { status }));
      vi.stubGlobal('fetch', fetchMock);

      const provider = createCloudflareChatProvider();
      await expect(
        provider.completeChat([{ role: 'user', content: 'سلام' }], AbortSignal.timeout(1000)),
      ).rejects.toMatchObject({ code: 'unavailable' });
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );
});
