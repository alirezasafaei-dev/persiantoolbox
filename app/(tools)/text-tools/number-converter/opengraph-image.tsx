import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تبدیل اعداد';
const path = '/text-tools/number-converter';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
