import { google } from 'googleapis';
import { getDefaultSiteUrl } from '@/lib/brand';

const SITE_URL = getDefaultSiteUrl();

let searchConsole: ReturnType<typeof google.searchconsole> | null = null;

function getSearchConsole() {
  if (searchConsole) {
    return searchConsole;
  }

  const keyFile = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  if (!keyFile) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  searchConsole = google.searchconsole({ version: 'v1', auth });
  return searchConsole;
}

function getSearchConsoleSiteCandidates(): string[] {
  const explicit = process.env['GOOGLE_SEARCH_CONSOLE_SITE_URL']?.trim();
  if (explicit) {
    return [explicit];
  }

  const candidates = new Set<string>([SITE_URL]);

  try {
    const url = new URL(SITE_URL);
    candidates.add(`sc-domain:${url.hostname.replace(/^www\./, '')}`);
  } catch {
    // Keep the configured URL candidate only.
  }

  return Array.from(candidates);
}

function shouldTryNextSite(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /sufficient permission|not a verified owner|User does not have/i.test(message);
}

type SitemapEntry = {
  path?: string;
  type?: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  errors?: number | string;
  warnings?: number | string;
};

function extractSitemapEntries(payload: unknown): SitemapEntry[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as {
    sitemap?: SitemapEntry[];
    sitemapEntry?: SitemapEntry[];
  };

  if (Array.isArray(response.sitemap)) {
    return response.sitemap;
  }

  if (Array.isArray(response.sitemapEntry)) {
    return response.sitemapEntry;
  }

  return [];
}

async function runWithSearchConsoleSite<T>(operation: (siteUrl: string) => Promise<T>): Promise<T> {
  const sites = getSearchConsoleSiteCandidates();
  let lastError: unknown;

  for (const siteUrl of sites) {
    try {
      return await operation(siteUrl);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextSite(error) || siteUrl === sites[sites.length - 1]) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No Search Console property matched');
}

export async function getIndexingStatus() {
  try {
    const sc = getSearchConsole();
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] as string;
    const endDate = new Date().toISOString().split('T')[0] as string;

    const response = await runWithSearchConsoleSite((siteUrl) =>
      sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10,
        },
      }),
    );

    const rows = response.data.rows ?? [];
    return {
      ok: true,
      queries: rows.map((row) => ({
        query: row.keys?.[0] ?? '',
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })),
    };
  } catch (error) {
    return {
      ok: false,
      queries: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getSitemapStatus() {
  try {
    const sc = getSearchConsole();
    const response = await runWithSearchConsoleSite((siteUrl) => sc.sitemaps.list({ siteUrl }));

    const sitemaps = extractSitemapEntries(response.data);
    return {
      ok: true,
      sitemaps: sitemaps.map((s) => ({
        path: s.path ?? '',
        type: s.type ?? '',
        lastSubmitted: s.lastSubmitted ?? '',
        lastDownloaded: s.lastDownloaded ?? '',
        isPending: s.isPending ?? false,
        isSitemapsIndex: s.isSitemapsIndex ?? false,
        errors: Number(s.errors ?? 0),
        warnings: Number(s.warnings ?? 0),
      })),
    };
  } catch (error) {
    return {
      ok: false,
      sitemaps: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function searchConsoleHealthCheck() {
  try {
    const sc = getSearchConsole();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] as string;
    const endDate = new Date().toISOString().split('T')[0] as string;

    await runWithSearchConsoleSite((siteUrl) =>
      sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          rowLimit: 1,
        },
      }),
    );
    return { ok: true, connected: true };
  } catch (error) {
    return {
      ok: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const __testing = {
  extractSitemapEntries,
  getSearchConsoleSiteCandidates,
  shouldTryNextSite,
};
