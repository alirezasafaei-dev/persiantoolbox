import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

describe('PWA manifest contract', () => {
  it('public/manifest.webmanifest exists', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    expect(existsSync(manifestPath)).toBe(true);
  });

  it('manifest.webmanifest is valid JSON', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  it('manifest has required PWA fields', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name || manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
  });

  it('manifest icons array exists with at least one entry', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it('manifest theme_color is set', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.theme_color).toBeTruthy();
  });

  it('manifest lang is fa', () => {
    const manifestPath = path.join(ROOT, 'public', 'manifest.webmanifest');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    expect(manifest.lang).toBe('fa');
    expect(manifest.dir).toBe('rtl');
  });
});

describe('service worker contract', () => {
  it('sw.js or sw-debug.js exists in public', () => {
    const swPath = path.join(ROOT, 'public', 'sw.js');
    const swDebugPath = path.join(ROOT, 'public', 'sw-debug.js');
    const exists = existsSync(swPath) || existsSync(swDebugPath);
    expect(exists).toBe(true);
  });

  it('sw.js is a valid JavaScript file (not empty)', () => {
    const swPath = path.join(ROOT, 'public', 'sw.js');
    if (existsSync(swPath)) {
      const content = readFileSync(swPath, 'utf-8');
      expect(content.length).toBeGreaterThan(10);
      expect(content).toContain('addEventListener');
    }
  });
});

describe('next.config security headers', () => {
  it('next.config.mjs has security headers configured', () => {
    const configPath = path.join(ROOT, 'next.config.mjs');
    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain('headers');
    expect(content).toContain('X-Frame-Options');
    expect(content).toContain('X-Content-Type-Options');
    expect(content).toContain('Referrer-Policy');
    expect(content).toContain('Permissions-Policy');
  });

  it('next.config.mjs denies iframe embedding', () => {
    const configPath = path.join(ROOT, 'next.config.mjs');
    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain("X-Frame-Options', value: 'DENY'");
  });

  it('next.config.mjs disables dangerous permissions', () => {
    const configPath = path.join(ROOT, 'next.config.mjs');
    const content = readFileSync(configPath, 'utf-8');
    expect(content).toContain('camera=()');
    expect(content).toContain('microphone=()');
    expect(content).toContain('geolocation=()');
  });
});

describe('robots and sitemap routes', () => {
  it('app/robots.ts exists and exports default function', () => {
    const robotsPath = path.join(ROOT, 'app', 'robots.ts');
    expect(existsSync(robotsPath)).toBe(true);
    const content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('allow');
    expect(content).toContain('disallow');
    expect(content).toContain('sitemap');
  });

  it('app/sitemap.ts exists', () => {
    const sitemapPath = path.join(ROOT, 'app', 'sitemap.ts');
    expect(existsSync(sitemapPath)).toBe(true);
  });

  it('robots.ts disallows admin and api routes', () => {
    const robotsPath = path.join(ROOT, 'app', 'robots.ts');
    const content = readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('/admin/');
    expect(content).toContain('/api/');
  });
});
