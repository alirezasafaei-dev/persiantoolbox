import { describe, expect, it } from 'vitest';
import { buildDefaultToolContent, toolsRegistry } from '@/lib/tools-registry';

describe('tool SEO default content factory', () => {
  it('covers every tool kind=tool with intro and faq', () => {
    const tools = toolsRegistry.filter((t) => t.kind === 'tool');
    expect(tools.length).toBeGreaterThan(50);
    for (const tool of tools) {
      expect(tool.content?.intro?.length ?? 0).toBeGreaterThan(40);
      expect(tool.content?.faq?.length ?? 0).toBeGreaterThanOrEqual(2);
    }
  });

  it('builds unique-ish intros from title/description', () => {
    const a = buildDefaultToolContent({
      title: 'شمارنده کلمات',
      description: 'شمارش کلمات و کاراکتر فارسی',
      category: { id: 'text-tools', name: 'ابزارهای متنی', path: '/text-tools' },
      tier: 'Offline-Guaranteed',
      kind: 'tool',
    });
    const b = buildDefaultToolContent({
      title: 'محاسبه وام',
      description: 'اقساط و سود وام بانکی',
      category: { id: 'finance-tools', name: 'ابزارهای مالی', path: '/tools' },
      tier: 'Offline-Guaranteed',
      kind: 'tool',
    });
    expect(a.intro).toContain('شمارنده کلمات');
    expect(b.intro).toContain('محاسبه وام');
    expect(a.intro).not.toEqual(b.intro);
  });
});
