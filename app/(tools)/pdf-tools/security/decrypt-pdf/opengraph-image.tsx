import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'حذف رمز PDF';
const path = '/pdf-tools/security/decrypt-pdf';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
