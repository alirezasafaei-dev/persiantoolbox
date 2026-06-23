import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'قدرت خرید واقعی';
const path = '/tools/real-purchasing-power';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
