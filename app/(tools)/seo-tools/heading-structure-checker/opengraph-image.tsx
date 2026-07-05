import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی ساختار H1 تا H6';
const path = '/seo-tools/heading-structure-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
