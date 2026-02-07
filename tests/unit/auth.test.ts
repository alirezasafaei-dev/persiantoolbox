import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSessionResponse,
  createSessionResponse,
  getSessionToken,
  getUserFromRequest,
  getUserFromSessionToken,
} from '@/lib/server/auth';
import { createSession, deleteSession, getSessionByToken } from '@/lib/server/sessions';
import { getUserById } from '@/lib/server/users';

vi.mock('@/lib/server/sessions', () => ({
  createSession: vi.fn(),
  getSessionByToken: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('@/lib/server/users', () => ({
  getUserById: vi.fn(),
}));

const mockCreateSession = vi.mocked(createSession);
const mockGetSessionByToken = vi.mocked(getSessionByToken);
const mockDeleteSession = vi.mocked(deleteSession);
const mockGetUserById = vi.mocked(getUserById);

describe('auth helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('extracts session token from cookie header', () => {
    const request = new Request('http://localhost', {
      headers: { cookie: 'a=1; pt_session=token-123; b=2' },
    });
    expect(getSessionToken(request)).toBe('token-123');
  });

  it('returns null user when session token is missing', async () => {
    const request = new Request('http://localhost');
    const user = await getUserFromRequest(request);
    expect(user).toBeNull();
  });

  it('resolves user from session token', async () => {
    mockGetSessionByToken.mockResolvedValue({
      id: 's1',
      token: 't1',
      userId: 'u1',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_000,
    });
    mockGetUserById.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      passwordHash: 'x',
      createdAt: Date.now(),
    });

    const user = await getUserFromSessionToken('t1');
    expect(user?.id).toBe('u1');
  });

  it('creates session response with cookie', async () => {
    mockCreateSession.mockResolvedValue({
      id: 's1',
      token: 'token-1',
      userId: 'u1',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_000,
    });

    const response = await createSessionResponse('u1');
    expect(response.headers.get('set-cookie')).toContain('pt_session=token-1');
  });

  it('clears existing session token on logout', async () => {
    const request = new Request('http://localhost', {
      headers: { cookie: 'pt_session=token-1' },
    });

    const response = await clearSessionResponse(request);
    expect(mockDeleteSession).toHaveBeenCalledWith('token-1');
    expect(response.headers.get('set-cookie')).toContain('pt_session=');
  });
});
