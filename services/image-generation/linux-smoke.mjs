import assert from 'node:assert/strict';
import dns from 'node:dns/promises';
import net from 'node:net';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { detectProviderBlock } from './browser.mjs';

const checks = [];
async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, pass: true });
  } catch (error) {
    checks.push({ name, pass: false, error: error.code || error.name });
  }
}
async function connected(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(2500);
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
}
await check('non-root and no queue secrets', () => {
  assert.equal(process.getuid(), 1001);
  assert.equal(process.env.IMAGE_GENERATION_KEY, undefined);
  assert.equal(process.env.IMAGE_GENERATION_DATABASE_URL, undefined);
});
await check('no privileges and seccomp', async () => {
  const status = await readFile('/proc/self/status', 'utf8');
  assert.match(status, /CapEff:\s+0+\s/);
  assert.match(status, /NoNewPrivs:\s+1/);
  assert.match(status, /Seccomp:\s+2/);
});
await check('read-only application files', async () => {
  await assert.rejects(writeFile('/app/.pt-owned-smoke-marker', 'probe', { flag: 'wx' }), {
    code: 'EROFS',
  });
});
await check('internal service DNS and proxy TCP', async () => {
  await dns.lookup('image-egress');
  assert.equal(await connected('image-egress', 3128), true);
});
await check('external DNS forwarding denied', async () => {
  const resolver = new dns.Resolver({ timeout: 1000, tries: 1 });
  await assert.rejects(resolver.resolve4('flatai.org'));
});
await check('database TCP denied', async () => {
  assert.ok(process.env.IMAGE_SMOKE_DATABASE_IP);
  assert.equal(await connected(process.env.IMAGE_SMOKE_DATABASE_IP, 5432), false);
});
await check('controlled host gateway listener denied', async () => {
  assert.ok(process.env.IMAGE_SMOKE_HOST_GATEWAY);
  assert.equal(await connected(process.env.IMAGE_SMOKE_HOST_GATEWAY, 45555), false);
});
await check('direct public TLS denied', async () => {
  assert.ok(process.env.IMAGE_SMOKE_PROVIDER_IP);
  assert.equal(await connected(process.env.IMAGE_SMOKE_PROVIDER_IP, 443), false);
});
await check('sandboxed Chromium and normal provider form through allowlisted proxy', async () => {
  const minimalEnv = Object.fromEntries(
    ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'LANG']
      .filter((name) => process.env[name])
      .map((name) => [name, process.env[name]]),
  );
  const browser = await chromium.launch({
    headless: true,
    chromiumSandbox: true,
    env: minimalEnv,
    proxy: { server: 'http://image-egress:3128', bypass: '<-loopback>' },
    args: ['--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'],
  });
  try {
    const page = await browser.newPage();
    await page.goto('https://flatai.org/ai-image-generator-free-no-signup/', {
      timeout: 45000,
      waitUntil: 'domcontentloaded',
    });
    const block = detectProviderBlock(await page.locator('body').innerText());
    assert.equal(block, null);
    await page
      .getByRole('textbox', { name: 'Image prompt', exact: true })
      .waitFor({ timeout: 15000 });
  } finally {
    await browser.close();
  }
});
console.log(JSON.stringify(checks));
process.exit(checks.every((result) => result.pass) ? 0 : 1);
