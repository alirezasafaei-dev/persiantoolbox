import { randomUUID } from 'node:crypto';
import { query } from './db';
import { hashPassword, verifyPassword } from './passwords';
import { logger } from './logger';

export type UserRole = 'admin' | 'editor' | 'user';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  role?: UserRole;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: number | string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: Number(row.created_at),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = normalizeEmail(email);
  const result = await query<UserRow>(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
    [normalized],
  );
  if (result.rowCount === 0) {
    return null;
  }
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return mapUser(row);
}

export { findUserByEmail as getUserByEmail };

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await query<UserRow>(
    'SELECT id, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  if (result.rowCount === 0) {
    return undefined;
  }
  const row = result.rows[0];
  if (!row) {
    return undefined;
  }
  return mapUser(row);
}

export async function createUser(
  email: string,
  password: string,
  options?: { name?: string; role?: UserRole },
): Promise<User> {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const user: User = {
    id: randomUUID(),
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt: now,
    role: options?.role ?? 'user',
  };
  try {
    await query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.passwordHash, user.createdAt],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      logger.warn('User creation failed: email already exists', { email: normalized });
      throw new Error('USER_EXISTS');
    }
    logger.error('Failed to create user', {
      error: error instanceof Error ? error.message : String(error),
      email: normalized,
    });
    throw error;
  }
  return user;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    logger.debug('User validation failed: user not found', { email: normalizeEmail(email) });
    return null;
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    logger.warn('User validation failed: invalid password', { email: normalizeEmail(email) });
    return null;
  }
  return user;
}
