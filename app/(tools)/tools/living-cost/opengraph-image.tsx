import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه هزینه زندگی';
const path = '/tools/living-cost';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
