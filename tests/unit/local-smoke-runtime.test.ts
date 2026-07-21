import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  prepareStandaloneRuntime,
  resolveReleaseSha,
} from '../../scripts/quality/run-local-smoke.mjs';

const temporaryRoots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'persiantoolbox-smoke-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(() => {
  delete process.env.SMOKE_RELEASE_SHA;
  while (temporaryRoots.length > 0) {
    const root = temporaryRoots.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

describe('local standalone smoke runtime', () => {
  it('copies immutable static and public assets into the standalone tree', () => {
    const root = createRoot();
    mkdirSync(join(root, '.next/standalone'), { recursive: true });
    mkdirSync(join(root, '.next/static/chunks'), { recursive: true });
    mkdirSync(join(root, 'public/icons'), { recursive: true });
    writeFileSync(join(root, '.next/standalone/server.js'), 'process.exit(0);\n');
    writeFileSync(join(root, '.next/static/chunks/app.js'), 'console.log("app");\n');
    writeFileSync(join(root, 'public/icons/icon.svg'), '<svg/>\n');

    const runtime = prepareStandaloneRuntime(root);

    expect(runtime.serverPath).toBe(join(root, '.next/standalone/server.js'));
    expect(readFileSync(join(runtime.targetStatic, 'chunks/app.js'), 'utf8')).toContain('app');
    expect(readFileSync(join(runtime.targetPublic, 'icons/icon.svg'), 'utf8')).toContain('svg');
  });

  it('rejects a build without the standalone server entrypoint', () => {
    const root = createRoot();
    mkdirSync(join(root, '.next/static'), { recursive: true });
    mkdirSync(join(root, 'public'), { recursive: true });

    expect(() => prepareStandaloneRuntime(root)).toThrow('Standalone server is missing');
  });

  it('requires exact immutable SHA metadata', () => {
    process.env.SMOKE_RELEASE_SHA = 'abc123';
    expect(() => resolveReleaseSha(createRoot())).toThrow(
      'SMOKE_RELEASE_SHA must be an exact 40-character SHA',
    );

    process.env.SMOKE_RELEASE_SHA = 'a'.repeat(40);
    expect(resolveReleaseSha(createRoot())).toBe('a'.repeat(40));
  });
});
