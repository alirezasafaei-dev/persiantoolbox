import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'بررسی لینک شکسته یک صفحه';
const path = '/seo-tools/broken-link-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
