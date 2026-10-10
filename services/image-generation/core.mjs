import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

export class ImageError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
export function keyFromEnv(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(value))
    throw new ImageError('not_configured');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new ImageError('not_configured');
  return key;
}
export function digest(value, key) {
  return createHmac('sha256', key).update(value).digest('hex');
}
export function newSession(key, now = Date.now()) {
  const body = `${randomBytes(32).toString('hex')}.${now + 86400000}`;
  return `${body}.${digest(`session:${body}`, key)}`;
}
export function ownerFromCookie(value, key, now = Date.now()) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}\.\d{13}\.[a-f0-9]{64}$/.test(value)) return null;
  const [id, expiry, signature] = value.split('.');
  const expiration = Number(expiry);
  if (expiration <= now || expiration > now + 86400000) return null;
  const expected = digest(`session:${id}.${expiry}`, key);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  return digest(`owner:${id}`, key);
}
export function encrypt(bytes, key, aad) {
  const nonce = randomBytes(12),
    cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(Buffer.from(aad));
  const encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), encrypted]);
}
export function decrypt(bytes, key, aad) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 28) throw new ImageError('invalid_data');
  const cipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
  cipher.setAAD(Buffer.from(aad));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]);
}
export function validatePrompt(value) {
  if (typeof value !== 'string') throw new ImageError('invalid_prompt');
  const text = value.trim();
  if (
    text.length < 8 ||
    text.length > 2000 ||
    [...text].some((character) => {
      const code = character.charCodeAt(0);
      return code === 127 || (code < 32 && ![9, 10, 13].includes(code));
    })
  )
    throw new ImageError('invalid_prompt');
  return text;
}
export function identifyImage(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 32 || bytes.length > 5 * 1024 * 1024)
    throw new ImageError('invalid_image');
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    bytes.toString('ascii', 12, 16) === 'IHDR'
  )
    return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP')
    return 'image/webp';
  throw new ImageError('invalid_image');
}
export const safeCodes = new Set([
  'signup_required',
  'captcha_required',
  'quota_reached',
  'provider_timeout',
  'invalid_image',
  'browser_unavailable',
  'provider_error',
  'worker_interrupted',
]);
export const validId = (value) =>
  typeof value === 'string' &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
export function createStore(pool, key) {
  const transaction = async (fn) => {
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      const result = await fn(db);
      await db.query('COMMIT');
      return result;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  };
  const publicJob = (row) =>
    row
      ? {
          id: row.id,
          status: row.status,
          stage: row.stage,
          code: row.code,
          createdAt: new Date(row.created_at).getTime(),
          expiresAt: new Date(row.expires_at).getTime(),
        }
      : null;
  return {
    async submit(owner, ip, prompt, requestId) {
      prompt = validatePrompt(prompt);
      if (!validId(requestId)) throw new ImageError('invalid_request');
      return transaction(async (db) => {
        await db.query('SELECT pg_advisory_xact_lock(7321041)');
        const existing = await db.query(
          'SELECT * FROM image_generation_jobs WHERE owner=$1 AND request_id=$2 AND expires_at>now()',
          [owner, requestId],
        );
        if (existing.rows[0]) return publicJob(existing.rows[0]);
        const health = await db.query(
          "SELECT * FROM image_generation_control WHERE id=1 AND heartbeat>now()-interval '20 seconds' AND blocked_code IS NULL",
        );
        if (!health.rows[0] || health.rows[0].key_fingerprint !== digest('worker-key', key))
          throw new ImageError('unavailable');
        const counts = await db.query(
          "SELECT count(*) FILTER (WHERE status IN ('queued','running'))::int AS pending, count(*) FILTER (WHERE owner=$1 AND status IN ('queued','running'))::int AS owned FROM image_generation_jobs WHERE expires_at>now()",
          [owner],
        );
        if (counts.rows[0].owned > 0) throw new ImageError('already_running');
        if (counts.rows[0].pending >= 3) throw new ImageError('queue_full');
        const hour = Math.floor(Date.now() / 3600000),
          day = Math.floor(Date.now() / 86400000);
        const limits = [
          [digest(`ip:${ip}`, key), hour, 3],
          [owner, hour, 3],
          ['global-hour', hour, 10],
          ['global-day', day, 20],
        ];
        for (const [bucket, window, limit] of limits) {
          const result = await db.query(
            'SELECT count FROM image_generation_quota WHERE bucket=$1 AND window_id=$2',
            [bucket, window],
          );
          if ((result.rows[0]?.count || 0) >= limit) throw new ImageError('quota_reached');
        }
        const id = randomUUID();
        const result = await db.query(
          "INSERT INTO image_generation_jobs(id,owner,request_id,prompt,status,stage,expires_at) VALUES($1,$2,$3,$4,'queued','queued',now()+interval '30 minutes') RETURNING *",
          [id, owner, requestId, encrypt(Buffer.from(prompt), key, `${id}:prompt`)],
        );
        for (const [bucket, window] of limits)
          await db.query(
            "INSERT INTO image_generation_quota(bucket,window_id,count,expires_at) VALUES($1,$2,1,now()+interval '2 days') ON CONFLICT(bucket,window_id) DO UPDATE SET count=image_generation_quota.count+1",
            [bucket, window],
          );
        return publicJob(result.rows[0]);
      });
    },
    async get(owner, id) {
      const result = await pool.query(
        'SELECT * FROM image_generation_jobs WHERE owner=$1 AND id=$2 AND expires_at>now()',
        [owner, id],
      );
      return publicJob(result.rows[0]);
    },
    async latest(owner) {
      const result = await pool.query(
        'SELECT * FROM image_generation_jobs WHERE owner=$1 AND expires_at>now() ORDER BY created_at DESC LIMIT 1',
        [owner],
      );
      return publicJob(result.rows[0]);
    },
    async cancel(owner, id) {
      await pool.query(
        "UPDATE image_generation_jobs SET status='cancelled',stage='cancelled',prompt=NULL,image=NULL,updated_at=now() WHERE owner=$1 AND id=$2 AND status IN ('queued','running')",
        [owner, id],
      );
      return this.get(owner, id);
    },
    async image(owner, id) {
      const result = await pool.query(
        "SELECT image,mime FROM image_generation_jobs WHERE owner=$1 AND id=$2 AND status='ready' AND expires_at>now()",
        [owner, id],
      );
      const row = result.rows[0];
      if (!row?.image) return null;
      const bytes = decrypt(row.image, key, `${id}:image`);
      if (identifyImage(bytes) !== row.mime) throw new ImageError('invalid_image');
      return { bytes, mime: row.mime };
    },
  };
}
