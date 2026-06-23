import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل فرمت تصویر';
const path = '/image-tools/image-format-converter';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
