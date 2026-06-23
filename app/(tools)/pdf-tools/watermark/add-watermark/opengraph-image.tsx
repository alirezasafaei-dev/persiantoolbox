import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'افزودن واترمارک PDF';
const path = '/pdf-tools/watermark/add-watermark';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
