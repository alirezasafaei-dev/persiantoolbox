import { existsSync, mkdirSync, readFileSync, writeFile } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { AdSlot, AdCampaign } from '@/shared/monetization/monetizationStore';

export class MonetizationStorageUnavailableError extends Error {
  constructor() {
    super('MONETIZATION_STORAGE_UNAVAILABLE');
    this.name = 'MonetizationStorageUnavailableError';
  }
}

const MONETIZATION_ENV_KEY = 'MONETIZATION_STORAGE_PATH';
const MONETIZATION_DEFAULT_PATH = '.data/monetization.json';

function resolveMonetizationPath(): string {
  return resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env[MONETIZATION_ENV_KEY] ?? MONETIZATION_DEFAULT_PATH,
  );
}

function ensureMonetizationDirectory(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getMonetizationData(): {
  slots: AdSlot[];
  campaigns: AdCampaign[];
} {
  try {
    const path = resolveMonetizationPath();
    if (!existsSync(path)) {
      return { slots: [], campaigns: [] };
    }
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data) as { slots: AdSlot[]; campaigns: AdCampaign[] };
  } catch {
    return { slots: [], campaigns: [] };
  }
}

function setMonetizationData(data: { slots: AdSlot[]; campaigns: AdCampaign[] }): void {
  const path = resolveMonetizationPath();
  ensureMonetizationDirectory(path);
  writeFile(path, JSON.stringify(data, null, 2), 'utf-8', (error) => {
    if (error) {
      throw error;
    }
  });
}

export async function getMonetizationSlots(): Promise<AdSlot[]> {
  try {
    const data = getMonetizationData();
    return data.slots;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function getMonetizationCampaigns(): Promise<AdCampaign[]> {
  try {
    const data = getMonetizationData();
    return data.campaigns;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function addMonetizationSlot(
  slot: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AdSlot> {
  try {
    const data = getMonetizationData();
    const newSlot: AdSlot = {
      ...slot,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    data.slots.push(newSlot);
    setMonetizationData(data);
    return newSlot;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function updateMonetizationSlot(
  _id: string,
  updates: Partial<Omit<AdSlot, 'id'>>,
): Promise<AdSlot | null> {
  try {
    const data = getMonetizationData();
    const index = data.slots.findIndex((slot) => slot.id === _id);
    if (index === -1) {
      return null;
    }
    const existing = data.slots[index];
    if (!existing) {
      return null;
    }
    const { id: existingId, ...rest } = existing;
    data.slots[index] = { id: existingId, ...rest, ...updates, updatedAt: Date.now() };
    setMonetizationData(data);
    return data.slots[index];
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function removeMonetizationSlot(_id: string): Promise<boolean> {
  try {
    const data = getMonetizationData();
    const index = data.slots.findIndex((slot) => slot.id === _id);
    if (index === -1) {
      return false;
    }
    data.slots.splice(index, 1);
    setMonetizationData(data);
    return true;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function addMonetizationCampaign(
  campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AdCampaign> {
  try {
    const data = getMonetizationData();
    const newCampaign: AdCampaign = {
      ...campaign,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    data.campaigns.push(newCampaign);
    setMonetizationData(data);
    return newCampaign;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function updateMonetizationCampaign(
  _id: string,
  updates: Partial<Omit<AdCampaign, 'id'>>,
): Promise<AdCampaign | null> {
  try {
    const data = getMonetizationData();
    const index = data.campaigns.findIndex((campaign) => campaign.id === _id);
    if (index === -1) {
      return null;
    }
    const existing = data.campaigns[index];
    if (!existing) {
      return null;
    }
    const { id: existingId, ...rest } = existing;
    data.campaigns[index] = { id: existingId, ...rest, ...updates, updatedAt: Date.now() };
    setMonetizationData(data);
    return data.campaigns[index];
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}

export async function removeMonetizationCampaign(_id: string): Promise<boolean> {
  try {
    const data = getMonetizationData();
    const index = data.campaigns.findIndex((campaign) => campaign.id === _id);
    if (index === -1) {
      return false;
    }
    data.campaigns.splice(index, 1);
    setMonetizationData(data);
    return true;
  } catch {
    throw new MonetizationStorageUnavailableError();
  }
}
