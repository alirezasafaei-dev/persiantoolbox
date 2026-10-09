import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import BlogCard from '@/components/features/blog/BlogCard';
import { getPostBySlug } from '@/lib/blog';

afterEach(() => vi.restoreAllMocks());

it('keeps the publication day identical across server and western browser timezones', () => {
  const post = { ...getPostBySlug('json-formatter-for-api-debugging'), wordCount: 200 };
  const originalFormat = Date.prototype.toLocaleDateString;
  let runtimeTimeZone = 'UTC';
  vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function (
    this: Date,
    locale,
    options,
  ) {
    return originalFormat.call(this, locale, {
      ...options,
      timeZone: options?.timeZone ?? runtimeTimeZone,
    });
  });
  const extractDay = () =>
    renderToString(<BlogCard post={post} />).match(/<time[^>]*>(.*?)<\/time>/)?.[1];
  const serverDay = extractDay();
  expect(serverDay).toBeTruthy();
  runtimeTimeZone = 'America/New_York';
  expect(extractDay()).toBe(serverDay);
});
