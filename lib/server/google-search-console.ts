import { google } from 'googleapis';

const SITE_URL = 'https://persiantoolbox.ir';

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

export async function getIndexingStatus() {
  try {
    const sc = getSearchConsole();
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
    const endDate = new Date().toISOString().split('T')[0]!;

    const response = await sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10,
      },
    });

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
    const response = await sc.sitemaps.list({ siteUrl: SITE_URL });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sitemaps = ((response.data as any).sitemapEntry ?? []) as Array<{
      path?: string;
      type?: string;
      lastSubmitted?: string;
      lastDownloaded?: string;
      isPending?: boolean;
      isSitemapsIndex?: boolean;
      errors?: number;
      warnings?: number;
    }>;
    return {
      ok: true,
      sitemaps: sitemaps.map((s) => ({
        path: s.path ?? '',
        type: s.type ?? '',
        lastSubmitted: s.lastSubmitted ?? '',
        lastDownloaded: s.lastDownloaded ?? '',
        isPending: s.isPending ?? false,
        isSitemapsIndex: s.isSitemapsIndex ?? false,
        errors: s.errors ?? 0,
        warnings: s.warnings ?? 0,
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
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
    const endDate = new Date().toISOString().split('T')[0]!;

    await sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        rowLimit: 1,
      },
    });
    return { ok: true, connected: true };
  } catch (error) {
    return {
      ok: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
