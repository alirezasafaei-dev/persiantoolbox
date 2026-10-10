import pg from 'pg';
import { keyFromEnv, digest } from './core.mjs';
import { browserRpcConfig } from './remote-browser.mjs';
const pool = new pg.Pool({
  connectionString: process.env['IMAGE_GENERATION_DATABASE_URL'],
  max: 1,
  connectionTimeoutMillis: 3000,
  statement_timeout: 3000,
});
try {
  if (process.env['NODE_ENV'] === 'production') {
    const { origin } = browserRpcConfig();
    const response = await fetch(`${origin}/health`, {
      signal: AbortSignal.timeout(3000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('browser_unhealthy');
  }
  const key = keyFromEnv(process.env['IMAGE_GENERATION_KEY']);
  const result = await pool.query(
    "SELECT id FROM image_generation_control WHERE id=1 AND heartbeat>now()-interval '20 seconds' AND blocked_code IS NULL AND key_fingerprint=$1",
    [digest('worker-key', key)],
  );
  if (!result.rows[0]) process.exitCode = 1;
} catch {
  process.exitCode = 1;
} finally {
  await pool.end();
}
