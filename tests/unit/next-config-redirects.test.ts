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

    expect(redirects).toHaveLength(17);
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/image-compress',
          destination: '/image-tools',
          permanent: true,
        },
        {
          source: '/tools-dashboard',
          destination: '/tools',
          permanent: true,
        },
        {
          source: '/loan-calculator',
          destination: '/loan',
          permanent: true,
        },
        {
          source: '/salary-calculator',
          destination: '/salary',
          permanent: true,
        },
        {
          source: '/text-tools/resume-builder',
          destination: '/career-tools/resume-builder',
          permanent: true,
        },
        {
          source: '/asdev-portfolio',
          destination: '/asdev',
          permanent: true,
        },
        {
          source: '/brand/asdev-portfolio',
          destination: '/asdev',
          permanent: true,
        },
        {
          source: '/contract-tools/rental-contract',
          destination: '/contract-tools/lease-agreement',
          permanent: true,
        },
        {
          source: '/legal-documents',
          destination: '/contract-tools',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/add-header-footer',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/pdf-tools/paginate',
          destination: '/pdf-tools/edit',
          permanent: true,
        },
        {
          source: '/pdf-tools/paginate/add-page-numbers',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/topics/date-tools',
          destination: '/date-tools',
          permanent: true,
        },
        {
          source: '/topics/finance-tools',
          destination: '/tools',
          permanent: true,
        },
        {
          source: '/topics/pdf-tools',
          destination: '/pdf-tools',
          permanent: true,
        },
        {
          source: '/topics/image-tools',
          destination: '/image-tools',
          permanent: true,
        },
        {
          source: '/topics/text-tools',
          destination: '/text-tools',
          permanent: true,
        },
      ]),
    );
  });

  it('adds v3 redirect map when flag is enabled', async () => {
    const config = await loadNextConfig('1');
    const redirects = await config.redirects();

    expect(redirects).toHaveLength(20);
    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/image-compress',
          destination: '/image-tools',
          permanent: true,
        },
        {
          source: '/tools-dashboard',
          destination: '/tools',
          permanent: true,
        },
        {
          source: '/loan-calculator',
          destination: '/loan',
          permanent: true,
        },
        {
          source: '/salary-calculator',
          destination: '/salary',
          permanent: true,
        },
        {
          source: '/text-tools/resume-builder',
          destination: '/career-tools/resume-builder',
          permanent: true,
        },
        {
          source: '/asdev-portfolio',
          destination: '/asdev',
          permanent: true,
        },
        {
          source: '/brand/asdev-portfolio',
          destination: '/asdev',
          permanent: true,
        },
        {
          source: '/contract-tools/rental-contract',
          destination: '/contract-tools/lease-agreement',
          permanent: true,
        },
        {
          source: '/legal-documents',
          destination: '/contract-tools',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/add-header-footer',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/pdf-tools/paginate',
          destination: '/pdf-tools/edit',
          permanent: true,
        },
        {
          source: '/pdf-tools/paginate/add-page-numbers',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/topics/date-tools',
          destination: '/date-tools',
          permanent: true,
        },
        {
          source: '/topics/finance-tools',
          destination: '/tools',
          permanent: true,
        },
        {
          source: '/topics/pdf-tools',
          destination: '/pdf-tools',
          permanent: true,
        },
        {
          source: '/topics/image-tools',
          destination: '/image-tools',
          permanent: true,
        },
        {
          source: '/topics/text-tools',
          destination: '/text-tools',
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
