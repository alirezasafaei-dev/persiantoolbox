import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی Open Graph';
const path = '/seo-tools/open-graph-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
