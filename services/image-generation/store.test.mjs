import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import { createStore, digest } from './core.mjs';
import { runWorker } from './worker.mjs';

const DEFAULT_TEST_DATABASE_URL = 'postgres://pt_image_test_runner@127.0.0.1:55439/pt_image_test';

export function testDatabaseUrl(env = process.env) {
  const value = env.TEST_IMAGE_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('TEST_IMAGE_DATABASE_URL must be a disposable PostgreSQL URL');
  }
  const allowedHosts = new Set(['127.0.0.1', 'localhost']);
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !allowedHosts.has(url.hostname.toLowerCase()) ||
    url.port !== '55439' ||
    url.pathname !== '/pt_image_test'
  ) {
    throw new Error(
      'TEST_IMAGE_DATABASE_URL must target only 127.0.0.1 or localhost port 55439 database pt_image_test',
    );
  }
  return url.toString();
}

// Validate the only accepted target before pg can open a connection or execute SQL.
const pool = new pg.Pool({
  connectionString: testDatabaseUrl(),
  connectionTimeoutMillis: 2000,
  max: 6,
});
const key = randomBytes(32),
  store = createStore(pool, key),
  owner = digest('owner:test', key);
test('test database guard permits only the fixed disposable target', () => {
  assert.equal(testDatabaseUrl({}), DEFAULT_TEST_DATABASE_URL);
  assert.equal(
    testDatabaseUrl({
      TEST_IMAGE_DATABASE_URL: 'postgresql://runner@localhost:55439/pt_image_test',
    }),
    'postgresql://runner@localhost:55439/pt_image_test',
  );
  for (const unsafe of [
    'postgres://runner@db:55439/pt_image_test',
    'postgres://runner@127.0.0.1:5432/pt_image_test',
    'postgres://runner@127.0.0.1:55439/not_the_test_database',
    'not a database URL',
  ]) {
    assert.throws(() => testDatabaseUrl({ TEST_IMAGE_DATABASE_URL: unsafe }));
  }
});
before(async () => {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
});
beforeEach(async () => {
  await pool.query(
    'TRUNCATE image_generation_jobs,image_generation_control,image_generation_quota',
  );
  await pool.query(
    'INSERT INTO image_generation_control(id,heartbeat,key_fingerprint) VALUES(1,now(),$1)',
    [digest('worker-key', key)],
  );
});
after(() => pool.end());
const submit = (who = owner, ip = 'test-ip', id = randomUUID()) =>
  store.submit(who, ip, 'یک قوری فیروزه‌ای کنار پنجره', id);
