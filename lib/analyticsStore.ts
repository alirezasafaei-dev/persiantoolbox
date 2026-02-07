import fs from 'node:fs/promises';
import path from 'node:path';

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

async function readSummary(): Promise<AnalyticsSummary> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as AnalyticsSummary;
    return {
      ...DEFAULT_SUMMARY,
      ...parsed,
      eventCounts: { ...DEFAULT_SUMMARY.eventCounts, ...(parsed.eventCounts ?? {}) },
      pathCounts: { ...DEFAULT_SUMMARY.pathCounts, ...(parsed.pathCounts ?? {}) },
      version: 1,
    };
  } catch {
    return { ...DEFAULT_SUMMARY };
  }
}

async function writeSummary(summary: AnalyticsSummary): Promise<void> {
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

export async function ingestAnalyticsEvents(events: AnalyticsEvent[]): Promise<AnalyticsSummary> {
  const summary = await readSummary();
  const safeEvents = events
    .map((item) => sanitizeEvent(item))
    .filter((item): item is AnalyticsEvent => item !== null);

  if (safeEvents.length === 0) {
    return summary;
  }

  safeEvents.forEach((event) => {
    summary.totalEvents += 1;
    summary.eventCounts[event.event] = (summary.eventCounts[event.event] ?? 0) + 1;
    summary.pathCounts[event.path] = (summary.pathCounts[event.path] ?? 0) + 1;
  });

  summary.lastUpdated = Date.now();
  summary.version = 1;

  await writeSummary(summary);
  return summary;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return readSummary();
}
