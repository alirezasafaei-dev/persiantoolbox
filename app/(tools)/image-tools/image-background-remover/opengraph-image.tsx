import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'حذف پس‌زمینه تصویر';
const path = '/image-tools/image-background-remover';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
