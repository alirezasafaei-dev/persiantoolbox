import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'ابزار امضای آنلاین';
const path = '/text-tools/signature';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
