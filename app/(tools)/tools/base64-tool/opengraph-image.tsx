import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'ابزار Base64';
const path = '/tools/base64-tool';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
