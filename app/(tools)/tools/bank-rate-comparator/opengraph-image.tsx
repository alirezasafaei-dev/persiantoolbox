import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'مقایسه نرخ سود بانک‌ها';
const path = '/tools/bank-rate-comparator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
