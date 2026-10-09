import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { expect, it } from 'vitest';

it('assembles a complete local OCR runtime and valid Persian/English language data', () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'pt-ocr-assets-'));
  try {
    execFileSync(process.execPath, ['scripts/generate-ocr-assets.mjs', output]);
    const root = path.join(output, 'ocr/v7');
    expect(fs.statSync(path.join(root, 'worker.min.js')).size).toBeGreaterThan(1000);
    for (const variant of [
      '',
      '-simd',
      '-relaxedsimd',
      '-lstm',
      '-simd-lstm',
      '-relaxedsimd-lstm',
    ]) {
      for (const suffix of ['.wasm', '.wasm.js']) {
        expect(
          fs.statSync(path.join(root, 'core', `tesseract-core${variant}${suffix}`)).size,
        ).toBeGreaterThan(1000);
      }
    }
    for (const lang of ['fas', 'eng']) {
      const data = zlib.gunzipSync(
        fs.readFileSync(path.join(root, 'lang', `${lang}.traineddata.gz`)),
      );
      expect(data.length).toBeGreaterThan(1000);
    }
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});
