import fs from 'node:fs/promises';
import path from 'node:path';
import { query, withTransaction } from '@/lib/server/db';

export type AnalyticsEvent = {
  event: string;
  timestamp: number;
  path: string;
  metadata?: Record<string, unknown>;
};

export type AnalyticsSummary = {
  lastUpdated: number | null;
  totalEvents: number;
  eventCounts: Record<string, number>;
  pathCounts: Record<string, number>;
  version: 1;
};

const DEFAULT_SUMMARY: AnalyticsSummary = {
  lastUpdated: null,
  totalEvents: 0,
  eventCounts: {},
  pathCounts: {},
  version: 1,
};

const ANALYTICS_DIR =
  process.env['ANALYTICS_DATA_DIR'] ?? path.join(process.cwd(), 'var', 'analytics');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'summary.json');
const STORAGE_MODE_ENV = 'ANALYTICS_STORAGE';
type AnalyticsStorageMode = 'file' | 'postgres';

function resolveStorageMode(): AnalyticsStorageMode {
  const raw = String(process.env[STORAGE_MODE_ENV] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'postgres' || raw === 'pg') {
    return 'postgres';
  }
  if (raw === 'file') {
    return 'file';
  }

  // Tests should not implicitly depend on a real database.
  if (process.env['NODE_ENV'] === 'test' || process.env['VITEST']) {
    return 'file';
  }

  // Default: when a DB exists, prefer postgres for better concurrency at scale.
  if (process.env['DATABASE_URL']?.trim()) {
    return 'postgres';
  }
  return 'file';
}

const ALLOWED_METADATA_KEYS = new Set([
  'consentGranted',
  'consentVersion',
  'contextualAds',
  'targetedAds',
  'slotId',
  'campaignId',
  'href',
  'source',
  'surface',
]);

function createEmptySummary(): AnalyticsSummary {
  return { ...DEFAULT_SUMMARY };
}

function mergeSummaryDefaults(parsed: AnalyticsSummary): AnalyticsSummary {
  return {
    ...DEFAULT_SUMMARY,
    ...parsed,
    eventCounts: { ...DEFAULT_SUMMARY.eventCounts, ...(parsed.eventCounts ?? {}) },
    pathCounts: { ...DEFAULT_SUMMARY.pathCounts, ...(parsed.pathCounts ?? {}) },
    version: 1,
  };
}

async function readSummaryFromFile(): Promise<AnalyticsSummary> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as AnalyticsSummary;
    return mergeSummaryDefaults(parsed);
  } catch {
    return createEmptySummary();
  }
}

async function writeSummaryToFile(summary: AnalyticsSummary): Promise<void> {
  await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(summary, null, 2), 'utf-8');
}

function sanitizeEvent(event: AnalyticsEvent): AnalyticsEvent | null {
  if (!event || typeof event.event !== 'string' || typeof event.path !== 'string') {
    return null;
  }
  if (event.event.trim().length === 0) {
    return null;
  }
  const pathWithoutQuery = event.path.split('?')[0] ?? '';
  const safePath = pathWithoutQuery.split('#')[0] ?? '';

  return {
    event: event.event.slice(0, 60),
    timestamp: typeof event.timestamp === 'number' ? event.timestamp : Date.now(),
    path: safePath.startsWith('/') ? safePath : `/${safePath}`,
    ...(event.metadata ? { metadata: sanitizeMetadata(event.metadata) } : {}),
  };
}

function sanitizeMetadata(raw: Record<string, unknown>): Record<string, unknown> {
  const safeEntries = Object.entries(raw)
    .filter(([key]) => ALLOWED_METADATA_KEYS.has(key))
    .map(([key, value]) => [key, sanitizeMetadataValue(value)] as const)
    .filter(([, value]) => value !== undefined);

  return Object.fromEntries(safeEntries);
}

function sanitizeMetadataValue(value: unknown): unknown {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    return value.slice(0, 120);
  }
  return undefined;
}

function applyEventsToSummary(
  summary: AnalyticsSummary,
  events: AnalyticsEvent[],
): AnalyticsSummary {
  events.forEach((event) => {
    summary.totalEvents += 1;
    summary.eventCounts[event.event] = (summary.eventCounts[event.event] ?? 0) + 1;
    summary.pathCounts[event.path] = (summary.pathCounts[event.path] ?? 0) + 1;
  });
  summary.lastUpdated = Date.now();
  summary.version = 1;
  return summary;
}

let fileSummaryCache: AnalyticsSummary | null = null;
let fileFlushPromise: Promise<void> | null = null;
let fileFlushTimer: ReturnType<typeof setTimeout> | null = null;

const FILE_FLUSH_DEBOUNCE_MS = Number(process.env['ANALYTICS_FILE_FLUSH_DEBOUNCE_MS'] ?? '250');
const FILE_FLUSH_MAX_DELAY_MS = Number(process.env['ANALYTICS_FILE_FLUSH_MAX_DELAY_MS'] ?? '5000');
let fileFlushDueAt: number | null = null;

async function ensureFileSummaryLoaded(): Promise<AnalyticsSummary> {
  if (fileSummaryCache) {
    return fileSummaryCache;
  }
  fileSummaryCache = await readSummaryFromFile();
  return fileSummaryCache;
}

