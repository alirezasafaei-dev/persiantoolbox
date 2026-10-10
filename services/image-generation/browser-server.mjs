import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { generateWithBrowser } from './browser.mjs';
import { ImageError, identifyImage, keyFromEnv, safeCodes, validatePrompt } from './core.mjs';

export function createBrowserServer({ token, provider = generateWithBrowser }) {
  keyFromEnv(token);
  const expected = Buffer.from(`Bearer ${token}`);
  let active = false;
  const server = http.createServer(async (req, res) => {
    const reply = (status, data) => {
      if (res.destroyed) return;
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(data));
    };
    if (req.method === 'GET' && req.url === '/health') {
      reply(200, { status: 'ok' });
      return;
    }
    const provided = Buffer.from(req.headers.authorization ?? '');
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      reply(401, { code: 'forbidden' });
      return;
    }
    if (
      req.method !== 'POST' ||
      req.url !== '/generate' ||
      req.headers['content-type'] !== 'application/json'
    ) {
      reply(400, { code: 'invalid_request' });
      return;
    }
    if (active) {
      reply(429, { code: 'provider_error' });
      return;
    }
    active = true;
    const controller = new AbortController();
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.on('close', disconnect);
    const timer = setTimeout(() => controller.abort(), 10 * 60 * 1000);
    let metrics;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8192) throw new ImageError('invalid_prompt');
        chunks.push(chunk);
      }
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const prompt = validatePrompt(data.prompt);
      const result = await provider(prompt, {
        signal: controller.signal,
        onStage: () => {},
        onMetrics: (value) => {
          metrics = value;
        },
      });
      if (controller.signal.aborted) throw new ImageError('provider_timeout');
      identifyImage(result.bytes);
      reply(200, { bytes: result.bytes.toString('base64'), metrics });
    } catch (error) {
      const code =
        error instanceof ImageError && safeCodes.has(error.code) ? error.code : 'provider_error';
      reply(503, { code, metrics });
    } finally {
      clearTimeout(timer);
      res.off('close', disconnect);
      active = false;
    }
  });
  server.headersTimeout = 10000;
  server.requestTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxConnections = 8;
  return server;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  if (
    process.env['NODE_ENV'] === 'production' &&
    process.env['IMAGE_BROWSER_PROXY'] !== 'http://image-egress:3128'
  ) {
    throw new ImageError('not_configured');
  }
  const server = createBrowserServer({ token: process.env['IMAGE_BROWSER_AUTH_TOKEN'] });
  server.listen(8080, '0.0.0.0');
  for (const event of ['SIGINT', 'SIGTERM'])
    process.on(event, () => server.close(() => process.exit(0)));
}
