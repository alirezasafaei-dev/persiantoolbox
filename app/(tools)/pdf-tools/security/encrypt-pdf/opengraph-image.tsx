import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'رمزگذاری PDF';
const path = '/pdf-tools/security/encrypt-pdf';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
