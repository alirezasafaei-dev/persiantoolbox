import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSession, deleteSession, getSessionByToken } from '@/lib/server/sessions';
import { query } from '@/lib/server/db';

vi.mock('@/lib/server/db', () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe('sessions server module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a session and persists it', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    const session = await createSession('user-1');

    expect(session.userId).toBe('user-1');
    expect(session.token.length).toBeGreaterThan(20);
    expect(mockQuery).toHaveBeenCalledOnce();
  });

  it('returns null when session token does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    const session = await getSessionByToken('missing');
    expect(session).toBeNull();
  });

  it('deletes expired session and returns null', async () => {
    const expiredAt = Date.now() - 10_000;
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 's1',
            token: 't1',
            user_id: 'u1',
            created_at: Date.now() - 20_000,
            expires_at: expiredAt,
          },
        ],
        rowCount: 1,
      } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    const session = await getSessionByToken('t1');
    expect(session).toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[1]?.[0]).toContain('DELETE FROM sessions');
  });

  it('returns active session', async () => {
    const future = Date.now() + 60_000;
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 's1',
          token: 't1',
          user_id: 'u1',
          created_at: Date.now() - 1000,
          expires_at: future,
        },
      ],
      rowCount: 1,
    } as never);

    const session = await getSessionByToken('t1');
    expect(session?.token).toBe('t1');
    expect(session?.userId).toBe('u1');
  });

  it('deletes session by token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    await deleteSession('token-1');
    expect(mockQuery).toHaveBeenCalledWith('DELETE FROM sessions WHERE token = $1', ['token-1']);
  });
});
