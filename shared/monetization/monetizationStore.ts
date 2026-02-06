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

const emptyStore: MonetizationStore = {
  slots: [],
  campaigns: [],
  lastUpdated: null,
  version: 1,
};

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readStore(): MonetizationStore {
  if (typeof window === 'undefined') {
    return { ...emptyStore };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...emptyStore };
    }
    const parsed = JSON.parse(raw) as MonetizationStore;
    return {
      ...emptyStore,
      ...parsed,
      slots: Array.isArray(parsed.slots) ? parsed.slots : [],
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      version: 1,
    };
  } catch {
    return { ...emptyStore };
  }
}

function writeStore(store: MonetizationStore): MonetizationStore {
  if (typeof window === 'undefined') {
    return store;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
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
    slots: [slot, ...store.slots],
    lastUpdated: now,
    version: 1,
  };
  return writeStore(next);
}

export function updateAdSlot(id: string, patch: Partial<AdSlot>): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const slots = store.slots.map((slot) =>
    slot.id === id
      ? {
        ...slot,
        ...patch,
        id: slot.id,
        updatedAt: now,
      }
      : slot,
  );
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
    campaigns: [campaign, ...store.campaigns],
    lastUpdated: now,
    version: 1,
  };
  return writeStore(next);
}

export function updateCampaign(id: string, patch: Partial<AdCampaign>): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const campaigns = store.campaigns.map((campaign) =>
    campaign.id === id
      ? {
        ...campaign,
        ...patch,
        id: campaign.id,
        updatedAt: now,
      }
      : campaign,
  );
  return writeStore({ ...store, campaigns, lastUpdated: now, version: 1 });
}

export function removeCampaign(id: string): MonetizationStore {
  const store = readStore();
  const now = Date.now();
  const campaigns = store.campaigns.filter((campaign) => campaign.id !== id);
  return writeStore({ ...store, campaigns, lastUpdated: now, version: 1 });
}
