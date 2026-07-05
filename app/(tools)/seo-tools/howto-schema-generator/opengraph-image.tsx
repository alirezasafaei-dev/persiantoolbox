import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'مولد HowTo Schema';
const path = '/seo-tools/howto-schema-generator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
