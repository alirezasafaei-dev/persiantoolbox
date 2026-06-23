import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل PDF به Word';
const path = '/pdf-tools/convert/pdf-to-word';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
