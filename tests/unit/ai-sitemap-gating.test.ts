import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';

afterEach(() => vi.unstubAllEnvs());

describe('AI search indexability', () => {
  it('does not put inactive AI pages in the sitemap', () => {
    vi.stubEnv('FEATURE_AI_CHAT_ENABLED', 'false');
    vi.stubEnv('AI_CLOUDFLARE_FREE_PLAN_CONFIRMED', 'true');
    const urls = sitemap().map((item) => new URL(item.url).pathname);
    expect(urls).not.toContain('/ai');
    expect(urls).not.toContain('/ai/chat');
  });

  it('lists only live AI routes after both safety gates are enabled', () => {
    vi.stubEnv('FEATURE_AI_CHAT_ENABLED', 'true');
    vi.stubEnv('AI_CLOUDFLARE_FREE_PLAN_CONFIRMED', 'true');
    const urls = sitemap().map((item) => new URL(item.url).pathname);
    expect(urls).toContain('/ai');
    expect(urls).toContain('/ai/chat');
    expect(urls).not.toContain('/ai/image');
  });
});
