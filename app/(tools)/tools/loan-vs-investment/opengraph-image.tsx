import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'مقایسه وام با سرمایه‌گذاری';
const path = '/tools/loan-vs-investment';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
