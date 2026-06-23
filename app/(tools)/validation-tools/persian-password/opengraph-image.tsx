import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'رمز عبور فارسی';
const path = '/validation-tools/persian-password';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
