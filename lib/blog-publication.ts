export const BLOG_PUBLICATION_TIME_ZONE = 'Asia/Tehran';

export type BlogPublicationCandidate = {
  published: boolean;
  date: string;
};

export type BlogPublicationStatus = 'draft' | 'scheduled' | 'published';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getDateInTimeZone(
  now: Date = new Date(),
  timeZone: string = BLOG_PUBLICATION_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return now.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

export function isValidBlogPublicationDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function getBlogPublicationStatus(
  post: BlogPublicationCandidate,
  now: Date = new Date(),
): BlogPublicationStatus {
  if (!post.published || !isValidBlogPublicationDate(post.date)) {
    return 'draft';
  }

  return post.date <= getDateInTimeZone(now) ? 'published' : 'scheduled';
}

export function isBlogPostVisible(
  post: BlogPublicationCandidate,
  now: Date = new Date(),
): boolean {
  return getBlogPublicationStatus(post, now) === 'published';
}
