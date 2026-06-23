import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'محاسبه تفاوت تاریخ';
const path = '/date-tools/date-difference';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
