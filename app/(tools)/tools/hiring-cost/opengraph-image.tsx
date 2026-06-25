import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه هزینه استخدام';
const path = '/tools/hiring-cost';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
