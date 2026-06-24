import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'مقایسه اجاره و خرید مسکن';
const path = '/tools/rent-vs-buy';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