async function flushFileSummary(): Promise<void> {
  if (!fileSummaryCache) {
    return;
  }
  if (fileFlushPromise) {
    await fileFlushPromise;
    return;
  }

  fileFlushPromise = (async () => {
    await writeSummaryToFile(fileSummaryCache ?? createEmptySummary());
  })();

  try {
    await fileFlushPromise;
  } finally {
    fileFlushPromise = null;
  }
}

function scheduleFileFlush() {
  const now = Date.now();
  if (fileFlushDueAt === null) {
    fileFlushDueAt = now + FILE_FLUSH_MAX_DELAY_MS;
  }

  if (fileFlushTimer) {
    return;
  }

  const delay = Math.max(0, Math.min(FILE_FLUSH_DEBOUNCE_MS, (fileFlushDueAt ?? now) - now));
  fileFlushTimer = setTimeout(() => {
    fileFlushTimer = null;
    fileFlushDueAt = null;
    void flushFileSummary();
  }, delay);
}

export async function __flushAnalyticsStoreForTests(): Promise<void> {
  if (resolveStorageMode() === 'file') {
    await flushFileSummary();
  }
}

type AnalyticsCounterRow = {
  key: string;
  count: string | number;
};

async function ensureAnalyticsPgSchema(): Promise<void> {
  // Avoid doing heavy DDL at runtime; migrations are preferred. This ensures the summary row exists.
  await query(
    `INSERT INTO analytics_summary (id, total_events, last_updated)
     VALUES (1, 0, NULL)
     ON CONFLICT (id) DO NOTHING`,
  );
}

async function ingestAnalyticsEventsPostgres(events: AnalyticsEvent[]): Promise<AnalyticsSummary> {
  const safeEvents = events
    .map((item) => sanitizeEvent(item))
    .filter((item): item is AnalyticsEvent => item !== null);

  if (safeEvents.length === 0) {
    return getAnalyticsSummaryPostgres();
  }

  const eventCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  for (const ev of safeEvents) {
    eventCounts.set(ev.event, (eventCounts.get(ev.event) ?? 0) + 1);
    pathCounts.set(ev.path, (pathCounts.get(ev.path) ?? 0) + 1);
  }

  const now = Date.now();

  await ensureAnalyticsPgSchema();
  await withTransaction(async (txn) => {
    await txn(
      `UPDATE analytics_summary
       SET total_events = total_events + $1, last_updated = $2
       WHERE id = 1`,
      [safeEvents.length, now],
    );

    for (const [key, inc] of eventCounts) {
      await txn(
        `INSERT INTO analytics_counters (kind, key, count)
         VALUES ('event', $1, $2)
         ON CONFLICT (kind, key)
         DO UPDATE SET count = analytics_counters.count + EXCLUDED.count`,
        [key, inc],
      );
    }

    for (const [key, inc] of pathCounts) {
      await txn(
        `INSERT INTO analytics_counters (kind, key, count)
         VALUES ('path', $1, $2)
         ON CONFLICT (kind, key)
         DO UPDATE SET count = analytics_counters.count + EXCLUDED.count`,
        [key, inc],
      );
    }
  });

  return getAnalyticsSummaryPostgres();
}

async function getAnalyticsSummaryPostgres(): Promise<AnalyticsSummary> {
  await ensureAnalyticsPgSchema();

  const summaryResult = await query<{
    total_events: string | number;
    last_updated: string | number | null;
  }>('SELECT total_events, last_updated FROM analytics_summary WHERE id = 1');
  const summaryRow = summaryResult.rows[0] ?? null;

  const eventsResult = await query<AnalyticsCounterRow>(
    "SELECT key, count FROM analytics_counters WHERE kind = 'event'",
  );
  const pathsResult = await query<AnalyticsCounterRow>(
    "SELECT key, count FROM analytics_counters WHERE kind = 'path'",
  );

  const eventCounts: Record<string, number> = {};
  for (const row of eventsResult.rows) {
    eventCounts[row.key] = Number(row.count);
  }
  const pathCounts: Record<string, number> = {};
  for (const row of pathsResult.rows) {
    pathCounts[row.key] = Number(row.count);
  }

  return {
    version: 1,
    totalEvents: summaryRow ? Number(summaryRow.total_events) : 0,
    lastUpdated:
      summaryRow && summaryRow.last_updated !== null ? Number(summaryRow.last_updated) : null,
    eventCounts,
    pathCounts,
  };
}

async function ingestAnalyticsEventsFile(events: AnalyticsEvent[]): Promise<AnalyticsSummary> {
  const summary = await ensureFileSummaryLoaded();
  const safeEvents = events
    .map((item) => sanitizeEvent(item))
    .filter((item): item is AnalyticsEvent => item !== null);

  if (safeEvents.length === 0) {
    return summary;
  }

  applyEventsToSummary(summary, safeEvents);
  scheduleFileFlush();
  return summary;
}

async function getAnalyticsSummaryFile(): Promise<AnalyticsSummary> {
  const summary = await ensureFileSummaryLoaded();
  return summary;
}

export async function ingestAnalyticsEvents(events: AnalyticsEvent[]): Promise<AnalyticsSummary> {
  const mode = resolveStorageMode();
  if (mode === 'postgres') {
    return ingestAnalyticsEventsPostgres(events);
  }
  return ingestAnalyticsEventsFile(events);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const mode = resolveStorageMode();
  if (mode === 'postgres') {
    return getAnalyticsSummaryPostgres();
  }
  return getAnalyticsSummaryFile();
}
