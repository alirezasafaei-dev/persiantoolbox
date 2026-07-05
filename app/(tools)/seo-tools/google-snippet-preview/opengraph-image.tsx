import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'پیش‌نمایش اسنیپت گوگل';
const path = '/seo-tools/google-snippet-preview';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
