import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'استخراج متن از PDF';
const path = '/pdf-tools/extract/extract-text';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
