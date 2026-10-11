import sharp from 'sharp';

export const CLOUDFLARE_IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PIXELS = 4_194_304;

export type ImageFailureCode = 'invalid_input' | 'unavailable' | 'throttled' | 'invalid_response';

export class ImageProviderError extends Error {
  constructor(readonly code: ImageFailureCode) {
    super(code);
    this.name = 'ImageProviderError';
  }
}

export type ImageProviderOptions = {
  accountId: string;
  token: string;
  signal: AbortSignal;
  /** Must be verified from the account dashboard before a caller may invoke inference. */
  freePlanVerified: boolean;
};

async function readBoundedResponse(response: Response): Promise<unknown> {
  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
    throw new ImageProviderError('invalid_response');
  }
  if (!response.body) {
    throw new ImageProviderError('invalid_response');
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      bytes += value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new ImageProviderError('invalid_response');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8'));
  } catch {
    throw new ImageProviderError('invalid_response');
  }
}

/**
 * An isolated, default-off feasibility adapter, NOT a public API or release gate.
 * No retry, browser-supplied model/URL, paid fallback, or provider error-body logging.
 * Caller must enforce durable per-account/IP quotas and reserve chat budget separately.
 */
export async function generateCloudflareImage(
  prompt: string,
  options: ImageProviderOptions,
  fetcher: typeof fetch = fetch,
): Promise<{ image: Buffer; mime: 'image/jpeg'; width: number; height: number }> {
  if (!options.freePlanVerified || !/^[a-f0-9]{32}$/i.test(options.accountId) || !options.token) {
    throw new ImageProviderError('unavailable');
  }
  const normalized = typeof prompt === 'string' ? prompt.trim() : '';
  if (!normalized || normalized.length > 2048) {
    throw new ImageProviderError('invalid_input');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`;
  let response: Response;
  try {
    response = await fetcher(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: normalized, steps: 4 }),
      signal: options.signal,
      cache: 'no-store',
    });
  } catch {
    throw new ImageProviderError('unavailable');
  }
  if (response.status === 429) {
    throw new ImageProviderError('throttled');
  }
  if (!response.ok) {
    throw new ImageProviderError('unavailable');
  }

  const payload = await readBoundedResponse(response);
  if (!payload || typeof payload !== 'object') {
    throw new ImageProviderError('invalid_response');
  }
  const envelope = payload as { success?: boolean; result?: { image?: unknown } };
  const encoded = envelope.success && envelope.result?.image;
  if (
    typeof encoded !== 'string' ||
    encoded.length === 0 ||
    encoded.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4 ||
    encoded.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)
  ) {
    throw new ImageProviderError('invalid_response');
  }
  const original = Buffer.from(encoded, 'base64');
  if (!original.length || original.byteLength > MAX_IMAGE_BYTES) {
    throw new ImageProviderError('invalid_response');
  }
  try {
    const image = sharp(original, { limitInputPixels: MAX_PIXELS, failOn: 'error' });
    const meta = await image.metadata();
    if (!meta.width || !meta.height || meta.width > 2048 || meta.height > 2048) {
      throw new ImageProviderError('invalid_response');
    }
    // Re-encoding drops upstream metadata and validates pixels, not just magic bytes.
    const safeImage = await image.jpeg({ quality: 85 }).toBuffer();
    if (safeImage.byteLength > MAX_IMAGE_BYTES) {
      throw new ImageProviderError('invalid_response');
    }
    return { image: safeImage, mime: 'image/jpeg', width: meta.width, height: meta.height };
  } catch {
    throw new ImageProviderError('invalid_response');
  }
}
