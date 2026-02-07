import { getAdsConsent } from '@/shared/consent/adsConsent';

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
const ID_MAX_LENGTH = 80;

export interface AdPerformanceRow {
  id: string;
  views: number;
  clicks: number;
  ctr: number;
}

export interface AdPerformanceReport {
  generatedAt: number;
  windowDays: number;
  totals: {
    views: number;
    clicks: number;
    ctr: number;
    slots: number;
    campaigns: number;
  };
  bySlot: AdPerformanceRow[];
  byCampaign: AdPerformanceRow[];
}

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

function hasConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return getAdsConsent().contextualAds;
}

function normalizeId(value: string): string {
  return value.trim().slice(0, ID_MAX_LENGTH);
}

function toCtr(views: number, clicks: number): number {
  if (views <= 0) {
    return 0;
  }
  return Number(((clicks / views) * 100).toFixed(2));
}

export function recordAdView(slotId: string, campaignId?: string) {
  if (typeof window === 'undefined' || !hasConsent()) {
    return;
  }

  const safeSlotId = normalizeId(slotId);
  if (!safeSlotId) {
    return;
  }

  const events = readEvents();
  const event: AdEvent = {
    type: 'view',
    slotId: safeSlotId,
    timestamp: Date.now(),
    path: window.location.pathname,
  };

  if (campaignId !== undefined) {
    const safeCampaignId = normalizeId(campaignId);
    if (safeCampaignId) {
      event.campaignId = safeCampaignId;
    }
  }

  events.push(event);
  writeEvents(events);
}

export function recordAdClick(slotId: string, campaignId?: string) {
  if (typeof window === 'undefined' || !hasConsent()) {
    return;
  }

  const safeSlotId = normalizeId(slotId);
  if (!safeSlotId) {
    return;
  }

  const events = readEvents();
  const event: AdEvent = {
    type: 'click',
    slotId: safeSlotId,
    timestamp: Date.now(),
    path: window.location.pathname,
  };

  if (campaignId !== undefined) {
    const safeCampaignId = normalizeId(campaignId);
    if (safeCampaignId) {
      event.campaignId = safeCampaignId;
    }
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

export function getAdPerformanceReport(days = 30): AdPerformanceReport {
  const events = readEvents();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const bySlotMap = new Map<string, { views: number; clicks: number }>();
  const byCampaignMap = new Map<string, { views: number; clicks: number }>();

  for (const event of events) {
    if (event.timestamp < cutoff) {
      continue;
    }

    const slot = bySlotMap.get(event.slotId) ?? { views: 0, clicks: 0 };
    if (event.type === 'view') {
      slot.views += 1;
    } else {
      slot.clicks += 1;
    }
    bySlotMap.set(event.slotId, slot);

    if (event.campaignId) {
      const campaign = byCampaignMap.get(event.campaignId) ?? { views: 0, clicks: 0 };
      if (event.type === 'view') {
        campaign.views += 1;
      } else {
        campaign.clicks += 1;
      }
      byCampaignMap.set(event.campaignId, campaign);
    }
  }

  const bySlot = Array.from(bySlotMap.entries())
    .map(([id, value]) => ({
      id,
      views: value.views,
      clicks: value.clicks,
      ctr: toCtr(value.views, value.clicks),
    }))
    .sort((a, b) => b.views - a.views);

  const byCampaign = Array.from(byCampaignMap.entries())
    .map(([id, value]) => ({
      id,
      views: value.views,
      clicks: value.clicks,
      ctr: toCtr(value.views, value.clicks),
    }))
    .sort((a, b) => b.views - a.views);

  const totalViews = bySlot.reduce((sum, row) => sum + row.views, 0);
  const totalClicks = bySlot.reduce((sum, row) => sum + row.clicks, 0);

  return {
    generatedAt: Date.now(),
    windowDays: days,
    totals: {
      views: totalViews,
      clicks: totalClicks,
      ctr: toCtr(totalViews, totalClicks),
      slots: bySlot.length,
      campaigns: byCampaign.length,
    },
    bySlot,
    byCampaign,
  };
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

export function exportAdPerformanceReport(days = 30): string {
  return JSON.stringify(getAdPerformanceReport(days), null, 2);
}
