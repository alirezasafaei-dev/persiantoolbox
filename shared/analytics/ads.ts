import { getAdsConsent } from '@/shared/consent/adsConsent';

interface AdEvent {
  type: 'view' | 'click' | 'consent_accept' | 'consent_decline';
  slotId?: string;
  campaignId?: string;
  variantId?: string;
  source?: 'banner' | 'slot' | 'settings';
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
    variants: number;
  };
  bySlot: AdPerformanceRow[];
  byCampaign: AdPerformanceRow[];
  byVariant: AdPerformanceRow[];
  kpis: {
    revenue: {
      ctr: number;
      clicksPer100Views: number;
      topVariantId: string | null;
    };
    ux: {
      consentAccepts: number;
      consentDeclines: number;
      consentAcceptanceRate: number;
    };
  };
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

function normalizeVariant(value: string): string {
  return normalizeId(value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
}

function toCtr(views: number, clicks: number): number {
  if (views <= 0) {
    return 0;
  }
  return Number(((clicks / views) * 100).toFixed(2));
}

export function recordAdView(slotId: string, campaignId?: string, variantId?: string) {
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
  if (variantId !== undefined) {
    const safeVariant = normalizeVariant(variantId);
    if (safeVariant) {
      event.variantId = safeVariant;
    }
  }

  events.push(event);
  writeEvents(events);
}

export function recordAdClick(slotId: string, campaignId?: string, variantId?: string) {
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
  if (variantId !== undefined) {
    const safeVariant = normalizeVariant(variantId);
    if (safeVariant) {
      event.variantId = safeVariant;
    }
  }

  events.push(event);
  writeEvents(events);
}

export function recordAdConsentAction(
  action: 'accept' | 'decline',
  source: 'banner' | 'slot' | 'settings',
  slotId?: string,
  variantId?: string,
) {
  if (typeof window === 'undefined') {
    return;
  }
  const event: AdEvent = {
    type: action === 'accept' ? 'consent_accept' : 'consent_decline',
    source,
    timestamp: Date.now(),
    path: window.location.pathname,
  };
  if (slotId !== undefined) {
    const safeSlot = normalizeId(slotId);
    if (safeSlot) {
      event.slotId = safeSlot;
    }
  }
  if (variantId !== undefined) {
    const safeVariant = normalizeVariant(variantId);
    if (safeVariant) {
      event.variantId = safeVariant;
    }
  }
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function getAdStats(slotId?: string, days = 30): Record<string, AdStats> {
  const events = readEvents();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const stats: Record<string, AdStats> = {};

  for (const event of events) {
    if (event.type !== 'view' && event.type !== 'click') {
      continue;
    }
    if (event.timestamp < cutoff) {
      continue;
    }
    if (!event.slotId) {
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
  const byVariantMap = new Map<string, { views: number; clicks: number }>();
  let consentAccepts = 0;
  let consentDeclines = 0;

  for (const event of events) {
    if (event.timestamp < cutoff) {
      continue;
    }

    if (event.type === 'consent_accept') {
      consentAccepts += 1;
      continue;
    }
    if (event.type === 'consent_decline') {
      consentDeclines += 1;
      continue;
    }
    if (!event.slotId) {
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

    if (event.variantId) {
      const variant = byVariantMap.get(event.variantId) ?? { views: 0, clicks: 0 };
      if (event.type === 'view') {
        variant.views += 1;
      } else {
        variant.clicks += 1;
      }
      byVariantMap.set(event.variantId, variant);
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

  const byVariant = Array.from(byVariantMap.entries())
    .map(([id, value]) => ({
      id,
      views: value.views,
      clicks: value.clicks,
      ctr: toCtr(value.views, value.clicks),
    }))
    .sort((a, b) => b.views - a.views);

  const totalViews = bySlot.reduce((sum, row) => sum + row.views, 0);
  const totalClicks = bySlot.reduce((sum, row) => sum + row.clicks, 0);
  const consentTotal = consentAccepts + consentDeclines;
  const topVariant = byVariant
    .filter((row) => row.views > 0)
    .sort((a, b) => (b.ctr !== a.ctr ? b.ctr - a.ctr : b.views - a.views))[0];

  return {
    generatedAt: Date.now(),
    windowDays: days,
    totals: {
      views: totalViews,
      clicks: totalClicks,
      ctr: toCtr(totalViews, totalClicks),
      slots: bySlot.length,
      campaigns: byCampaign.length,
      variants: byVariant.length,
    },
    bySlot,
    byCampaign,
    byVariant,
    kpis: {
      revenue: {
        ctr: toCtr(totalViews, totalClicks),
        clicksPer100Views:
          totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0,
        topVariantId: topVariant?.id ?? null,
      },
      ux: {
        consentAccepts,
        consentDeclines,
        consentAcceptanceRate:
          consentTotal > 0 ? Number(((consentAccepts / consentTotal) * 100).toFixed(2)) : 0,
      },
    },
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
