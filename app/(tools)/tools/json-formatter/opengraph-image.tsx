import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'فرمت‌دهی JSON';
const path = '/tools/json-formatter';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
