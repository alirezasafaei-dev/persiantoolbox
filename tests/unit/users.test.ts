import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser, findUserByEmail, validateUser } from '@/lib/server/users';
import { query } from '@/lib/server/db';

vi.mock('@/lib/server/db', () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe('users server module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('normalizes email before lookup', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    await findUserByEmail(' Admin@Example.com ');

    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
      ['admin@example.com'],
    );
  });

  it('normalizes email before create', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    const user = await createUser(' Admin@Example.com ', 'password-123');

    expect(user.email).toBe('admin@example.com');
    expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)',
      [user.id, 'admin@example.com', user.passwordHash, user.createdAt],
    );
  });

  it('accepts normalized input during validate', async () => {
    const password = 'password-123';
    const createdUser = await createUser('admin@example.com', password);
    mockQuery.mockReset();
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: createdUser.id,
          email: createdUser.email,
          password_hash: createdUser.passwordHash,
          created_at: createdUser.createdAt,
        },
      ],
      rowCount: 1,
    } as never);

    const user = await validateUser(' Admin@Example.com ', password);

    expect(user?.email).toBe('admin@example.com');
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
      ['admin@example.com'],
    );
  });
});
