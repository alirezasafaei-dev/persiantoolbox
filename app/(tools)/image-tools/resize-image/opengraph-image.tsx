import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تغییر اندازه تصویر';
const path = '/image-tools/resize-image';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
