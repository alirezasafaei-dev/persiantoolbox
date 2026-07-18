import { google } from 'googleapis';
import { getDefaultSiteUrl } from '@/lib/brand';

const SITE_URL = getDefaultSiteUrl();
const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const DAY_MS = 24 * 60 * 60 * 1000;

let searchConsole: ReturnType<typeof google.searchconsole> | null = null;

function getSearchConsole() {
  if (searchConsole) {
    return searchConsole;
  }

  const keyFile = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  if (!keyFile) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  }

  const auth = new google.auth.GoogleAuth({ keyFile, scopes: [READONLY_SCOPE] });
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
  contents?: Array<{
    type?: string;
    submitted?: number | string;
    indexed?: number | string;
  }>;
};

type SearchMetricRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SearchTotals = Omit<SearchMetricRow, 'key'>;

type DateWindow = {
  startDate: string;
  endDate: string;
};

export type SearchPerformanceOptions = {
  page?: string;
  rowLimit?: number;
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

async function runWithSearchConsoleSite<T>(
  operation: (siteUrl: string) => Promise<T>,
): Promise<{ siteUrl: string; data: T }> {
  const sites = getSearchConsoleSiteCandidates();
  let lastError: unknown;

  for (const siteUrl of sites) {
    try {
      return { siteUrl, data: await operation(siteUrl) };
    } catch (error) {
      lastError = error;
      if (!shouldTryNextSite(error) || siteUrl === sites[sites.length - 1]) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No Search Console property matched');
}

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

function getComparisonWindows(now = new Date()): { current: DateWindow; previous: DateWindow } {
  const currentEnd = new Date(now.getTime() - 2 * DAY_MS);
  const currentStart = new Date(currentEnd.getTime() - 27 * DAY_MS);
  const previousEnd = new Date(currentStart.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - 27 * DAY_MS);

  return {
    current: { startDate: toDateString(currentStart), endDate: toDateString(currentEnd) },
    previous: { startDate: toDateString(previousStart), endDate: toDateString(previousEnd) },
  };
}

function normalizePageFilter(page?: string): string | undefined {
  const value = page?.trim();
  if (!value) {
    return undefined;
  }

  const absolute = new URL(value, SITE_URL);
  const canonicalHost = new URL(SITE_URL).hostname.replace(/^www\./, '');
  if (absolute.hostname.replace(/^www\./, '') !== canonicalHost) {
    throw new Error('Page filter must belong to the configured site');
  }
  absolute.hash = '';
  return absolute.toString();
}

function clampRowLimit(value?: number): number {
  if (!Number.isFinite(value)) {
    return 100;
  }
  return Math.min(1000, Math.max(1, Math.trunc(value ?? 100)));
}

function normalizeMetricRows(rows: Array<Record<string, unknown>> | undefined): SearchMetricRow[] {
  return (rows ?? []).map((row) => ({
    key: Array.isArray(row['keys']) ? String(row['keys'][0] ?? '') : '',
    clicks: Number(row['clicks'] ?? 0),
    impressions: Number(row['impressions'] ?? 0),
    ctr: Number(row['ctr'] ?? 0),
    position: Number(row['position'] ?? 0),
  }));
}

function normalizeTotals(rows: Array<Record<string, unknown>> | undefined): SearchTotals {
  const row = normalizeMetricRows(rows)[0];
  return row
    ? {
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return (current - previous) / previous;
}

function buildComparison(current: SearchTotals, previous: SearchTotals) {
  return {
    clicks: percentChange(current.clicks, previous.clicks),
    impressions: percentChange(current.impressions, previous.impressions),
    ctr: current.ctr - previous.ctr,
    position: current.position - previous.position,
  };
}

function buildDimensionFilter(page?: string) {
  return page
    ? [
      {
        filters: [{ dimension: 'page', operator: 'equals', expression: page }],
      },
    ]
    : undefined;
}

function buildOpportunities(rows: SearchMetricRow[]) {
  return rows
    .filter((row) => row.impressions >= 10 && row.position >= 3 && row.position <= 20)
    .map((row) => ({
      ...row,
      score: Math.round(row.impressions * Math.max(0, 0.12 - row.ctr) * 100) / 100,
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

export async function getSearchPerformance(options: SearchPerformanceOptions = {}) {
  try {
    const sc = getSearchConsole();
    const page = normalizePageFilter(options.page);
    const rowLimit = clampRowLimit(options.rowLimit);
    const windows = getComparisonWindows();
    const dimensionFilterGroups = buildDimensionFilter(page);

    const { siteUrl, data } = await runWithSearchConsoleSite(async (siteUrl) => {
      const query = (window: DateWindow, dimensions?: string[], limit = rowLimit) =>
        sc.searchanalytics.query({
          siteUrl,
          requestBody: {
            ...window,
            ...(dimensions ? { dimensions } : {}),
            ...(dimensionFilterGroups ? { dimensionFilterGroups } : {}),
            rowLimit: limit,
            dataState: 'final',
          },
        });

      const [currentTotals, previousTotals, daily, queries, pages, devices] = await Promise.all([
        query(windows.current, undefined, 1),
        query(windows.previous, undefined, 1),
        query(windows.current, ['date'], 1000),
        query(windows.current, ['query']),
        query(windows.current, ['page']),
        query(windows.current, ['device'], 10),
      ]);

      return {
        currentTotals: currentTotals.data.rows,
        previousTotals: previousTotals.data.rows,
        daily: daily.data.rows,
        queries: queries.data.rows,
        pages: pages.data.rows,
        devices: devices.data.rows,
      };
    });

    const current = normalizeTotals(
      data.currentTotals as Array<Record<string, unknown>> | undefined,
    );
    const previous = normalizeTotals(
      data.previousTotals as Array<Record<string, unknown>> | undefined,
    );
    const queries = normalizeMetricRows(data.queries as Array<Record<string, unknown>> | undefined);

    return {
      ok: true,
      property: siteUrl,
      page: page ?? null,
      windows,
      totals: { current, previous, change: buildComparison(current, previous) },
      daily: normalizeMetricRows(data.daily as Array<Record<string, unknown>> | undefined).map(
        (row) => ({ ...row, date: row.key }),
      ),
      queries: queries.map((row) => ({ ...row, query: row.key })),
      pages: normalizeMetricRows(data.pages as Array<Record<string, unknown>> | undefined).map(
        (row) => ({ ...row, page: row.key }),
      ),
      devices: normalizeMetricRows(data.devices as Array<Record<string, unknown>> | undefined).map(
        (row) => ({ ...row, device: row.key }),
      ),
      opportunities: buildOpportunities(queries).map((row) => ({ ...row, query: row.key })),
    };
  } catch (error) {
    return {
      ok: false,
      property: null,
      page: options.page ?? null,
      windows: getComparisonWindows(),
      totals: null,
      daily: [],
      queries: [],
      pages: [],
      devices: [],
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getIndexingStatus() {
  const performance = await getSearchPerformance({ rowLimit: 10 });
  return {
    ok: performance.ok,
    property: performance.property ?? undefined,
    queries: performance.queries.map((row) => ({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })),
    ...(!performance.ok ? { error: performance.error } : {}),
  };
}

export async function getSitemapStatus() {
  try {
    const sc = getSearchConsole();
    const { siteUrl, data: response } = await runWithSearchConsoleSite((siteUrl) =>
      sc.sitemaps.list({ siteUrl }),
    );

    const sitemaps = extractSitemapEntries(response.data);
    return {
      ok: true,
      property: siteUrl,
      sitemaps: sitemaps.map((sitemap) => ({
        path: sitemap.path ?? '',
        type: sitemap.type ?? '',
        lastSubmitted: sitemap.lastSubmitted ?? '',
        lastDownloaded: sitemap.lastDownloaded ?? '',
        isPending: sitemap.isPending ?? false,
        isSitemapsIndex: sitemap.isSitemapsIndex ?? false,
        errors: Number(sitemap.errors ?? 0),
        warnings: Number(sitemap.warnings ?? 0),
        contents: (sitemap.contents ?? []).map((content) => ({
          type: content.type ?? '',
          submitted: Number(content.submitted ?? 0),
          indexed: Number(content.indexed ?? 0),
        })),
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
    const windows = getComparisonWindows();
    const { siteUrl } = await runWithSearchConsoleSite((siteUrl) =>
      sc.searchanalytics.query({
        siteUrl,
        requestBody: { ...windows.current, rowLimit: 1, dataState: 'final' },
      }),
    );
    return {
      ok: true,
      connected: true,
      readonly: true,
      property: siteUrl,
      candidates: getSearchConsoleSiteCandidates(),
    };
  } catch (error) {
    return {
      ok: false,
      connected: false,
      readonly: true,
      property: null,
      candidates: getSearchConsoleSiteCandidates(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const __testing = {
  buildComparison,
  buildOpportunities,
  clampRowLimit,
  extractSitemapEntries,
  getComparisonWindows,
  getSearchConsoleSiteCandidates,
  normalizeMetricRows,
  normalizePageFilter,
  normalizeTotals,
  percentChange,
  shouldTryNextSite,
};
