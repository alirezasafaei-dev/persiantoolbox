import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'اعتبارسنجی کد پستی';
const path = '/validation-tools/postal-code';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
