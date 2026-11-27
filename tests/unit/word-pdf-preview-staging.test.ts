import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
