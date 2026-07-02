import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRuntimeVersion } from '@/lib/runtime-version';

describe('getRuntimeVersion', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes deploy traceability from release environment variables', () => {
    vi.stubEnv('RELEASE_GIT_SHA', '6608314eacbd1234567890abcdef1234567890ab');
    vi.stubEnv('RELEASE_GIT_BRANCH', 'main');
    vi.stubEnv('RELEASE_BUILT_AT', '2026-07-02T18:00:00Z');

    expect(getRuntimeVersion()).toMatchObject({
      commit: '6608314eacbd',
      branch: 'main',
      builtAt: '2026-07-02T18:00:00Z',
    });
  });

  it('prefers public build-time git metadata when present', () => {
    vi.stubEnv('NEXT_PUBLIC_GIT_SHA', '017f4cde99999999999999999999999999999999');
    vi.stubEnv('NEXT_PUBLIC_GIT_BRANCH', 'release');
    vi.stubEnv('NEXT_PUBLIC_BUILD_DATE', '2026-07-02T19:00:00Z');
    vi.stubEnv('RELEASE_GIT_SHA', '6608314eacbd1234567890abcdef1234567890ab');
    vi.stubEnv('RELEASE_GIT_BRANCH', 'main');
    vi.stubEnv('RELEASE_BUILT_AT', '2026-07-02T18:00:00Z');

    expect(getRuntimeVersion()).toMatchObject({
      commit: '017f4cde9999',
      branch: 'release',
      builtAt: '2026-07-02T19:00:00Z',
    });
  });
});
