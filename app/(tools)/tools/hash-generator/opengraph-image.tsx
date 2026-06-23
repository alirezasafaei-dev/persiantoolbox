import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'تولید هش';
const path = '/tools/hash-generator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
