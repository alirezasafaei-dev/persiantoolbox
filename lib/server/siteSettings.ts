import { query, withTransaction } from '@/lib/server/db';
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_ENV_KEYS,
  SITE_SETTINGS_KEYS,
  type PublicSiteSettings,
  type SiteSettingsPatch,
  mergeSiteSettings,
  normalizeOptionalUrl,
  normalizeText,
} from '@/lib/siteSettings';

type SiteSettingRow = {
  key: string;
  value: string | null;
};

type SiteSettingMap = Partial<Record<keyof PublicSiteSettings, string | null>>;

export class SiteSettingsStorageUnavailableError extends Error {
  constructor() {
    super('SITE_SETTINGS_STORAGE_UNAVAILABLE');
    this.name = 'SiteSettingsStorageUnavailableError';
  }
}

function hasDatabaseConnection(): boolean {
  return Boolean(process.env['DATABASE_URL']);
}

function readEnvSettings(): SiteSettingMap {
  return {
    developerName: process.env[SITE_SETTINGS_ENV_KEYS.developerName] ?? null,
    developerBrandText: process.env[SITE_SETTINGS_ENV_KEYS.developerBrandText] ?? null,
    orderUrl: process.env[SITE_SETTINGS_ENV_KEYS.orderUrl] ?? null,
    portfolioUrl: process.env[SITE_SETTINGS_ENV_KEYS.portfolioUrl] ?? null,
  };
}

function mapDbRowToField(key: string, value: string | null, target: SiteSettingMap): void {
  switch (key) {
    case SITE_SETTINGS_KEYS.developerName:
      target.developerName = value;
      break;
    case SITE_SETTINGS_KEYS.developerBrandText:
      target.developerBrandText = value;
      break;
    case SITE_SETTINGS_KEYS.orderUrl:
      target.orderUrl = value;
      break;
    case SITE_SETTINGS_KEYS.portfolioUrl:
      target.portfolioUrl = value;
      break;
    default:
      break;
  }
}

async function readDbSettings(): Promise<SiteSettingMap> {
  if (!hasDatabaseConnection()) {
    return {};
  }

  try {
    const keys = Object.values(SITE_SETTINGS_KEYS);
    const result = await query<SiteSettingRow>(
      'SELECT key, value FROM site_settings WHERE key = ANY($1::text[])',
      [keys],
    );
    const map: SiteSettingMap = {};
    for (const row of result.rows) {
      mapDbRowToField(row.key, row.value, map);
    }
    return map;
  } catch {
    // Keep footer and public pages resilient when DB is unavailable.
    return {};
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const [dbSettings, envSettings] = await Promise.all([
    readDbSettings(),
    Promise.resolve(readEnvSettings()),
  ]);
  const merged: Partial<PublicSiteSettings> = {};
  const developerName = dbSettings.developerName ?? envSettings.developerName;
  const developerBrandText = dbSettings.developerBrandText ?? envSettings.developerBrandText;
  const orderUrl = dbSettings.orderUrl ?? envSettings.orderUrl;
  const portfolioUrl = dbSettings.portfolioUrl ?? envSettings.portfolioUrl;

  if (typeof developerName === 'string') {
    merged.developerName = developerName;
  }
  if (typeof developerBrandText === 'string') {
    merged.developerBrandText = developerBrandText;
  }
  if (orderUrl !== undefined) {
    merged.orderUrl = orderUrl;
  }
  if (portfolioUrl !== undefined) {
    merged.portfolioUrl = portfolioUrl;
  }

  return mergeSiteSettings(merged, DEFAULT_SITE_SETTINGS);
}

export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<PublicSiteSettings> {
  if (!hasDatabaseConnection()) {
    throw new SiteSettingsStorageUnavailableError();
  }

  const entries: Array<{ key: string; value: string | null }> = [];
  if ('developerName' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.developerName,
      value: normalizeText(patch.developerName, DEFAULT_SITE_SETTINGS.developerName, 80),
    });
  }
  if ('developerBrandText' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.developerBrandText,
      value: normalizeText(patch.developerBrandText, DEFAULT_SITE_SETTINGS.developerBrandText, 240),
    });
  }
  if ('orderUrl' in patch) {
    entries.push({ key: SITE_SETTINGS_KEYS.orderUrl, value: normalizeOptionalUrl(patch.orderUrl) });
  }
  if ('portfolioUrl' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.portfolioUrl,
      value: normalizeOptionalUrl(patch.portfolioUrl),
    });
  }

  if (entries.length === 0) {
    return getPublicSiteSettings();
  }

  const now = Date.now();
  await withTransaction(async (tx) => {
    for (const entry of entries) {
      await tx(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [entry.key, entry.value, now],
      );
    }
  });

  return getPublicSiteSettings();
}
