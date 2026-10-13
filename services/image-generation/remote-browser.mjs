import { request } from 'node:http';
import { ImageError, identifyImage, keyFromEnv, safeCodes } from './core.mjs';

// Generation can legitimately wait longer than fetch's default header deadline.
// Bound the whole exchange, including the body, to the worker's ten-minute budget.
function requestGeneration(prompt, signal, config) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ prompt });
    const deadline = AbortSignal.timeout(600_000);
    const combined = AbortSignal.any([signal, deadline]);
    const req = request(`${config.origin}/generate`, {
      method: 'POST',
      agent: false,
      signal: combined,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Bearer ${config.token}`,
      },
    });
    req.on('error', () =>
      reject(new ImageError(combined.aborted ? 'provider_timeout' : 'provider_error')),
    );
    req.on('response', (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400) {
        reject(new ImageError('provider_error'));
        response.destroy();
        req.destroy();
        return;
      }
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 8 * 1024 * 1024) {
          reject(new ImageError('invalid_image'));
          response.destroy();
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      response.on('error', () =>
        reject(new ImageError(combined.aborted ? 'provider_timeout' : 'provider_error')),
      );
      response.on('end', () => {
        try {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            data: JSON.parse(Buffer.concat(chunks).toString('utf8')),
          });
        } catch {
          reject(new ImageError('provider_error'));
        }
      });
    });
    req.end(body);
  });
}

export function browserRpcConfig(env = process.env) {
  const value = env['IMAGE_BROWSER_URL'];
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ImageError('not_configured');
  }
  const internal = url.origin === 'http://image-browser:8080';
  const testLoopback =
    env['NODE_ENV'] !== 'production' &&
    url.protocol === 'http:' &&
    ['127.0.0.1', 'localhost'].includes(url.hostname);
  if ((!internal && !testLoopback) || url.origin !== value || url.username || url.password) {
    throw new ImageError('not_configured');
  }
  keyFromEnv(env['IMAGE_BROWSER_AUTH_TOKEN']);
  return { origin: url.origin, token: env['IMAGE_BROWSER_AUTH_TOKEN'] };
}

export async function generateRemotely(
  prompt,
  { signal, onStage, onMetrics },
  config = browserRpcConfig(),
) {
  onStage('waiting');
  let response;
  try {
    response = await requestGeneration(prompt, signal, config);
    const { data } = response;
    if (data.metrics && typeof data.metrics === 'object') {
      const metrics = {};
      const milestonesMs = {};
      for (const field of [
        'browserLaunched',
        'pageLoaded',
        'formReady',
        'submitted',
        'imageVisible',
        'downloaded',
      ]) {
        const value = data.metrics.milestonesMs?.[field];
        if (Number.isFinite(value) && value >= 0 && value <= 600_000) milestonesMs[field] = value;
      }
      metrics.milestonesMs = milestonesMs;
      if (
        Number.isFinite(data.metrics.durationSeconds) &&
        data.metrics.durationSeconds >= 0 &&
        data.metrics.durationSeconds <= 600
      )
        metrics.durationSeconds = data.metrics.durationSeconds;
      if (typeof data.metrics.promptOptimizer === 'boolean')
        metrics.promptOptimizer = data.metrics.promptOptimizer;
      if (
        [
          'queue_expired',
          'generic_error',
          'missing_image',
          'content_guard',
          'queue_conflict',
          'generation_timeout',
          'prompt_validation',
          'http_403',
          'http_429',
          'http_5xx',
          'signup_required',
          'captcha_required',
          'quota_reached',
        ].includes(data.metrics.failureReason)
      )
        metrics.failureReason = data.metrics.failureReason;
      onMetrics(metrics);
    }
    if (!response.ok) throw new ImageError(safeCodes.has(data.code) ? data.code : 'provider_error');
    if (typeof data.bytes !== 'string' || data.bytes.length > 7 * 1024 * 1024)
      throw new ImageError('invalid_image');
    const bytes = Buffer.from(data.bytes, 'base64');
    if (bytes.toString('base64') !== data.bytes) throw new ImageError('invalid_image');
    identifyImage(bytes);
    return { bytes };
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError(signal.aborted ? 'provider_timeout' : 'provider_error');
  }
}

// A readiness probe proves access to the authenticated RPC without generating an image.
export async function checkBrowserReadiness(config = browserRpcConfig()) {
  try {
    const response = await fetch(`${config.origin}/health`, {
      headers: { Authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(3000),
      redirect: 'error',
    });
    await response.body?.cancel();
    if (!response.ok) throw new ImageError('unavailable');
  } catch {
    throw new ImageError('unavailable');
  }
}
