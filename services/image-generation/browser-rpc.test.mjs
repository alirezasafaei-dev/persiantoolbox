import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createBrowserServer } from './browser-server.mjs';
import { browserRpcConfig, generateRemotely } from './remote-browser.mjs';
import { ImageError } from './core.mjs';

const jpeg = Buffer.alloc(64);
jpeg.set([255, 216, 255]);
async function fixture(provider, fn) {
  const token = randomBytes(32).toString('base64');
  const server = createBrowserServer({ token, provider });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const config = { origin: `http://127.0.0.1:${server.address().port}`, token };
  try {
    await fn(config);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
const options = () => ({
  signal: new AbortController().signal,
  onStage: () => {},
  onMetrics: () => {},
});
test('production RPC configuration permits only the isolated browser service', () => {
  const token = randomBytes(32).toString('base64');
  for (const url of [
    'http://127.0.0.1:8080',
    'https://remote.example',
    'http://image-browser:8080/path',
  ]) {
    assert.throws(
      () =>
        browserRpcConfig({
          NODE_ENV: 'production',
          IMAGE_BROWSER_URL: url,
          IMAGE_BROWSER_AUTH_TOKEN: token,
        }),
      { code: 'not_configured' },
    );
  }
  assert.equal(
    browserRpcConfig({
      NODE_ENV: 'production',
      IMAGE_BROWSER_URL: 'http://image-browser:8080',
      IMAGE_BROWSER_AUTH_TOKEN: token,
    }).origin,
    'http://image-browser:8080',
  );
});
test('RPC rejects unauthenticated calls without touching the provider', async () => {
  let calls = 0;
  await fixture(
    async () => {
      calls++;
      return { bytes: jpeg };
    },
    async (config) => {
      const res = await fetch(`${config.origin}/generate`, { method: 'POST', body: '{}' });
      assert.equal(res.status, 401);
      assert.equal(calls, 0);
    },
  );
});
test('RPC preserves image bytes and safe provider failure codes', async () => {
  await fixture(
    async () => ({ bytes: jpeg }),
    async (config) => {
      const result = await generateRemotely('a harmless teapot', options(), config);
      assert.deepEqual(result.bytes, jpeg);
    },
  );
  await fixture(
    async () => {
      throw new ImageError('captcha_required');
    },
    async (config) => {
      await assert.rejects(generateRemotely('a harmless teapot', options(), config), {
        code: 'captcha_required',
      });
    },
  );
});
test('RPC bounds input before external work and rejects invalid output bytes', async () => {
  let calls = 0;
  await fixture(
    async () => {
      calls++;
      return { bytes: jpeg };
    },
    async (config) => {
      const res = await fetch(`${config.origin}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
        body: JSON.stringify({ prompt: 'a'.repeat(9000) }),
      });
      assert.equal(res.status, 503);
      assert.equal(calls, 0);
    },
  );
  await fixture(
    async () => ({ bytes: Buffer.from('<svg>not an image</svg>') }),
    async (config) => {
      await assert.rejects(generateRemotely('a harmless teapot', options(), config), {
        code: 'invalid_image',
      });
    },
  );
});
test('RPC logs only bounded timing fields, never arbitrary provider metadata', async () => {
  await fixture(
    async (_, { onMetrics }) => {
      onMetrics({
        prompt: 'private text',
        failureReason: 'private arbitrary value',
        durationSeconds: 20,
        promptOptimizer: true,
        milestonesMs: { submitted: 123, downloaded: Infinity, secret: 'private' },
      });
      return { bytes: jpeg };
    },
    async (config) => {
      let metrics;
      await generateRemotely(
        'a harmless teapot',
        {
          ...options(),
          onMetrics: (value) => {
            metrics = value;
          },
        },
        config,
      );
      assert.deepEqual(metrics, {
        milestonesMs: { submitted: 123 },
        durationSeconds: 20,
        promptOptimizer: true,
      });
    },
  );
});
test('RPC preserves only recognized provider failure reasons', async () => {
  await fixture(
    async (_, { onMetrics }) => {
      onMetrics({ failureReason: 'content_guard', prompt: 'private text' });
      throw new ImageError('provider_error');
    },
    async (config) => {
      let metrics;
      await assert.rejects(
        generateRemotely(
          'a harmless teapot',
          {
            ...options(),
            onMetrics: (value) => {
              metrics = value;
            },
          },
          config,
        ),
        { code: 'provider_error' },
      );
      assert.deepEqual(metrics, { milestonesMs: {}, failureReason: 'content_guard' });
    },
  );
});
test('RPC transports only fixed provider HTTP denial diagnostics', async () => {
  await fixture(
    async (_, { onMetrics }) => {
      onMetrics({ failureReason: 'http_403', rawBody: 'private provider data' });
      throw new ImageError('provider_error');
    },
    async (config) => {
      let metrics;
      await assert.rejects(
        generateRemotely(
          'harmless art',
          {
            ...options(),
            onMetrics: (value) => {
              metrics = value;
            },
          },
          config,
        ),
        { code: 'provider_error' },
      );
      assert.deepEqual(metrics, { milestonesMs: {}, failureReason: 'http_403' });
    },
  );
});

test('disconnect aborts provider work and does not allow another concurrent generation', async () => {
  let abortObserved = false,
    entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  await fixture(
    async (_, { signal }) => {
      entered();
      await new Promise((resolve) =>
        signal.addEventListener(
          'abort',
          () => {
            abortObserved = true;
            resolve();
          },
          { once: true },
        ),
      );
      return { bytes: jpeg };
    },
    async (config) => {
      const controller = new AbortController();
      const first = generateRemotely(
        'a harmless teapot',
        { ...options(), signal: controller.signal },
        config,
      );
      const rejected = assert.rejects(first, { code: 'provider_timeout' });
      await started;
      await assert.rejects(generateRemotely('another harmless teapot', options(), config), {
        code: 'provider_error',
      });
      controller.abort();
      await rejected;
      const deadline = Date.now() + 2000;
      while (!abortObserved && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 10));
      assert.equal(abortObserved, true);
    },
  );
});
