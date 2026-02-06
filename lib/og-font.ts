import { readFile } from 'node:fs/promises';
import path from 'node:path';

let cachedFont: ArrayBuffer | null = null;

export async function loadOgFont(): Promise<ArrayBuffer> {
  if (cachedFont) {
    return cachedFont;
  }
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Vazirmatn-Bold.ttf');
  const data = await readFile(fontPath);
  cachedFont = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  return cachedFont;
}
