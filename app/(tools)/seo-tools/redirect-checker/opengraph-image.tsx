import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی ریدایرکت 301/302';
const path = '/seo-tools/redirect-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
