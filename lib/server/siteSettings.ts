import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
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
import { logger } from './logger';

type SiteSettingRow = {
  key: string;
  value: string | null;
};

type SiteSettingMap = Partial<Record<keyof PublicSiteSettings, string | null>>;

type SqliteStatement = {
  all: (...params: string[]) => unknown[];
  run: (key: string, value: string | null, updatedAt: number) => unknown;
};

type SqliteDb = {
  exec: (sql: string) => void;
  prepare: (sql: string) => SqliteStatement;
};

type SqliteModule = {
  DatabaseSync: new (path: string) => SqliteDb;
};

const SQLITE_ENV_KEY = 'SITE_SETTINGS_SQLITE_PATH';
const SQLITE_DEFAULT_PATH = '.data/site-settings.sqlite';
const JSON_ENV_KEY = 'SITE_SETTINGS_STORAGE_PATH';
const JSON_DEFAULT_PATH = '.data/site-settings.json';

let sqliteDb: SqliteDb | null = null;
let sqliteCtor: (new (path: string) => SqliteDb) | null | undefined;
const nodeRequire = createRequire(import.meta.url);

class SiteSettingsStorageUnavailableError extends Error {
  constructor() {
    super('SITE_SETTINGS_STORAGE_UNAVAILABLE');
    this.name = 'SiteSettingsStorageUnavailableError';
  }
}

function resolveSqlitePath(): string {
  return resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env[SQLITE_ENV_KEY] ?? SQLITE_DEFAULT_PATH,
  );
}

function resolveJsonPath(): string {
  return resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env[JSON_ENV_KEY] ?? JSON_DEFAULT_PATH,
  );
}