async function until(fn, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('condition not reached');
}
async function runKeyRotation() {
  const connection = await pool.connect();
  try {
    await connection.query(
      await readFile(new URL('./prepare-key-rotation.sql', import.meta.url), 'utf8'),
    );
  } catch (error) {
    await connection.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}
test('key rotation refuses retained jobs and leaves the control fingerprint intact', async () => {
  await submit();
  const fingerprint = (await pool.query('SELECT key_fingerprint FROM image_generation_control'))
    .rows[0].key_fingerprint;
  await assert.rejects(runKeyRotation(), /image jobs remain/);
  assert.equal(
    (await pool.query('SELECT key_fingerprint FROM image_generation_control')).rows[0]
      .key_fingerprint,
    fingerprint,
  );
});
test('key rotation never clears a provider circuit', async () => {
  await pool.query(
    "UPDATE image_generation_control SET blocked_code='captcha_required' WHERE id=1",
  );
  await assert.rejects(runKeyRotation(), /provider circuit remains blocked/);
  assert.equal(
    (await pool.query('SELECT blocked_code FROM image_generation_control')).rows[0].blocked_code,
    'captcha_required',
  );
});
test('key rotation permits a new worker key only after a fully empty, unblocked reset', async () => {
  const oldKey = key;
  await assert.rejects(
    runWorker({
      pool,
      key: randomBytes(32),
      signal: new AbortController().signal,
      provider: async () => {
        throw new Error('provider must not run');
      },
    }),
    { code: 'key_mismatch' },
  );
  await runKeyRotation();
  assert.equal(
    (await pool.query('SELECT count(*)::int AS n FROM image_generation_control')).rows[0].n,
    0,
  );
  const newKey = randomBytes(32);
  const stop = new AbortController();
  let providerCalls = 0;
  const running = runWorker({
    pool,
    key: newKey,
    signal: stop.signal,
    provider: async () => {
      providerCalls++;
      throw new Error('provider must not run');
    },
  });
  try {
    await until(async () => {
      const result = await pool.query(
        'SELECT key_fingerprint,heartbeat FROM image_generation_control',
      );
      return (
        result.rows[0]?.key_fingerprint === digest('worker-key', newKey) &&
        result.rows[0]?.heartbeat
      );
    });
    assert.notEqual(digest('worker-key', oldKey), digest('worker-key', newKey));
    assert.equal(providerCalls, 0);
  } finally {
    stop.abort();
    await running;
  }
});
test('admission is serial, bounded, idempotent and private under concurrency', async () => {
  const id = randomUUID(),
    first = await submit(owner, 'ip', id);
  assert.equal((await submit(owner, 'ip', id)).id, first.id);
  assert.equal(await store.get('other', first.id), null);
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, (_, i) => submit(`owner-${i}`, `ip-${i}`)),
  );
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 2);
  const row = (await pool.query('SELECT prompt FROM image_generation_jobs WHERE id=$1', [first.id]))
    .rows[0];
  assert.equal(row.prompt.includes(Buffer.from('قوری')), false);
  assert.equal(
    (await pool.query('SELECT count(*)::int AS n FROM image_generation_jobs')).rows[0].n,
    3,
  );
});
test('cookie renewal cannot bypass per-IP quota; disabled worker is fail-closed', async () => {
  for (let i = 0; i < 3; i++) {
    const job = await submit(`owner-${i}`, 'same-ip');
    await store.cancel(`owner-${i}`, job.id);
  }
  await assert.rejects(submit('another-owner', 'same-ip'), { code: 'quota_reached' });
  await pool.query(
    "UPDATE image_generation_control SET blocked_code='captcha_required' WHERE id=1",
  );
  await assert.rejects(submit('other', 'different-ip'), { code: 'unavailable' });
});
test('worker completes exactly once and a second worker cannot disrupt heartbeat', async () => {
  const job = await submit();
  const stop = new AbortController();
  let calls = 0;
  const bytes = Buffer.alloc(64);
  bytes[0] = 255;
  bytes[1] = 216;
  bytes[2] = 255;
  const running = runWorker({
    pool,
    key,
    signal: stop.signal,
    provider: async () => {
      calls++;
      return { bytes };
    },
  });
  try {
    await until(async () => (await store.get(owner, job.id))?.status === 'ready');
    await assert.rejects(runWorker({ pool, key, signal: new AbortController().signal }), {
      code: 'worker_already_running',
    });
    assert.ok(
      (await pool.query('SELECT heartbeat FROM image_generation_control')).rows[0].heartbeat,
    );
    assert.equal(calls, 1);
    assert.deepEqual((await store.image(owner, job.id)).bytes, bytes);
    assert.equal(await store.image('other', job.id), null);
  } finally {
    stop.abort();
    await running;
  }
});
test('cancellation aborts active work and never publishes late output', async () => {
  const job = await submit();
  const stop = new AbortController();
  let calls = 0;
  const running = runWorker({
    pool,
    key,
    signal: stop.signal,
    provider: (_prompt, { signal }) =>
      new Promise((resolve, reject) => {
        calls++;
        signal.addEventListener('abort', () => reject(new Error('stopped')), { once: true });
      }),
  });
  try {
    await until(async () => calls === 1);
    await store.cancel(owner, job.id);
    await until(async () => (await store.get(owner, job.id))?.status === 'cancelled');
    await new Promise((resolve) => setTimeout(resolve, 5200));
    assert.equal(calls, 1);
    assert.equal(await store.image(owner, job.id), null);
  } finally {
    stop.abort();
    await running;
  }
});
test('restart marks uncertain running work failed without repeating external generation', async () => {
  const job = await submit();
  await pool.query("UPDATE image_generation_jobs SET status='running' WHERE id=$1", [job.id]);
  const stop = new AbortController();
  let calls = 0;
  const running = runWorker({
    pool,
    key,
    signal: stop.signal,
    provider: async () => {
      calls++;
      throw new Error('unexpected');
    },
  });
  try {
    await until(async () => (await store.get(owner, job.id))?.code === 'worker_interrupted');
    assert.equal(calls, 0);
  } finally {
    stop.abort();
    await running;
  }
});
test('provider CAPTCHA opens circuit until an operator clears it', async () => {
  const job = await submit();
  const waiting = await submit('waiting-owner', 'waiting-ip');
  const stop = new AbortController();
  let calls = 0;
  const running = runWorker({
    pool,
    key,
    signal: stop.signal,
    provider: async () => {
      calls++;
      throw Object.assign(new Error('provider gate'), { code: 'captcha_required' });
    },
  });
  try {
    await until(
      async () =>
        (await pool.query('SELECT blocked_code FROM image_generation_control')).rows[0]
          .blocked_code === 'captcha_required',
    );
    assert.equal((await store.get(owner, job.id)).code, 'captcha_required');
    await until(async () => (await store.get('waiting-owner', waiting.id))?.status === 'error');
    assert.equal((await store.get('waiting-owner', waiting.id)).code, 'captcha_required');
    const retained = await pool.query('SELECT prompt FROM image_generation_jobs WHERE id=$1', [
      waiting.id,
    ]);
    assert.equal(retained.rows[0].prompt, null);
    await assert.rejects(submit('another', 'different'), { code: 'unavailable' });
    assert.equal(calls, 1);
  } finally {
    stop.abort();
    await running;
  }
});
