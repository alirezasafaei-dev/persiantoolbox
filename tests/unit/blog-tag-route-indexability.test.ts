import { describe, expect, it } from 'vitest';
import { generateMetadata } from '@/app/blog/tag/[tag]/page';

describe('blog tag route indexability', () => {
  it('decodes percent-encoded Persian tag params before lookup', async () => {
    const tag = 'مالی';
    const metadata = await generateMetadata({
      params: Promise.resolve({ tag: encodeURIComponent(tag) }),
    });

    expect(metadata.title).toContain(tag);
    expect(metadata.title).not.toBe('برچسب یافت نشد');
    expect(metadata.robots).not.toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toContain(encodeURIComponent(tag));
  });
});
