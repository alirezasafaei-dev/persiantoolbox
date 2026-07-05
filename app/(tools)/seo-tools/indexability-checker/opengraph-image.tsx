import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'چک ایندکس‌پذیری صفحه';
const path = '/seo-tools/indexability-checker';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
