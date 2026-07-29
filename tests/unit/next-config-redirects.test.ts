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
      headers: () => Promise<
        Array<{ source: string; headers: Array<{ key: string; value: string }> }>
      >;
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

    expect(redirects).toHaveLength(32);
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
          source: '/pdf-tools/compress',
          destination: '/pdf-tools/compress/compress-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/pdf-tools/extract',
          destination: '/pdf-tools/extract/extract-text',
          permanent: true,
        },
        {
          source: '/pdf-tools/security',
          destination: '/pdf-tools/security/encrypt-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/watermark',
          destination: '/pdf-tools/watermark/add-watermark',
          permanent: true,
        },
        {
          source: '/pdf-tools/convert',
          destination: '/pdf-tools/convert/pdf-to-text',
          permanent: true,
        },
        {
          source: '/pdf-tools/split',
          destination: '/pdf-tools/split/split-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/reorder-pdf',
          destination: '/pdf-tools/edit/reorder-pages',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/delete-pdf-pages',
          destination: '/pdf-tools/edit/delete-pages',
          permanent: true,
        },
        {
          source: '/pdf-tools/converter/pdf-to-word',
          destination: '/pdf-tools/convert/pdf-to-text',
          permanent: true,
        },
      ]),
    );
  });

  it('adds v3 redirect map when flag is enabled', async () => {
    const config = await loadNextConfig('1');
    const redirects = await config.redirects();

    expect(redirects).toHaveLength(35);
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
          source: '/pdf-tools/compress',
          destination: '/pdf-tools/compress/compress-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit',
          destination: '/pdf-tools/edit/add-page-numbers',
          permanent: true,
        },
        {
          source: '/pdf-tools/extract',
          destination: '/pdf-tools/extract/extract-text',
          permanent: true,
        },
        {
          source: '/pdf-tools/security',
          destination: '/pdf-tools/security/encrypt-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/watermark',
          destination: '/pdf-tools/watermark/add-watermark',
          permanent: true,
        },
        {
          source: '/pdf-tools/convert',
          destination: '/pdf-tools/convert/pdf-to-text',
          permanent: true,
        },
        {
          source: '/pdf-tools/split',
          destination: '/pdf-tools/split/split-pdf',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/reorder-pdf',
          destination: '/pdf-tools/edit/reorder-pages',
          permanent: true,
        },
        {
          source: '/pdf-tools/edit/delete-pdf-pages',
          destination: '/pdf-tools/edit/delete-pages',
          permanent: true,
        },
        {
          source: '/pdf-tools/converter/pdf-to-word',
          destination: '/pdf-tools/convert/pdf-to-text',
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

  it('permanently maps each proven legacy tool alias directly to its canonical route', async () => {
    const config = await loadNextConfig('0');
    const redirects = await config.redirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: '/check-penalty', destination: '/tools/check-penalty', permanent: true },
        {
          source: '/loan-vs-investment',
          destination: '/tools/loan-vs-investment',
          permanent: true,
        },
        {
          source: '/overtime-calculator',
          destination: '/tools/overtime-calculator',
          permanent: true,
        },
        { source: '/leave-calculator', destination: '/tools/leave-calculator', permanent: true },
        {
          source: '/inflation-calculator',
          destination: '/tools/inflation-calculator',
          permanent: true,
        },
      ]),
    );
  });

  it('marks root and nested Open Graph image routes as noindex without blocking them', async () => {
    const config = await loadNextConfig('0');
    const headers = await config.headers();
    const noindexHeader = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

    expect(headers).toEqual(
      expect.arrayContaining([
        { source: '/opengraph-image', headers: noindexHeader },
        { source: '/:path*/opengraph-image', headers: noindexHeader },
      ]),
    );
  });
});
