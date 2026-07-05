import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تحلیل عنوان سئو';
const path = '/seo-tools/seo-title-analyzer';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
