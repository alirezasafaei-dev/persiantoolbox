import { afterEach, describe, expect, it, vi } from 'vitest';

const envKey = 'FEATURE_V3_REDIRECTS';
const originalFlag = process.env[envKey];

async function loadNextConfig(flag?: string) {
  if (flag === undefined) {
    delete process.env[envKey];
  } else {
    process.env[envKey] = flag;
  }

  vi.resetModules();
  const configModule = (await import('../../next.config.mjs')) as {
    default: {
      redirects: () => Promise<Array<{ source: string; destination: string; permanent: boolean }>>;
    };
  };
  return configModule.default;
}

afterEach(() => {
  if (originalFlag === undefined) {
    delete process.env[envKey];
  } else {
    process.env[envKey] = originalFlag;
  }
  vi.resetModules();
});

describe('next config redirects', () => {
  it('keeps only baseline redirects when v3 flag is disabled', async () => {
    const config = await loadNextConfig('0');
    const redirects = await config.redirects();

    expect(redirects).toEqual([
      {
        source: '/image-compress',
        destination: '/image-tools',
        permanent: true,
      },
    ]);
  });

  it('adds v3 redirect map when flag is enabled', async () => {
    const config = await loadNextConfig('1');
    const redirects = await config.redirects();

    expect(redirects).toHaveLength(4);
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/image-compress',
          destination: '/image-tools',
          permanent: true,
        },
        {
          source: '/roadmap-board',
          destination: '/deployment-roadmap',
          permanent: true,
        },
        {
          source: '/subscription-roadmap',
          destination: '/plans',
          permanent: true,
        },
        {
          source: '/developers',
          destination: '/topics',
          permanent: true,
        },
      ]),
    );
  });
});
