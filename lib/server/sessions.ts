import { randomBytes, randomUUID } from 'node:crypto';
import { query } from './db';

export type Session = {
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

const DEFAULT_TTL_DAYS = Number(process.env['SESSION_TTL_DAYS'] ?? '7');

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

export async function createSession(userId: string): Promise<Session> {
  const now = Date.now();
  const expiresAt = now + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000;
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
  return session;
}

export async function getSessionByToken(token: string): Promise<Session | null> {
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
  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM sessions WHERE token = $1', [token]);
}
