import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
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

const SQLITE_ENV_KEY = 'SITE_SETTINGS_SQLITE_PATH';
const SQLITE_DEFAULT_PATH = '.data/site-settings.sqlite';

let sqliteDb: DatabaseSync | null = null;

export class SiteSettingsStorageUnavailableError extends Error {
  constructor() {
    super('SITE_SETTINGS_STORAGE_UNAVAILABLE');
    this.name = 'SiteSettingsStorageUnavailableError';
  }
}

function resolveSqlitePath(): string {
  return resolve(process.cwd(), process.env[SQLITE_ENV_KEY] ?? SQLITE_DEFAULT_PATH);
}

function ensureSqliteDirectory(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getSqliteDb(): DatabaseSync {
  if (sqliteDb) {
    return sqliteDb;
  }

  try {
    const sqlitePath = resolveSqlitePath();
    ensureSqliteDirectory(sqlitePath);
    const db = new DatabaseSync(sqlitePath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER NOT NULL
      )
    `);
    sqliteDb = db;
    return db;
  } catch {
    throw new SiteSettingsStorageUnavailableError();
  }
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

async function readSqliteSettings(): Promise<SiteSettingMap> {
  try {
    const db = getSqliteDb();
    const keys = Object.values(SITE_SETTINGS_KEYS);
    const placeholders = keys.map(() => '?').join(', ');
    const statement = db.prepare(
      `SELECT key, value FROM site_settings WHERE key IN (${placeholders})`,
    );
    const rows = statement.all(...keys) as SiteSettingRow[];

    const map: SiteSettingMap = {};
    for (const row of rows) {
      mapDbRowToField(row.key, row.value, map);
    }
    return map;
  } catch {
    return {};
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const [sqliteSettings, envSettings] = await Promise.all([
    readSqliteSettings(),
    Promise.resolve(readEnvSettings()),
  ]);

  const merged: Partial<PublicSiteSettings> = {};
  const developerName = sqliteSettings.developerName ?? envSettings.developerName;
  const developerBrandText = sqliteSettings.developerBrandText ?? envSettings.developerBrandText;
  const orderUrl = sqliteSettings.orderUrl ?? envSettings.orderUrl;
  const portfolioUrl = sqliteSettings.portfolioUrl ?? envSettings.portfolioUrl;

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

  try {
    const db = getSqliteDb();
    const now = Date.now();
    const statement = db.prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT (key) DO UPDATE
       SET value = excluded.value, updated_at = excluded.updated_at`,
    );

    db.exec('BEGIN');
    try {
      for (const entry of entries) {
        statement.run(entry.key, entry.value, now);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch {
    throw new SiteSettingsStorageUnavailableError();
  }

  return getPublicSiteSettings();
}