function ensureStorageDirectory(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function resolveSqliteCtor(): (new (path: string) => SqliteDb) | null {
  if (sqliteCtor !== undefined) {
    return sqliteCtor;
  }

  try {
    // Optional dependency: Node 22+ exposes `node:sqlite`.
    const sqliteModule = nodeRequire('node:sqlite') as SqliteModule;
    sqliteCtor = sqliteModule.DatabaseSync;
    return sqliteCtor;
  } catch (error) {
    logger.debug('node:sqlite not available, site settings storage disabled', {
      error: error instanceof Error ? error.message : String(error),
    });
    sqliteCtor = null;
    return null;
  }
}

function getSqliteDb(): SqliteDb {
  if (sqliteDb) {
    return sqliteDb;
  }

  try {
    const SqliteCtor = resolveSqliteCtor();
    if (!SqliteCtor) {
      throw new SiteSettingsStorageUnavailableError();
    }
    const sqlitePath = resolveSqlitePath();
    ensureStorageDirectory(sqlitePath);
    const db = new SqliteCtor(sqlitePath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER NOT NULL
      )
    `);
    sqliteDb = db;
    return db;
  } catch (error) {
    logger.debug('node:sqlite not available on this Node version, site settings storage disabled', {
      error: error instanceof Error ? error.message : String(error),
      path: resolveSqlitePath(),
    });
    throw new SiteSettingsStorageUnavailableError();
  }
}

function readEnvSettings(): SiteSettingMap {
  return {
    developerName: process.env[SITE_SETTINGS_ENV_KEYS.developerName] ?? null,
    developerBrandText: process.env[SITE_SETTINGS_ENV_KEYS.developerBrandText] ?? null,
    orderUrl: process.env[SITE_SETTINGS_ENV_KEYS.orderUrl] ?? null,
    portfolioUrl: process.env[SITE_SETTINGS_ENV_KEYS.portfolioUrl] ?? null,
    contactEmail: process.env[SITE_SETTINGS_ENV_KEYS.contactEmail] ?? null,
    contactPhone: process.env[SITE_SETTINGS_ENV_KEYS.contactPhone] ?? null,
    contactAddress: process.env[SITE_SETTINGS_ENV_KEYS.contactAddress] ?? null,
    companyName: process.env[SITE_SETTINGS_ENV_KEYS.companyName] ?? null,
    telegramUrl: process.env[SITE_SETTINGS_ENV_KEYS.telegramUrl] ?? null,
    instagramUrl: process.env[SITE_SETTINGS_ENV_KEYS.instagramUrl] ?? null,
    whatsappUrl: process.env[SITE_SETTINGS_ENV_KEYS.whatsappUrl] ?? null,
    supportPageUrl: process.env[SITE_SETTINGS_ENV_KEYS.supportPageUrl] ?? null,
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
    case SITE_SETTINGS_KEYS.contactEmail:
      target.contactEmail = value;
      break;
    case SITE_SETTINGS_KEYS.contactPhone:
      target.contactPhone = value;
      break;
    case SITE_SETTINGS_KEYS.contactAddress:
      target.contactAddress = value;
      break;
    case SITE_SETTINGS_KEYS.companyName:
      target.companyName = value;
      break;
    case SITE_SETTINGS_KEYS.telegramUrl:
      target.telegramUrl = value;
      break;
    case SITE_SETTINGS_KEYS.instagramUrl:
      target.instagramUrl = value;
      break;
    case SITE_SETTINGS_KEYS.whatsappUrl:
      target.whatsappUrl = value;
      break;
    case SITE_SETTINGS_KEYS.supportPageUrl:
      target.supportPageUrl = value;
      break;
    default:
      break;
  }
}

function mapStorageKeyToField(key: string): keyof PublicSiteSettings | null {
  const match = Object.entries(SITE_SETTINGS_KEYS).find(([, storageKey]) => storageKey === key);
  return match ? (match[0] as keyof PublicSiteSettings) : null;
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
  } catch (error) {
    logger.warn('Failed to read site settings from SQLite, returning empty', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}

function readJsonSettings(): SiteSettingMap {
  const jsonPath = resolveJsonPath();
  if (!existsSync(jsonPath)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(jsonPath, 'utf-8')) as Partial<
      Record<keyof PublicSiteSettings, unknown>
    >;
    const map: SiteSettingMap = {};

    for (const field of Object.keys(SITE_SETTINGS_KEYS) as Array<keyof PublicSiteSettings>) {
      const value = parsed[field];
      if (typeof value === 'string' || value === null) {
        map[field] = value;
      }
    }

    return map;
  } catch (error) {
    logger.warn('Failed to read site settings JSON, returning empty', {
      error: error instanceof Error ? error.message : String(error),
      path: jsonPath,
    });
    return {};
  }
}

function writeJsonSettings(entries: Array<{ key: string; value: string | null }>): void {
  const jsonPath = resolveJsonPath();
  ensureStorageDirectory(jsonPath);

  const current = readJsonSettings();
  for (const entry of entries) {
    const field = mapStorageKeyToField(entry.key);
    if (field) {
      current[field] = entry.value;
    }
  }

  const tempPath = `${jsonPath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(current, null, 2)}\n`, 'utf-8');
  renameSync(tempPath, jsonPath);
}

async function readStoredSettings(): Promise<SiteSettingMap> {
  if (resolveSqliteCtor()) {
    return readSqliteSettings();
  }
  return readJsonSettings();
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const [storedSettings, envSettings] = await Promise.all([
    readStoredSettings(),
    Promise.resolve(readEnvSettings()),
  ]);

  const merged: Partial<PublicSiteSettings> = {};
  const developerName = storedSettings.developerName ?? envSettings.developerName;
  const developerBrandText = storedSettings.developerBrandText ?? envSettings.developerBrandText;
  const orderUrl = storedSettings.orderUrl ?? envSettings.orderUrl;
  const portfolioUrl = storedSettings.portfolioUrl ?? envSettings.portfolioUrl;
  const contactEmail = storedSettings.contactEmail ?? envSettings.contactEmail;
  const contactPhone = storedSettings.contactPhone ?? envSettings.contactPhone;
  const contactAddress = storedSettings.contactAddress ?? envSettings.contactAddress;
  const companyName = storedSettings.companyName ?? envSettings.companyName;
  const telegramUrl = storedSettings.telegramUrl ?? envSettings.telegramUrl;
  const instagramUrl = storedSettings.instagramUrl ?? envSettings.instagramUrl;
  const whatsappUrl = storedSettings.whatsappUrl ?? envSettings.whatsappUrl;
  const supportPageUrl = storedSettings.supportPageUrl ?? envSettings.supportPageUrl;

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
  if (typeof contactEmail === 'string') {
    merged.contactEmail = contactEmail;
  }
  if (typeof contactPhone === 'string') {
    merged.contactPhone = contactPhone;
  }
  if (typeof contactAddress === 'string') {
    merged.contactAddress = contactAddress;
  }
  if (typeof companyName === 'string') {
    merged.companyName = companyName;
  }
  if (typeof telegramUrl === 'string') {
    merged.telegramUrl = telegramUrl;
  }
  if (typeof instagramUrl === 'string') {
    merged.instagramUrl = instagramUrl;
  }
  if (typeof whatsappUrl === 'string') {
    merged.whatsappUrl = whatsappUrl;
  }
  if (typeof supportPageUrl === 'string') {
    merged.supportPageUrl = supportPageUrl;
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
  if ('contactEmail' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.contactEmail,
      value: normalizeText(patch.contactEmail, DEFAULT_SITE_SETTINGS.contactEmail, 200),
    });
  }
  if ('contactPhone' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.contactPhone,
      value: normalizeText(patch.contactPhone, DEFAULT_SITE_SETTINGS.contactPhone, 40),
    });
  }
  if ('contactAddress' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.contactAddress,
      value: normalizeText(patch.contactAddress, DEFAULT_SITE_SETTINGS.contactAddress, 300),
    });
  }
  if ('companyName' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.companyName,
      value: normalizeText(patch.companyName, DEFAULT_SITE_SETTINGS.companyName, 100),
    });
  }
  if ('telegramUrl' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.telegramUrl,
      value: normalizeText(patch.telegramUrl, DEFAULT_SITE_SETTINGS.telegramUrl, 200),
    });
  }
  if ('instagramUrl' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.instagramUrl,
      value: normalizeText(patch.instagramUrl, DEFAULT_SITE_SETTINGS.instagramUrl, 200),
    });
  }
  if ('whatsappUrl' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.whatsappUrl,
      value: normalizeText(patch.whatsappUrl, DEFAULT_SITE_SETTINGS.whatsappUrl, 200),
    });
  }
  if ('supportPageUrl' in patch) {
    entries.push({
      key: SITE_SETTINGS_KEYS.supportPageUrl,
      value: normalizeText(patch.supportPageUrl, DEFAULT_SITE_SETTINGS.supportPageUrl, 200),
    });
  }

  if (entries.length === 0) {
    return getPublicSiteSettings();
  }

  const SqliteCtor = resolveSqliteCtor();
  if (SqliteCtor) {
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
        logger.error('Failed to update site settings, transaction rolled back', {
          error: error instanceof Error ? error.message : String(error),
          entries: entries.map((e) => e.key),
        });
        throw error;
      }
    } catch (error) {
      logger.error('Failed to update site settings', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new SiteSettingsStorageUnavailableError();
    }
  } else {
    try {
      writeJsonSettings(entries);
    } catch (error) {
      logger.error('Failed to update site settings JSON', {
        error: error instanceof Error ? error.message : String(error),
        path: resolveJsonPath(),
      });
      throw new SiteSettingsStorageUnavailableError();
    }
  }

  return getPublicSiteSettings();
}
