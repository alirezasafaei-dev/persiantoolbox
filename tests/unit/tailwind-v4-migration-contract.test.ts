import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('Tailwind v4 migration contract', () => {
  it('uses CSS-first inline theme mapping for runtime design tokens', () => {
    const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');

    expect(css).toContain("@import 'tailwindcss';");
    expect(css).toContain('@theme inline {');
  });

  it('uses the v4 PostCSS plugin without the retired v3 config path', () => {
    const postcss = fs.readFileSync(path.join(root, 'postcss.config.cjs'), 'utf8');
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      devDependencies?: Record<string, string>;
    };

    expect(postcss).toContain("'@tailwindcss/postcss': {}");
    expect(postcss).not.toContain('autoprefixer');
    expect(pkg.devDependencies?.['tailwindcss']).toMatch(/^\^?4\./);
    expect(pkg.devDependencies?.['@tailwindcss/postcss']).toMatch(/^\^?4\./);
    expect(pkg.devDependencies?.['autoprefixer']).toBeUndefined();
    expect(fs.existsSync(path.join(root, 'tailwind.config.ts'))).toBe(false);
  });
});
