import {
  CLOUDFLARE_IMAGE_MODEL,
  generateCloudflareImage,
  type ImageProviderOptions,
} from '@/lib/ai/providers/cloudflare-image';

export type OneShotSmokeEnvironment = {
  AI_IMAGE_SMOKE_AUTHORIZATION?: string | undefined;
  AI_IMAGE_FREE_PLAN_CONFIRMED?: string | undefined;
  AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED?: string | undefined;
  AI_IMAGE_CLOUDFLARE_ACCOUNT_ID?: string | undefined;
  AI_IMAGE_CLOUDFLARE_TOKEN?: string | undefined;
  AI_CLOUDFLARE_ACCOUNT_ID?: string | undefined;
  AI_CLOUDFLARE_TOKEN?: string | undefined;
};

type Provider = (
  prompt: string,
  options: ImageProviderOptions,
) => Promise<{ width: number; height: number; mime: string; image: Buffer }>;

const SYNTHETIC_PROMPT = 'A simple red flower on a plain white background.';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Explicit standalone one-shot acceptance contract, never used by public
 * Next.js routes. It does not load .env, mutate feature flags or persist image.
 */
export function authorizeOneShotImage(env: OneShotSmokeEnvironment): {
  accountId: string;
  token: string;
} {
  if (env.AI_IMAGE_SMOKE_AUTHORIZATION !== 'authorize-single-inference') {
    throw new Error('Missing explicit one-shot authorization');
  }
  if (
    env.AI_IMAGE_FREE_PLAN_CONFIRMED !== 'true' ||
    env.AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED !== 'true'
  ) {
    throw new Error('Independent Free image account confirmation is missing');
  }

  const accountId = env.AI_IMAGE_CLOUDFLARE_ACCOUNT_ID?.trim();
  const chatAccount = env.AI_CLOUDFLARE_ACCOUNT_ID?.trim();
  if (
    !accountId ||
    !chatAccount ||
    !/^[a-f0-9]{32}$/i.test(accountId) ||
    !/^[a-f0-9]{32}$/i.test(chatAccount) ||
    accountId.toLowerCase() === chatAccount.toLowerCase()
  ) {
    throw new Error('Dedicated account isolation is missing');
  }

  const token = env.AI_IMAGE_CLOUDFLARE_TOKEN?.trim();
  const chatToken = env.AI_CLOUDFLARE_TOKEN?.trim();
  if (!token || !chatToken || token === chatToken) {
    throw new Error('Independent image token is missing');
  }

  return { accountId, token };
}

export async function runOneShotImage(
  env: OneShotSmokeEnvironment,
  provider: Provider = generateCloudflareImage,
  clock: () => number = Date.now,
): Promise<{
  status: 'PASS';
  model: typeof CLOUDFLARE_IMAGE_MODEL;
  width: number;
  height: number;
  imageBytes: number;
  elapsedMs: number;
}> {
  const { accountId, token } = authorizeOneShotImage(env);
  const started = clock();
  try {
    // No retry, no prompt from a human, no arbitrary model or URL.
    const result = await provider(SYNTHETIC_PROMPT, {
      accountId,
      token,
      freePlanVerified: true,
      signal: AbortSignal.timeout(45_000),
    });
    if (
      result.mime !== 'image/jpeg' ||
      !Buffer.isBuffer(result.image) ||
      !result.image.byteLength ||
      result.image.byteLength > MAX_IMAGE_BYTES ||
      !Number.isInteger(result.width) ||
      result.width <= 0 ||
      result.width > 2048 ||
      !Number.isInteger(result.height) ||
      result.height <= 0 ||
      result.height > 2048
    ) {
      throw new Error('Invalid image metadata');
    }
    return {
      status: 'PASS',
      model: CLOUDFLARE_IMAGE_MODEL,
      width: result.width,
      height: result.height,
      imageBytes: result.image.byteLength,
      elapsedMs: Math.max(0, clock() - started),
    };
  } catch {
    // Never propagate credential/prompt/upstream error messages.
    throw new Error('One-shot image test failed');
  }
}
