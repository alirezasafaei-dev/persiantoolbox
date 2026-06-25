import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه حاشیه سود';
const path = '/tools/profit-margin';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
