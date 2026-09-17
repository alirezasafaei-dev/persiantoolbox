import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  pnpm?: { overrides?: Record<string, string> };
};

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson;

function numericVersion(value: string): [number, number, number] {
  const match = value.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`No semver found in ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function expectAtLeast(value: string, floor: string) {
  const actual = numericVersion(value);
  const minimum = numericVersion(floor);
  expect(actual[0] * 1e6 + actual[1] * 1e3 + actual[2]).toBeGreaterThanOrEqual(
    minimum[0] * 1e6 + minimum[1] * 1e3 + minimum[2],
  );
}

describe('production dependency security floors', () => {
  it('keeps direct runtime packages above known advisory cutoffs', () => {
    expectAtLeast(pkg.dependencies?.['next'] ?? '', '16.3.3');
    expectAtLeast(pkg.devDependencies?.['sharp'] ?? '', '0.35.4');
  });

  it('keeps security-sensitive transitive overrides patched', () => {
    const overrides = pkg.pnpm?.overrides ?? {};
    expectAtLeast(overrides['fast-uri'] ?? '', '3.1.6');
    expectAtLeast(overrides['browserslist'] ?? '', '4.28.7');
    expectAtLeast(overrides['baseline-browser-mapping'] ?? '', '2.11.0');
    expectAtLeast(overrides['qs'] ?? '', '6.16.0');
    expectAtLeast(overrides['js-yaml@3.14.2'] ?? '', '3.15.2');
    expectAtLeast(overrides['js-yaml@3.15.1'] ?? '', '3.15.2');
  });
});
