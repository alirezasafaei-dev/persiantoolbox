import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function loadBatch() {
  const fileUrl = pathToFileURL(
    resolve(process.cwd(), 'content/scheduled-batches/2026-07-21-to-2026-08-19.mjs'),
  ).href;
  return (await import(fileUrl)) as {
    scheduledBlogArticles: Array<{
      title: string;
      slug: string;
      date: string;
      links: Array<{ label: string; url: string }>;
      cta: { label: string; url: string };
    }>;
  };
}

async function loadMaterializer() {
  const fileUrl = pathToFileURL(
    resolve(process.cwd(), 'scripts/content/materialize-scheduled-blog-batches.mjs'),
  ).href;
  return (await import(fileUrl)) as {
    renderScheduledArticle: (article: unknown) => string;
    renderScheduledCover: (article: unknown) => string;
    materializeScheduledBlogBatches: (options: {
      root?: string;
      dryRun?: boolean;
    }) => Promise<unknown[]>;
  };
}

function addUtcDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

describe('scheduled 30-day blog batch', () => {
  it('contains one unique article for every day from July 21 through August 19', async () => {
    const { scheduledBlogArticles } = await loadBatch();
    expect(scheduledBlogArticles).toHaveLength(30);
    expect(scheduledBlogArticles[0]?.date).toBe('2026-07-21');
    expect(scheduledBlogArticles.at(-1)?.date).toBe('2026-08-19');

    const slugs = scheduledBlogArticles.map((article) => article.slug);
    const dates = scheduledBlogArticles.map((article) => article.date);
    expect(new Set(slugs).size).toBe(30);
    expect(new Set(dates).size).toBe(30);

    dates.forEach((date, index) => {
      expect(date).toBe(addUtcDays('2026-07-21', index));
    });
  });

  it('uses only same-origin links and creates complete renderable outputs', async () => {
    const { scheduledBlogArticles } = await loadBatch();
    const { renderScheduledArticle, renderScheduledCover } = await loadMaterializer();

    for (const article of scheduledBlogArticles) {
      expect(article.cta.url.startsWith('/')).toBe(true);
      expect(article.links.length).toBeGreaterThanOrEqual(4);
      expect(article.links.every((link) => link.url.startsWith('/'))).toBe(true);

      const markdown = renderScheduledArticle(article);
      expect(markdown).toContain('published: true');
      expect(markdown).toContain(`date: '${article.date}'`);
      expect(markdown).toContain(`slug: '${article.slug}'`);
      expect(markdown).toContain('## چک‌لیست اجرایی');
      expect(markdown).toContain('## سوالات متداول');
      expect(markdown.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(450);

      const cover = renderScheduledCover(article);
      expect(cover.trimStart().startsWith('<svg')).toBe(true);
      expect(cover).toContain('width="1200"');
      expect(cover).toContain('height="630"');
    }
  });

  it('passes the materializer validation without writing generated files', async () => {
    const { materializeScheduledBlogBatches } = await loadMaterializer();
    const articles = await materializeScheduledBlogBatches({ dryRun: true });
    expect(articles).toHaveLength(30);
  });
});
