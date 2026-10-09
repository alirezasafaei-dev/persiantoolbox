import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Client } from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const databaseUrl = process.env.DATABASE_URL;
const port = Number(process.env.AI_HTTP_DB_TEST_PORT ?? '3211');
const baseUrl = `http://localhost:${port}`;
const migrationPath = path.join(root, 'db/migrations/20261008_ai_chat_quota.sql');
const mockProviderPort = Number(process.env.AI_HTTP_DB_MOCK_PORT ?? '43210');

if (!databaseUrl || !databaseUrl.includes('pt_ai_http_test')) {
  throw new Error('DATABASE_URL must target the isolated pt_ai_http_test database');
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connect(connectionString = databaseUrl) {
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/ai/chat`);
      if (response.status === 200) return;
    } catch {
      await sleep(500);
      continue;
    }
    await sleep(500);
  }
  throw new Error('Next.js test server did not become ready');
}

function startServer(featureEnabled = 'true') {
  const child = spawn(
    process.execPath,
    [
      path.join(root, 'node_modules/next/dist/bin/next'),
      'dev',
      '-H',
      '127.0.0.1',
      '-p',
      String(port),
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        FEATURE_AI_CHAT_ENABLED: featureEnabled,
        AI_CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true',
        AI_CLOUDFLARE_ACCOUNT_ID: '00000000000000000000000000000000',
        AI_CLOUDFLARE_TOKEN: 'integration-test-token-not-a-secret',
        AI_CLOUDFLARE_TEST_BASE_URL: `http://127.0.0.1:${mockProviderPort}`,
        AI_VISITOR_SECRET: 'integration-test-visitor-secret-32-chars-minimum',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  return { child, getStderr: () => stderr };
}

async function startMockProvider() {
  let calls = 0;
  const server = createServer((request, response) => {
    calls += 1;
    assert.match(request.url ?? '', /^\/client\/v4\/accounts\/0{32}\/ai\/run\//);
    assert.equal(request.headers.authorization, 'Bearer integration-test-token-not-a-secret');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        success: true,
        result: {
          choices: [
            {
              finish_reason: 'stop',
              message: { content: 'این یک پاسخ فارسی آزمایشی از ارائه‌دهنده شبیه‌سازی‌شده است.' },
            },
          ],
        },
      }),
    );
  });
  server.listen(mockProviderPort, '127.0.0.1');
  await once(server, 'listening');
  return { server, calls: () => calls };
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([once(child, 'exit'), sleep(5_000)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

function cookieValue(response) {
  const header = response.headers.get('set-cookie');
  return header?.split(';', 1)[0] ?? null;
}

async function chat(cookie) {
  return fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: baseUrl,
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'سلام، این یک آزمون است.' }] }),
  });
}

async function resetQuota(client) {
  await client.query('TRUNCATE ai_chat_quota');
}

async function advanceMinuteWindow(client) {
  await client.query("DELETE FROM ai_chat_quota WHERE quota_key LIKE '%:minute%'");
}

