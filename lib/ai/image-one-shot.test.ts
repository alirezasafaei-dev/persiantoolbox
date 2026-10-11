import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authorizeOneShotImage,
  runOneShotImage,
  type OneShotSmokeEnvironment,
} from './image-one-shot';

const account = 'a'.repeat(32);
const chatAccount = 'b'.repeat(32);
function ready(): OneShotSmokeEnvironment {
  return {
    AI_IMAGE_SMOKE_AUTHORIZATION: 'authorize-single-inference',
    AI_IMAGE_FREE_PLAN_CONFIRMED: 'true',
    AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED: 'true',
    AI_IMAGE_CLOUDFLARE_ACCOUNT_ID: account,
    AI_IMAGE_CLOUDFLARE_TOKEN: 'example-only-image-token',
    AI_CLOUDFLARE_ACCOUNT_ID: chatAccount,
    AI_CLOUDFLARE_TOKEN: 'example-only-chat-token',
  };
}

afterEach(() => vi.restoreAllMocks());

describe('single-inference acceptance gate', () => {
  it('must not permit missing explicit one-shot consent or unverified Free account', () => {
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_SMOKE_AUTHORIZATION: undefined }),
    ).toThrow(/authorization/i);
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_FREE_PLAN_CONFIRMED: undefined }),
    ).toThrow(/account/i);
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED: 'false' }),
    ).toThrow(/account/i);
  });

  it('rejects a missing chat account, reused account and reused token', () => {
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_CLOUDFLARE_ACCOUNT_ID: undefined }),
    ).toThrow(/account/i);
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_CLOUDFLARE_ACCOUNT_ID: chatAccount }),
    ).toThrow(/account/i);
    expect(() =>
      authorizeOneShotImage({
        ...ready(),
        AI_IMAGE_CLOUDFLARE_ACCOUNT_ID: chatAccount.toUpperCase(),
      }),
    ).toThrow(/account/i);
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_CLOUDFLARE_TOKEN: 'example-only-chat-token' }),
    ).toThrow(/token/i);
  });

  it('rejects invalid credentials and account id', () => {
    expect(() => authorizeOneShotImage({ ...ready(), AI_IMAGE_CLOUDFLARE_TOKEN: '' })).toThrow(
      /token/i,
    );
    expect(() =>
      authorizeOneShotImage({ ...ready(), AI_IMAGE_CLOUDFLARE_ACCOUNT_ID: '../escape' }),
    ).toThrow(/account/i);
  });

  it('a failed gate never calls inference', async () => {
    const provider = vi.fn();
    await expect(
      runOneShotImage({ ...ready(), AI_IMAGE_SMOKE_AUTHORIZATION: undefined }, provider),
    ).rejects.toThrow(/authorization/i);
    expect(provider).not.toHaveBeenCalled();
  });

  it('calls a fixed-model provider exactly once, without returning prompt or credentials', async () => {
    const provider = vi.fn().mockResolvedValue({
      width: 16,
      height: 8,
      mime: 'image/jpeg',
      image: Buffer.from([255, 216, 255, 217]),
    });
    const result = await runOneShotImage(ready(), provider, () => 1_000);
    expect(provider).toHaveBeenCalledTimes(1);
    const [prompt, options] = provider.mock.calls[0]!;
    expect(prompt).toBe('A simple red flower on a plain white background.');
    expect(options.accountId).toBe(account);
    expect(options.freePlanVerified).toBe(true);
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(result).toEqual({
      status: 'PASS',
      model: '@cf/black-forest-labs/flux-1-schnell',
      width: 16,
      height: 8,
      imageBytes: 4,
      elapsedMs: 0,
    });
    expect(JSON.stringify(result)).not.toContain('example-only');
    expect(JSON.stringify(result)).not.toContain('flower');
  });

  it('fails closed on provider error with no retry', async () => {
    const provider = vi.fn().mockRejectedValue(new Error('secret-provider-token-should-not-leak'));
    await expect(runOneShotImage(ready(), provider)).rejects.toThrow('One-shot image test failed');
    expect(provider).toHaveBeenCalledOnce();
  });

  it('requires valid JPEG metadata and enforces final byte budget', async () => {
    const provider = vi.fn().mockResolvedValue({
      width: 0,
      height: 1,
      mime: 'text/plain',
      image: Buffer.from('bogus'),
    });
    await expect(runOneShotImage(ready(), provider)).rejects.toThrow('One-shot image test failed');
  });
});
