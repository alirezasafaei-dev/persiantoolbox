import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, test } from 'vitest';

test('the default build rejects a staged Word preview runtime', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'word-pdf-staging-'));
  const script = resolve('scripts/stage-word-pdf-preview.mjs');
  const env = { ...process.env, NEXT_PUBLIC_WORD_PDF_PREVIEW: '0' };
  const check = () =>
    spawnSync(process.execPath, [script, '--check'], { cwd, env, encoding: 'utf8' });
  try {
    expect(check()).toMatchObject({ status: 0 });
    const runtime = join(cwd, 'public', 'word-pdf', 'v1', 'runtime');
    await mkdir(runtime, { recursive: true });
    await writeFile(join(runtime, 'NOTICE'), 'synthetic staged asset');
    expect(check()).toMatchObject({
      status: 1,
      stderr: expect.stringContaining('Move it outside public'),
    });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('the Word preview rejects replacements for the Persian font and its notice', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'word-pdf-font-'));
  const script = resolve('scripts/stage-word-pdf-preview.mjs');
  const env = { ...process.env, NEXT_PUBLIC_WORD_PDF_PREVIEW: '1' };
  const check = () =>
    spawnSync(process.execPath, [script, '--check'], { cwd, env, encoding: 'utf8' });
  try {
    const fonts = join(cwd, 'public', 'fonts');
    await mkdir(fonts, { recursive: true });
    const font = join(fonts, 'Vazirmatn-Regular.ttf');
    await writeFile(font, 'synthetic replacement font');
    expect(check()).toMatchObject({
      status: 1,
      stderr: expect.stringContaining('Vazirmatn-Regular.ttf failed verification'),
    });
    await copyFile(resolve('public/fonts/Vazirmatn-Regular.ttf'), font);
    await writeFile(join(fonts, 'OFL-Vazirmatn.txt'), 'synthetic replacement notice');
    expect(check()).toMatchObject({
      status: 1,
      stderr: expect.stringContaining('OFL-Vazirmatn.txt failed verification'),
    });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
