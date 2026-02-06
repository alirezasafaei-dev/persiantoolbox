interface AdEvent {
  type: 'view' | 'click';
  slotId: string;
  campaignId?: string;
  timestamp: number;
  path: string;
}

interface AdStats {
  views: number;
  clicks: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'persian-tools.ad-analytics.v1';
const MAX_EVENTS = 1000;

function readEvents(): AdEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as AdEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AdEvent[]) {
  if (typeof window === 'undefined') {
    return;
  }
  // Keep only recent events to prevent storage bloat
  const trimmed = events.slice(-MAX_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function recordAdView(slotId: string, campaignId?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const events = readEvents();
  const event: AdEvent = {
    type: 'view',
    slotId,
    timestamp: Date.now(),
    path: window.location.pathname,
  };

  if (campaignId !== undefined) {
    event.campaignId = campaignId;
  }

  events.push(event);
  writeEvents(events);
}

export function recordAdClick(slotId: string, campaignId?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const events = readEvents();
  const event: AdEvent = {
    type: 'click',
    slotId,
    timestamp: Date.now(),
    path: window.location.pathname,
  };

  if (campaignId !== undefined) {
    event.campaignId = campaignId;
  }

  events.push(event);
  writeEvents(events);
}

export function getAdStats(slotId?: string, days = 30): Record<string, AdStats> {
  const events = readEvents();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const stats: Record<string, AdStats> = {};

  for (const event of events) {
    if (event.timestamp < cutoff) {
      continue;
    }
    if (slotId && event.slotId !== slotId) {
      continue;
    }

    const key = event.slotId;
    if (!stats[key]) {
      stats[key] = { views: 0, clicks: 0, lastUpdated: event.timestamp };
    }

    if (event.type === 'view') {
      stats[key].views++;
    } else if (event.type === 'click') {
      stats[key].clicks++;
    }

    stats[key].lastUpdated = Math.max(stats[key].lastUpdated, event.timestamp);
  }

  return stats;
}

export function getAdEvents(slotId?: string, limit = 100): AdEvent[] {
  const events = readEvents();
  let filtered = events;
  if (slotId) {
    filtered = events.filter((e) => e.slotId === slotId);
  }
  return filtered.slice(-limit);
}

export function clearAdAnalytics() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportAdAnalytics(): string {
  const events = readEvents();
  return JSON.stringify(events, null, 2);
}
