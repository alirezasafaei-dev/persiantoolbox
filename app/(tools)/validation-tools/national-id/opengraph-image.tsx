import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'اعتبارسنجی کد ملی';
const path = '/validation-tools/national-id';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
