import { describe, expect, it } from 'vitest';
import {
  BLOG_PUBLICATION_TIME_ZONE,
  getBlogPublicationStatus,
  getDateInTimeZone,
  isBlogPostVisible,
  isValidBlogPublicationDate,
} from '@/lib/blog-publication';

describe('blog publication scheduling', () => {
  it('uses Tehran calendar date instead of the server UTC date', () => {
    const instant = new Date('2026-07-20T21:30:00.000Z');
    expect(BLOG_PUBLICATION_TIME_ZONE).toBe('Asia/Tehran');
    expect(getDateInTimeZone(instant)).toBe('2026-07-21');
  });

  it('keeps future posts hidden until their publication day in Tehran', () => {
    const post = { published: true, date: '2026-07-22' };
    expect(isBlogPostVisible(post, new Date('2026-07-21T12:00:00.000Z'))).toBe(false);
    expect(getBlogPublicationStatus(post, new Date('2026-07-21T12:00:00.000Z'))).toBe(
      'scheduled',
    );
  });

  it('publishes at the beginning of the configured calendar day', () => {
    const post = { published: true, date: '2026-07-22' };
    expect(isBlogPostVisible(post, new Date('2026-07-21T20:29:59.000Z'))).toBe(false);
    expect(isBlogPostVisible(post, new Date('2026-07-21T20:30:00.000Z'))).toBe(true);
  });

  it('never exposes drafts even when their date has passed', () => {
    const post = { published: false, date: '2026-07-01' };
    expect(getBlogPublicationStatus(post, new Date('2026-07-20T12:00:00.000Z'))).toBe('draft');
    expect(isBlogPostVisible(post, new Date('2026-07-20T12:00:00.000Z'))).toBe(false);
  });

  it('treats invalid or impossible dates as drafts', () => {
    expect(isValidBlogPublicationDate('2026-02-29')).toBe(false);
    expect(isValidBlogPublicationDate('2026/07/20')).toBe(false);
    expect(isValidBlogPublicationDate('2026-07-20')).toBe(true);
    expect(
      getBlogPublicationStatus(
        { published: true, date: 'not-a-date' },
        new Date('2026-07-20T12:00:00.000Z'),
      ),
    ).toBe('draft');
  });
});
