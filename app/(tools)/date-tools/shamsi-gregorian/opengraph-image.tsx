import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل تاریخ شمسی به میلادی';
const path = '/date-tools/shamsi-gregorian';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
