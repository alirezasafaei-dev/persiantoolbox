import { existsSync, mkdirSync, readFileSync, writeFile } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { AdSlot, AdCampaign } from '@/shared/monetization/monetizationStore';
import { logger } from './logger';

export class MonetizationStorageUnavailableError extends Error {
  constructor() {
    super('MONETIZATION_STORAGE_UNAVAILABLE');
    this.name = 'MonetizationStorageUnavailableError';
  }
}

const MONETIZATION_ENV_KEY = 'MONETIZATION_STORAGE_PATH';
const MONETIZATION_DEFAULT_PATH = '.data/monetization.json';

type MonetizationData = {
  slots: AdSlot[];
  campaigns: AdCampaign[];
};

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

function getMonetizationData(): MonetizationData {
  try {
    const path = resolveMonetizationPath();
    if (!existsSync(path)) {
      return { slots: [], campaigns: [] };
    }
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data) as { slots: AdSlot[]; campaigns: AdCampaign[] };
  } catch (error) {
    logger.warn('Failed to read monetization data, returning empty', {
      error: error instanceof Error ? error.message : String(error),
      path: resolveMonetizationPath(),
    });
    return { slots: [], campaigns: [] };
  }
}

function setMonetizationData(data: MonetizationData): void {
  const path = resolveMonetizationPath();
  ensureMonetizationDirectory(path);
  writeFile(path, JSON.stringify(data, null, 2), 'utf-8', (error) => {
    if (error) {
      logger.error('Failed to write monetization data', {
        error: error.message,
        path,
      });
      throw error;
    }
  });
}

export async function getMonetizationSlots(): Promise<AdSlot[]> {
  try {
    const data = getMonetizationData();
    return data.slots;
  } catch (error) {
    logger.error('Failed to get monetization slots', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new MonetizationStorageUnavailableError();
  }
}

export async function getMonetizationCampaigns(): Promise<AdCampaign[]> {
  try {
    const data = getMonetizationData();
    return data.campaigns;
  } catch (error) {
    logger.error('Failed to get monetization campaigns', {
      error: error instanceof Error ? error.message : String(error),
    });
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
  } catch (error) {
    logger.error('Failed to add monetization slot', {
      error: error instanceof Error ? error.message : String(error),
      slotData: slot,
    });
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
  } catch (error) {
    logger.error('Failed to update monetization slot', {
      error: error instanceof Error ? error.message : String(error),
      slotId: _id,
      updates,
    });
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
  } catch (error) {
    logger.error('Failed to remove monetization slot', {
      error: error instanceof Error ? error.message : String(error),
      slotId: _id,
    });
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
  } catch (error) {
    logger.error('Failed to add monetization campaign', {
      error: error instanceof Error ? error.message : String(error),
      campaignData: campaign,
    });
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
  } catch (error) {
    logger.error('Failed to update monetization campaign', {
      error: error instanceof Error ? error.message : String(error),
      campaignId: _id,
      updates,
    });
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
  } catch (error) {
    logger.error('Failed to remove monetization campaign', {
      error: error instanceof Error ? error.message : String(error),
      campaignId: _id,
    });
    throw new MonetizationStorageUnavailableError();
  }
}
