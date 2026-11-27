import { createToolOgImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const runtime = 'nodejs';

const title = 'حذف صفحات PDF';
const path = '/pdf-tools/edit/delete-pages';

export default async function OpenGraphImage() {
  return createToolOgImage(title, path);
}
