import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'حذف فاصله‌های اضافی';
const path = '/text-tools/remove-spaces';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
