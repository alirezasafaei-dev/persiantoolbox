import pg from 'pg';
import { pathToFileURL } from 'node:url';
import {
  keyFromEnv,
  digest,
  decrypt,
  encrypt,
  identifyImage,
  safeCodes,
  ImageError,
} from './core.mjs';
import { generateWithBrowser } from './browser.mjs';
import { generateRemotely } from './remote-browser.mjs';

export async function runWorker({
  pool,
  key,
  provider = process.env['NODE_ENV'] === 'production' ? generateRemotely : generateWithBrowser,
  signal,
  log = () => {},
}) {
  const lock = await pool.connect();
  let active = null,
    failures = 0,
    tickRunning = false,
    ownsLock = false;
  const connectionLost = () => {
    active?.abort();
  };
  lock.on('error', connectionLost);
  try {
    const acquired = await lock.query('SELECT pg_try_advisory_lock(7321042) AS locked');
    if (!acquired.rows[0]?.locked) throw new ImageError('worker_already_running');
    ownsLock = true;
    const fingerprint = digest('worker-key', key);
    await lock.query(
      'INSERT INTO image_generation_control(id,key_fingerprint) VALUES(1,$1) ON CONFLICT(id) DO NOTHING',
      [fingerprint],
    );
    const config = await lock.query(
      'SELECT key_fingerprint FROM image_generation_control WHERE id=1',
    );
    if (config.rows[0]?.key_fingerprint !== fingerprint) throw new ImageError('key_mismatch');
    // Never resubmit a generation whose external result may already exist.
    await lock.query(
      "UPDATE image_generation_jobs SET status='error',stage='error',code='worker_interrupted',prompt=NULL,updated_at=now() WHERE status='running'",
    );
    const heartbeat = async () => {
      if (tickRunning) return;
      tickRunning = true;
      try {
        await lock.query('UPDATE image_generation_control SET heartbeat=now() WHERE id=1');
        await lock.query('DELETE FROM image_generation_jobs WHERE expires_at<now()');
        await lock.query('DELETE FROM image_generation_quota WHERE expires_at<now()');
      } catch {
        connectionLost();
        throw new ImageError('database_unavailable');
      } finally {
        tickRunning = false;
      }
    };
    while (!signal.aborted) {
      await heartbeat();
      const control = await lock.query(
        'SELECT blocked_code FROM image_generation_control WHERE id=1',
      );
      if (control.rows[0]?.blocked_code) {
        // Fail pending requests promptly, including admissions racing the circuit.
        // Never leave users polling an unavailable provider until job expiry.
        await lock.query(
          "UPDATE image_generation_jobs SET status='error',stage='error',code=$1,prompt=NULL,updated_at=now() WHERE status='queued'",
          [control.rows[0].blocked_code],
        );
        await pause(signal, 2000);
        continue;
      }
      const claimed = await lock.query(
        "UPDATE image_generation_jobs SET status='running',stage='opening',lease_until=now()+interval '20 seconds',updated_at=now() WHERE id=(SELECT id FROM image_generation_jobs WHERE status='queued' AND expires_at>now() ORDER BY created_at LIMIT 1) RETURNING *",
      );
      const job = claimed.rows[0];
      if (!job) {
        await pause(signal, 1500);
        continue;
      }
      const controller = new AbortController();
      active = controller;
      const abort = () => controller.abort();
      signal.addEventListener('abort', abort, { once: true });
      let leaseRunning = false,
        leaseFailed = false;
      const lease = setInterval(async () => {
        if (leaseRunning) return;
        leaseRunning = true;
        try {
          await heartbeat();
          const result = await lock.query(
            "UPDATE image_generation_jobs SET lease_until=now()+interval '20 seconds' WHERE id=$1 AND status='running' AND expires_at>now() RETURNING id",
            [job.id],
          );
          if (!result.rows[0]) controller.abort();
        } catch {
          leaseFailed = true;
          controller.abort();
        } finally {
          leaseRunning = false;
        }
      }, 5000);
      const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);
      try {
        const prompt = decrypt(job.prompt, key, `${job.id}:prompt`).toString('utf8');
        const result = await provider(prompt, {
          signal: controller.signal,
          onStage: (stage) => {
            void lock
              .query(
                "UPDATE image_generation_jobs SET stage=$2,updated_at=now() WHERE id=$1 AND status='running'",
                [job.id, stage],
              )
              .catch(() => controller.abort());
          },
          onMetrics: (metrics) => log({ event: 'generation', id: job.id, ...metrics }),
        });
        if (controller.signal.aborted)
          throw new ImageError(signal.aborted ? 'worker_interrupted' : 'provider_timeout');
        const mime = identifyImage(result.bytes);
        await lock.query(
          "UPDATE image_generation_jobs SET status='ready',stage='ready',prompt=NULL,image=$2,mime=$3,lease_until=NULL,expires_at=now()+interval '30 minutes',updated_at=now() WHERE id=$1 AND status='running'",
          [job.id, encrypt(result.bytes, key, `${job.id}:image`), mime],
        );
        failures = 0;
      } catch (error) {
        const code = signal.aborted
          ? 'worker_interrupted'
          : safeCodes.has(error.code)
            ? error.code
            : 'provider_error';
        await lock
          .query(
            "UPDATE image_generation_jobs SET status='error',stage='error',code=$2,prompt=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND status='running'",
            [job.id, code],
          )
          .catch(() => {});
        const status = await lock
          .query('SELECT status FROM image_generation_jobs WHERE id=$1', [job.id])
          .catch(() => ({ rows: [] }));
        if (status.rows[0]?.status !== 'cancelled') {
          failures++;
          if (
            ['signup_required', 'captcha_required', 'quota_reached'].includes(code) ||
            failures >= 3
          )
            await lock.query('UPDATE image_generation_control SET blocked_code=$1 WHERE id=1', [
              code,
            ]);
        }
        log({ event: 'generation_failed', id: job.id, code });
      } finally {
        clearInterval(lease);
        clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
        active = null;
      }
      if (leaseFailed) throw new ImageError('database_unavailable');
    }
  } finally {
    active?.abort();
    lock.off('error', connectionLost);
    if (ownsLock) {
      await lock
        .query('UPDATE image_generation_control SET heartbeat=NULL WHERE id=1')
        .catch(() => {});
      await lock.query('SELECT pg_advisory_unlock(7321042)').catch(() => {});
    }
    lock.release(true);
  }
}
function pause(signal, ms) {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const key = keyFromEnv(process.env['IMAGE_GENERATION_KEY']);
  if (!process.env['IMAGE_GENERATION_DATABASE_URL']) throw new ImageError('not_configured');
  const pool = new pg.Pool({
    connectionString: process.env['IMAGE_GENERATION_DATABASE_URL'],
    max: 2,
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
  });
  const controller = new AbortController();
  for (const event of ['SIGINT', 'SIGTERM']) process.on(event, () => controller.abort());
  runWorker({
    pool,
    key,
    signal: controller.signal,
    log: (value) => console.log(JSON.stringify(value)),
  })
    .catch(() => {
      console.error('Image worker stopped; inspect health and configuration.');
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
