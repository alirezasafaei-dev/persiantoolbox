import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = process.env['APP_DATA_DIR'] ?? path.join(process.cwd(), 'var', 'app');

export function getDataPath(fileName: string): string {
  return path.join(DATA_DIR, fileName);
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}
