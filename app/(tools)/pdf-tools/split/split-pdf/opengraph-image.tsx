import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تقسیم PDF';
const path = '/pdf-tools/split/split-pdf';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
