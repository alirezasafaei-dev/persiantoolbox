import { ImageError, identifyImage, keyFromEnv, safeCodes } from './core.mjs';

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
    response = await fetch(`${config.origin}/generate`, {
      method: 'POST',
      redirect: 'error',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({ prompt }),
    });
    const reader = response.body?.getReader();
    if (!reader) throw new ImageError('provider_error');
    const chunks = [];
    let size = 0;
    try {
      for (let part = await reader.read(); !part.done; part = await reader.read()) {
        size += part.value.length;
        if (size > 8 * 1024 * 1024) {
          await reader.cancel();
          throw new ImageError('invalid_image');
        }
        chunks.push(part.value);
      }
    } finally {
      reader.releaseLock();
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
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