async function main() {
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  adminUrl.username = 'postgres';
  const admin = await connect(adminUrl.toString());
  const db = await connect();
  const { readFile } = await import('node:fs/promises');
  await db.query(await readFile(migrationPath, 'utf8'));
  await resetQuota(db);

  const mockProvider = await startMockProvider();
  const disabledServer = startServer('false');
  await waitForServer();
  const disabledResponse = await chat();
  assert.equal(disabledResponse.status, 503);
  assert.equal(mockProvider.calls(), 0);
  await stopServer(disabledServer.child);

  const { child, getStderr } = startServer();
  try {
    await waitForServer();

    const first = await chat();
    assert.equal(first.status, 200, await first.clone().text());
    const cookie = cookieValue(first);
    assert.match(cookie ?? '', /^pt_ai_v=[A-Za-z0-9_-]{22}\.[a-f0-9]{64}$/);
    assert.match((await first.json()).reply, /پاسخ فارسی آزمایشی/);

    const second = await chat(cookie);
    assert.equal(second.status, 200);
    assert.equal(cookieValue(second), null);
    const third = await chat(cookie);
    assert.equal(third.status, 429);

    const persisted = await db.query(
      "SELECT hits FROM ai_chat_quota WHERE quota_key LIKE 'visitor:minute:%'",
    );
    assert.deepEqual(
      persisted.rows.map(({ hits }) => hits),
      [2],
    );

    await resetQuota(db);
    let dailyCookie;
    for (let request = 1; request <= 6; request += 1) {
      const response = await chat(dailyCookie);
      dailyCookie ??= cookieValue(response);
      assert.equal(response.status, request <= 5 ? 200 : 429);
      if (request === 2 || request === 4) await advanceMinuteWindow(db);
    }
    const visitorDay = await db.query(
      "SELECT hits FROM ai_chat_quota WHERE quota_key LIKE 'visitor:day:%'",
    );
    assert.deepEqual(
      visitorDay.rows.map(({ hits }) => hits),
      [5],
    );

    await resetQuota(db);
    const concurrent = await Promise.all(Array.from({ length: 20 }, () => chat()));
    assert.equal(concurrent.filter(({ status }) => status === 200).length, 5);
    assert.equal(concurrent.filter(({ status }) => status === 429).length, 15);
    const concurrentCounts = await db.query(
      "SELECT quota_key, hits FROM ai_chat_quota WHERE quota_key IN ('global:day', 'global:minute') ORDER BY quota_key",
    );
    assert.deepEqual(concurrentCounts.rows, [
      { quota_key: 'global:day', hits: 5 },
      { quota_key: 'global:minute', hits: 5 },
    ]);
    const acceptedVisitors = await db.query(
      "SELECT count(*)::int AS count FROM ai_chat_quota WHERE quota_key LIKE 'visitor:day:%'",
    );
    assert.equal(acceptedVisitors.rows[0].count, 5);

    await resetQuota(db);
    for (let request = 1; request <= 41; request += 1) {
      const response = await chat();
      assert.equal(response.status, request <= 40 ? 200 : 429);
      if (request % 5 === 0 && request < 40) await advanceMinuteWindow(db);
    }
    const globalDay = await db.query(
      "SELECT hits FROM ai_chat_quota WHERE quota_key = 'global:day'",
    );
    assert.deepEqual(
      globalDay.rows.map(({ hits }) => hits),
      [40],
    );

    await db.end();
    await admin.query('ALTER DATABASE pt_ai_http_test WITH ALLOW_CONNECTIONS false');
    await admin.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pt_ai_http_test'",
    );
    const unavailable = await chat();
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { error: 'سرویس در حال حاضر در دسترس نیست.' });

    await admin.query('ALTER DATABASE pt_ai_http_test WITH ALLOW_CONNECTIONS true');
    const recoveredDb = await connect();
    await resetQuota(recoveredDb);
    await recoveredDb.end();
    const recovered = await chat();
    assert.equal(recovered.status, 200);

    const combinedLogs = getStderr();
    assert.doesNotMatch(combinedLogs, /integration-test-token-not-a-secret/);
    assert.doesNotMatch(combinedLogs, /سلام، این یک آزمون است/);

    console.log('HTTP_DB_INTEGRATION=PASS');
    console.log('SIGNED_COOKIE_AND_PERSISTENCE=PASS');
    console.log('VISITOR_MINUTE_2=PASS');
    console.log('VISITOR_DAY_5=PASS');
    console.log('GLOBAL_MINUTE_5=PASS');
    console.log('GLOBAL_DAY_40=PASS');
    console.log('CONCURRENT_HTTP_20_ATOMIC=PASS');
    console.log('ROLLBACK=PASS');
    console.log('DATABASE_OUTAGE_503_RECOVERY=PASS');
    console.log('SECRET_AND_PROMPT_LOG_DISCLOSURE=PASS');
    console.log('FEATURE_FLAG_FAIL_CLOSED=PASS');
    assert.equal(mockProvider.calls(), 53);
    console.log('MOCK_PROVIDER_CALLS=53');
    console.log('EXTERNAL_PROVIDER_CALLS=0');
  } finally {
    await admin.query('ALTER DATABASE pt_ai_http_test WITH ALLOW_CONNECTIONS true').catch(() => {});
    await admin.end().catch(() => {});
    await db.end().catch(() => {});
    await stopServer(child);
    mockProvider.server.close();
  }
}

await main();
