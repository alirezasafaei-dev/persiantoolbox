import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل Word به PDF';
const path = '/pdf-tools/convert/word-to-pdf';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
