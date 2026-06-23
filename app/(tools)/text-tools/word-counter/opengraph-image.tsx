import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'شمارش کلمات';
const path = '/text-tools/word-counter';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
