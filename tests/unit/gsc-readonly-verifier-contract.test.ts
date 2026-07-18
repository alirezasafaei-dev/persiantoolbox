import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.join(process.cwd(), 'scripts/quality/verify-gsc-readonly.mjs'),
  'utf8',
);

describe('GSC readonly verifier contract', () => {
  it('uses only the readonly Search Console scope', () => {
    expect(source).toContain('https://www.googleapis.com/auth/webmasters.readonly');
    expect(source.match(/https:\/\/www\.googleapis\.com\/auth\/webmasters(?!\.readonly)/g)).toBeNull();
  });

  it('does not call Search Console write operations', () => {
    expect(source).not.toMatch(/\.submit\s*\(/);
    expect(source).not.toMatch(/\.delete\s*\(/);
    expect(source).not.toMatch(/\.add\s*\(/);
  });

  it('requires protected local credential-file permissions', () => {
    expect(source).toContain('(stat.mode & 0o077) !== 0');
    expect(source).toContain('chmod 600');
  });
});
