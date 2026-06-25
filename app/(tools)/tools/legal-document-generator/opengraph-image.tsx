import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'سندساز حقوقی';
const path = '/tools/legal-document-generator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
