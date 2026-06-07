export type AdSlot = {
  id: string;
  name: string;
  placement: string;
  size: string;
  active: boolean;
  createdAt: number;
  updatedAt: number | null;
};

export type AdCampaign = {
  id: string;
  name: string;
  sponsor: string;
  targetUrl: string;
  assetUrl: string;
  slotId: string | null;
  status: 'active' | 'paused';
  createdAt: number;
  updatedAt: number | null;
};

export type MonetizationStore = {
  slots: AdSlot[];
  campaigns: AdCampaign[];
  lastUpdated: number | null;
  version: 1;
};

const STORAGE_KEY = 'persian-tools.monetization.v1';
const MAX_SLOTS = 100;
const MAX_CAMPAIGNS = 250;
const MAX_TEXT_LENGTH = 160;
const MAX_URL_LENGTH = 2048;
const FALLBACK_CAMPAIGN_URL = '#';
const DEFAULT_SLOT_SIZE = 'auto';
const DEFAULT_PLACEMENT = 'inline';

const emptyStore: MonetizationStore = {
  slots: [],
  campaigns: [],
  lastUpdated: null,
  version: 1,
};

type StoredRecord = Record<string, unknown>;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is StoredRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneEmptyStore(): MonetizationStore {
  return { ...emptyStore, slots: [], campaigns: [] };
}

function normalizeText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().slice(0, MAX_TEXT_LENGTH) || fallback;
}

function normalizeTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeUrl(value: unknown, fallback = ''): string {
  const text = normalizeText(value, fallback).slice(0, MAX_URL_LENGTH);
  if (!text || text === FALLBACK_CAMPAIGN_URL) {
    return fallback;
  }

  if (text.startsWith('/')) {
    return text;
  }

  try {
    const url = new URL(text);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function normalizeAdSlot(value: unknown): AdSlot | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeText(value['id']);
  const createdAt = normalizeTimestamp(value['createdAt']);
  if (!id || createdAt === null) {
    return null;
  }

  return {
    id,
    name: normalizeText(value['name'], 'بدون نام'),
    placement: normalizeText(value['placement'], DEFAULT_PLACEMENT) || DEFAULT_PLACEMENT,
    size: normalizeText(value['size'], DEFAULT_SLOT_SIZE) || DEFAULT_SLOT_SIZE,
    active: typeof value['active'] === 'boolean' ? value['active'] : true,
    createdAt,
    updatedAt: normalizeTimestamp(value['updatedAt']),
  };
}

function normalizeCampaignStatus(value: unknown): AdCampaign['status'] {
  return value === 'paused' ? 'paused' : 'active';
}

function normalizeCampaign(value: unknown, knownSlotIds: ReadonlySet<string>): AdCampaign | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeText(value['id']);
  const createdAt = normalizeTimestamp(value['createdAt']);
  if (!id || createdAt === null) {
    return null;
  }

  const slotId = normalizeText(value['slotId']);

  return {
    id,
    name: normalizeText(value['name'], 'بدون نام'),
    sponsor: normalizeText(value['sponsor'], 'نامشخص'),
    targetUrl: normalizeUrl(value['targetUrl'], FALLBACK_CAMPAIGN_URL),
    assetUrl: normalizeUrl(value['assetUrl']),
    slotId: slotId && knownSlotIds.has(slotId) ? slotId : null,
    status: normalizeCampaignStatus(value['status']),
    createdAt,
    updatedAt: normalizeTimestamp(value['updatedAt']),
  };
}

function normalizeStore(value: unknown): MonetizationStore {
  if (!isRecord(value)) {
    return cloneEmptyStore();
  }

  const slots = (Array.isArray(value['slots']) ? value['slots'] : [])
    .map(normalizeAdSlot)
    .filter((slot): slot is AdSlot => slot !== null)
    .slice(0, MAX_SLOTS);
  const knownSlotIds = new Set(slots.map((slot) => slot.id));
  const campaigns = (Array.isArray(value['campaigns']) ? value['campaigns'] : [])
    .map((campaign) => normalizeCampaign(campaign, knownSlotIds))
    .filter((campaign): campaign is AdCampaign => campaign !== null)
    .slice(0, MAX_CAMPAIGNS);

  return {
    slots,
    campaigns,
    lastUpdated: normalizeTimestamp(value['lastUpdated']),
    version: 1,
  };
}

function readStore(): MonetizationStore {
  if (typeof window === 'undefined') {
    return cloneEmptyStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneEmptyStore();
    }
    return normalizeStore(JSON.parse(raw));
  } catch {
    return cloneEmptyStore();
  }
}

function writeStore(store: MonetizationStore): MonetizationStore {
  const normalized = normalizeStore(store);
  if (typeof window === 'undefined') {
    return normalized;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    return normalized;
  }

  return normalized;
}

export function getMonetizationStore(): MonetizationStore {
  return readStore();
}

export function addAdSlot(
  input: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>,
): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const slot: AdSlot = {
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  const next: MonetizationStore = {
    ...store,
    slots: [slot, ...store.slots].slice(0, MAX_SLOTS),
    lastUpdated: now,
    version: 1,
  };
  return writeStore(next);
}

export function updateAdSlot(id: string, patch: Partial<AdSlot>): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const slots = store.slots.map((slot) => {
    if (slot.id !== id) {
      return slot;
    }

    return {
      ...slot,
      ...patch,
      id: slot.id,
      createdAt: slot.createdAt,
      updatedAt: now,
    };
  });
  return writeStore({ ...store, slots, lastUpdated: now, version: 1 });
}

export function removeAdSlot(id: string): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const slots = store.slots.filter((slot) => slot.id !== id);
  const campaigns = store.campaigns.map((campaign) =>
    campaign.slotId === id ? { ...campaign, slotId: null, updatedAt: now } : campaign,
  );
  return writeStore({ ...store, slots, campaigns, lastUpdated: now, version: 1 });
}

export function addCampaign(
  input: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>,
): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const campaign: AdCampaign = {
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  const next: MonetizationStore = {
    ...store,
    campaigns: [campaign, ...store.campaigns].slice(0, MAX_CAMPAIGNS),
    lastUpdated: now,
    version: 1,
  };
  return writeStore(next);
}

export function updateCampaign(id: string, patch: Partial<AdCampaign>): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const campaigns = store.campaigns.map((campaign) => {
    if (campaign.id !== id) {
      return campaign;
    }

    return {
      ...campaign,
      ...patch,
      id: campaign.id,
      createdAt: campaign.createdAt,
      updatedAt: now,
    };
  });
  return writeStore({ ...store, campaigns, lastUpdated: now, version: 1 });
}

export function removeCampaign(id: string): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const campaigns = store.campaigns.filter((campaign) => campaign.id !== id);
  return writeStore({ ...store, campaigns, lastUpdated: now, version: 1 });
}
