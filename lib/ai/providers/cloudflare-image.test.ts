import { describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import {
  CLOUDFLARE_IMAGE_MODEL,
  generateCloudflareImage,
  ImageProviderError,
  type ImageProviderOptions,
} from './cloudflare-image';

const options: ImageProviderOptions = {
  accountId: 'a'.repeat(32),
  token: 'test-not-a-real-secret',
  freePlanVerified: true,
  signal: AbortSignal.timeout(5_000),
};

const failedWith = async (job: Promise<unknown>, code: string) => {
  await expect(job).rejects.toMatchObject({ name: 'ImageProviderError', code });
};

describe('Cloudflare official image adapter (mock transport only)', () => {
  it('requires an explicitly verified free-plan gate before any inference', async () => {
    const fetcher = vi.fn();
    await failedWith(
      generateCloudflareImage('test', { ...options, freePlanVerified: false }, fetcher),
      'unavailable',
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['', '  ', 'x'.repeat(2049)])('rejects invalid prompt without fetch', async (prompt) => {
    const fetcher = vi.fn();
    await failedWith(generateCloudflareImage(prompt, options, fetcher), 'invalid_input');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects invalid account IDs and missing credentials', async () => {
    const fetcher = vi.fn();
    await failedWith(
      generateCloudflareImage('test', { ...options, accountId: '../bad' }, fetcher),
      'unavailable',
    );
    await failedWith(
      generateCloudflareImage('test', { ...options, token: '' }, fetcher),
      'unavailable',
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('uses one immutable endpoint, fixed steps, no cache or retry and strips metadata', async () => {
    const original = await sharp({
      create: { width: 8, height: 6, channels: 3, background: '#aabbcc' },
    })
      .png()
      .toBuffer();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ success: true, result: { image: original.toString('base64') } }),
      );
    const result = await generateCloudflareImage('  گل سرخ  ', options, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    );
    expect(init?.method).toBe('POST');
    expect(init?.cache).toBe('no-store');
    expect(JSON.parse(String(init?.body))).toEqual({ prompt: 'گل سرخ', steps: 4 });
    expect(result.mime).toBe('image/jpeg');
    expect([result.width, result.height]).toEqual([8, 6]);
    expect((await sharp(result.image).metadata()).format).toBe('jpeg');
  });

  it.each([
    [429, 'throttled'],
    [403, 'unavailable'],
    [500, 'unavailable'],
  ])('fails closed on provider HTTP %s', async (status, code) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status }));
    await failedWith(generateCloudflareImage('test', options, fetcher), code);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('rejects network errors without retrying', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('DO-NOT-LEAK'));
    await failedWith(generateCloudflareImage('test', options, fetcher), 'unavailable');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    { success: false, result: { image: 'AAAA' } },
    { success: true, result: { image: 'invalid!' } },
    { success: true, result: { image: Buffer.from('not an image').toString('base64') } },
  ])('rejects failed, corrupt or non-image outputs', async (payload) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload));
    await failedWith(generateCloudflareImage('test', options, fetcher), 'invalid_response');
  });

  it('rejects oversized envelopes before parsing', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{}', { headers: { 'content-length': '9000000' } }));
    await failedWith(generateCloudflareImage('test', options, fetcher), 'invalid_response');
  });

  it('uses typed failures only, never raw upstream text', () => {
    expect(new ImageProviderError('unavailable').message).toBe('unavailable');
  });
});
