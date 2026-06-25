import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'روز هفته';
const path = '/date-tools/weekday-finder';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
