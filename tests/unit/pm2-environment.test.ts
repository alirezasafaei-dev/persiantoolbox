import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function loadEnvironment(base: string, release = ''): Record<string, string> {
  const directory = mkdtempSync(join(tmpdir(), 'pt-image-pm2-env-'));
  if (
    resolve(dirname(directory)) !== resolve(tmpdir()) ||
    !basename(directory).startsWith('pt-image-pm2-env-')
  ) {
    throw new Error('Unexpected test cleanup target');
  }
  try {
    writeFileSync(join(directory, '.env'), base);
    writeFileSync(join(directory, '.env.release'), release);
    const result = spawnSync(
      process.execPath,
      ['-e', 'console.log(JSON.stringify(require(process.env.PT_TEST_CONFIG).apps[0].env))'],
      {
        encoding: 'utf8',
        env: {
          SystemRoot: process.env['SystemRoot'],
          WINDIR: process.env['WINDIR'],
          PERSIANTOOLBOX_APP_DIR: directory,
          PT_TEST_CONFIG: resolve('ecosystem.config.js'),
          NODE_OPTIONS: '',
          NODE_ENV: 'test',
          HOSTNAME: '127.0.0.1',
          PORT: '39123',
        },
      },
    );
    expect(result.status, result.stderr).toBe(0);
    return JSON.parse(result.stdout) as Record<string, string>;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('PM2 protected environment files', () => {
  it('reads shell-safe quoted image flags and verified TLS URLs without quote delimiters', () => {
    const url = 'postgresql://web@queue.invalid/images?sslmode=verify-full&sslrootcert=%2Fca.crt';
    const environment = loadEnvironment(
      `IMAGE_GENERATION_ENABLED='true'\nIMAGE_GENERATION_DATABASE_URL='${url}'\nIMAGE_GENERATION_PUBLIC_ORIGIN="https://example.invalid"\n`,
    );
    expect(environment['IMAGE_GENERATION_ENABLED']).toBe('true');
    expect(environment['IMAGE_GENERATION_DATABASE_URL']).toBe(url);
    expect(environment['IMAGE_GENERATION_PUBLIC_ORIGIN']).toBe('https://example.invalid');
  });

  it('keeps release overrides and literal text without interpolating or accepting mismatched quotes', () => {
    const environment = loadEnvironment(
      "IMAGE_GENERATION_ENABLED='true'\nLITERAL='$HOME'\nEMPTY=''\nUNQUOTED=plain=value\nBROKEN='true\n",
      "IMAGE_GENERATION_ENABLED='false'\n",
    );
    expect(environment['IMAGE_GENERATION_ENABLED']).toBe('false');
    expect(environment['LITERAL']).toBe('$HOME');
    expect(environment['EMPTY']).toBe('');
    expect(environment['UNQUOTED']).toBe('plain=value');
    expect(environment['BROKEN']).toBe("'true");
  });

  it('still removes inspector flags from quoted NODE_OPTIONS', () => {
    const environment = loadEnvironment(
      "NODE_OPTIONS='--inspect=127.0.0.1:9229 --max-old-space-size=1536'\n",
    );
    expect(environment['NODE_OPTIONS']).toBe('--max-old-space-size=1536');
    expect(environment['HOSTNAME']).toBe('127.0.0.1');
    expect(environment['PORT']).toBe('39123');
  });
});
