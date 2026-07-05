import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی چگالی کلمات کلیدی فارسی';
const path = '/seo-tools/persian-keyword-density-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
