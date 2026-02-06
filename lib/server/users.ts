import { randomUUID } from 'node:crypto';
import { query } from './db';
import { hashPassword, verifyPassword } from './passwords';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
};

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: number | string;
};

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

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const normalized = email.toLowerCase();
  const result = await query<UserRow>(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
    [normalized],
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

export async function createUser(email: string, password: string): Promise<User> {
  const normalized = email.toLowerCase();
  const now = Date.now();
  const user: User = {
    id: randomUUID(),
    email: normalized,
    passwordHash: hashPassword(password),
    createdAt: now,
  };
  try {
    await query(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.passwordHash, user.createdAt],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error('USER_EXISTS');
    }
    throw error;
  }
  return user;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return user;
}
