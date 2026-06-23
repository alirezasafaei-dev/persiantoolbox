import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'چرخش تصویر';
const path = '/image-tools/rotate-image';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
