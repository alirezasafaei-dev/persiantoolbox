import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'مولد متا دیسکریپشن فارسی';
const path = '/seo-tools/meta-description-generator';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
