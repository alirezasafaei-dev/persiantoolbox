import { randomBytes, randomUUID } from 'node:crypto';
import { query } from './db';
import { redisGet, redisSet, redisDel } from './redis';

type Session = {
  id: string;
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

type SessionRow = {
  id: string;
  token: string;
  user_id: string;
  created_at: number | string;
  expires_at: number | string;
};

const FALLBACK_TTL_DAYS = 7;

function resolveSessionTtlDays() {
  const rawValue = Number(process.env['SESSION_TTL_DAYS'] ?? String(FALLBACK_TTL_DAYS));
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return FALLBACK_TTL_DAYS;
  }
  return rawValue;
}

const SESSION_TTL_DAYS = resolveSessionTtlDays();
export const SESSION_TTL_SECONDS = Math.round(SESSION_TTL_DAYS * 24 * 60 * 60);

const SESSION_CACHE_PREFIX = 'session:';
const SESSION_CACHE_TTL = SESSION_TTL_SECONDS;

function mapSession(row: SessionRow): Session {
  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
  };
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function serializeSession(session: Session): string {
  return JSON.stringify(session);
}

function deserializeSession(data: string): Session | null {
  try {
    const parsed = JSON.parse(data) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'token' in parsed &&
      'userId' in parsed &&
      'createdAt' in parsed &&
      'expiresAt' in parsed
    ) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<Session> {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const session: Session = {
    id: randomUUID(),
    token: generateToken(),
    userId,
    createdAt: now,
    expiresAt,
  };
  await query(
    'INSERT INTO sessions (id, token, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4, $5)',
    [session.id, session.token, session.userId, session.createdAt, session.expiresAt],
  );
  await redisSet(
    `${SESSION_CACHE_PREFIX}${session.token}`,
    serializeSession(session),
    SESSION_CACHE_TTL,
  );
  return session;
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const cached = await redisGet(`${SESSION_CACHE_PREFIX}${token}`);
  if (cached) {
    const session = deserializeSession(cached);
    if (session && session.expiresAt >= Date.now()) {
      return session;
    }
    if (session) {
      await redisDel(`${SESSION_CACHE_PREFIX}${token}`);
    }
  }

  const result = await query<SessionRow>(
    'SELECT id, token, user_id, created_at, expires_at FROM sessions WHERE token = $1 LIMIT 1',
    [token],
  );
  if (result.rowCount === 0) {
    return null;
  }
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  const session = mapSession(row);
  if (session.expiresAt < Date.now()) {
    await deleteSession(token);
    return null;
  }

  const ttlSeconds = Math.max(1, Math.ceil((session.expiresAt - Date.now()) / 1000));
  await redisSet(`${SESSION_CACHE_PREFIX}${token}`, serializeSession(session), ttlSeconds);

  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
  await redisDel(`${SESSION_CACHE_PREFIX}${token}`);
}
