import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  EMPTY_PRICING_OVERRIDES,
  mergePricingConfig,
  normalizePricingOverrides,
  type PricingOverrides,
  type PublicPricingConfig,
} from '@/lib/pricing/pricingConfig';
import { logger } from './logger';

export class PricingStorageUnavailableError extends Error {
  constructor() {
    super('PRICING_STORAGE_UNAVAILABLE');
    this.name = 'PricingStorageUnavailableError';
  }
}

const PRICING_ENV_KEY = 'PRICING_STORAGE_PATH';
const PRICING_DEFAULT_PATH = '.data/pricing.json';

function resolvePricingPath(): string {
  return resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env[PRICING_ENV_KEY] ?? PRICING_DEFAULT_PATH,
  );
}

function ensurePricingDirectory(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readOverrides(): PricingOverrides {
  try {
    const path = resolvePricingPath();
    if (!existsSync(path)) {
      return { ...EMPTY_PRICING_OVERRIDES };
    }
    const raw = readFileSync(path, 'utf-8');
    return normalizePricingOverrides(JSON.parse(raw));
  } catch (error) {
    logger.warn('Failed to read pricing data, returning defaults', {
      error: error instanceof Error ? error.message : String(error),
      path: resolvePricingPath(),
    });
    return { ...EMPTY_PRICING_OVERRIDES };
  }
}

function writeOverrides(overrides: PricingOverrides): void {
  const path = resolvePricingPath();
  ensurePricingDirectory(path);
  writeFileSync(path, JSON.stringify(overrides, null, 2), 'utf-8');
}

export async function getPricingOverrides(): Promise<PricingOverrides> {
  return readOverrides();
}

export async function getResolvedPricing(): Promise<PublicPricingConfig> {
  return mergePricingConfig(readOverrides());
}

export async function updatePricingOverrides(
  patch: Pick<PricingOverrides, 'plans' | 'topUps'>,
): Promise<PublicPricingConfig> {
  try {
    const current = readOverrides();
    const next: PricingOverrides = {
      plans: { ...current.plans, ...patch.plans },
      topUps: { ...current.topUps, ...patch.topUps },
      updatedAt: Date.now(),
    };
    writeOverrides(next);
    return mergePricingConfig(next);
  } catch (error) {
    logger.error('Failed to update pricing overrides', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new PricingStorageUnavailableError();
  }
}
