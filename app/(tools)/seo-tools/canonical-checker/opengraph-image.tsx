import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی Canonical';
const path = '/seo-tools/canonical-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
